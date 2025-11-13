# Databricks notebook source
# routes/project_routes.py - Project, Prompts, GenerationHistory routes

from flask import Blueprint, request, jsonify, g
from app import mysql, auth
import MySQLdb.cursors
from flasgger import swag_from

project_bp = Blueprint('project', __name__)

@project_bp.route('/projects', methods=['POST'])
@swag_from({
    'tags': ['Project'],
    'parameters': [{'name': 'body', 'in': 'body', 'required': True, 'schema': {
        'type': 'object',
        'properties': {
            'id': {'type': 'integer'},
            'name': {'type': 'string'},
            'requirement_description': {'type': 'string'},
            'goal_description': {'type': 'string'},
            'project_status': {'type': 'string', 'enum': ['draft', 'submitted']}
        },
        'required': ['name', 'requirement_description', 'goal_description']
    }}],
    'responses': {
        201: {'description': 'Project created'},
        200: {'description': 'Project updated'},
        400: {'description': 'Invalid input'}
    }
})
def create_or_update_project():
    data = request.get_json()
    project_id = data.get('id')
    name = data.get('name')
    requirement_description = data.get('requirement_description')
    goal_description = data.get('goal_description')
    project_status = data.get('project_status', 'draft')

    if not (name and requirement_description and goal_description):
        return jsonify({'error': 'Missing required fields'}), 400

    if project_status not in ['draft', 'submitted']:
        return jsonify({'error': 'Invalid project_status'}), 400

    cur = mysql.connection.cursor()
    if project_id:
        cur.execute("SELECT userId FROM Project WHERE id=%s", (project_id,))
        row = cur.fetchone()
        if not row or row['userId'] != g.current_user['id']:
            return jsonify({'error': 'Project not found or unauthorized'}), 404
        cur.execute(
            "UPDATE Project SET name=%s, requirement_description=%s, goal_description=%s, project_status=%s WHERE id=%s",
            (name, requirement_description, goal_description, project_status, project_id)
        )
        mysql.connection.commit()
        cur.close()
        return jsonify({'message': 'Project updated', 'project_id': project_id})
    else:
        cur.execute(
            "INSERT INTO Project (name, requirement_description, goal_description, project_status, userId) VALUES (%s, %s, %s, %s, %s)",
            (name, requirement_description, goal_description, project_status, g.current_user['id'])
        )
        mysql.connection.commit()
        new_id = cur.lastrowid
        cur.close()
        return jsonify({'message': 'Project created', 'project_id': new_id}), 201

@project_bp.route('/projects', methods=['GET'])
@swag_from({
    'tags': ['Project'],
    'parameters': [{'name': 'status', 'in': 'query', 'type': 'string', 'enum': ['draft', 'submitted'], 'required': False}],
    'responses': {'200': {'description': 'List of projects'}}
})
def list_projects():
    status = request.args.get('status')
    cur = mysql.connection.cursor(MySQLdb.cursors.DictCursor)
    if status in ['draft', 'submitted']:
        cur.execute("SELECT * FROM Project WHERE userId=%s AND project_status=%s ORDER BY dateTimeUpdated DESC", (1, status))
    else:
        cur.execute("SELECT * FROM Project WHERE userId=%s ORDER BY dateTimeUpdated DESC", (1,))
    projects = cur.fetchall()
    cur.close()
    return jsonify({'projects': projects})

@project_bp.route('/projects/<int:project_id>', methods=['GET'])
@swag_from({
    'tags': ['Project'],
    'responses': {
        200: {'description': 'Project details with prompts and generation history'},
        404: {'description': 'Project not found'}
    }
})
def get_project(project_id):
    cur = mysql.connection.cursor()
    cur.execute("SELECT * FROM Project WHERE id=%s AND userId=%s", (project_id, g.current_user['id']))
    project = cur.fetchone()
    if not project:
        return jsonify({'error': 'Project not found'}), 404

    cur.execute("SELECT * FROM Prompts WHERE projectId=%s ORDER BY version DESC", (project_id,))
    prompts = cur.fetchall()

    cur.execute("SELECT * FROM GenerationHistory WHERE projectId=%s ORDER BY dateTimeCreated DESC", (project_id,))
    generations = cur.fetchall()

    cur.close()
    return jsonify({'project': project, 'prompts': prompts, 'generation_history': generations})

@project_bp.route('/projects/<int:project_id>', methods=['DELETE'])
@swag_from({
    'tags': ['Project'],
    'responses': {
        200: {'description': 'Project deleted'},
        404: {'description': 'Project not found'}
    }
})
def delete_project(project_id):
    cur = mysql.connection.cursor()
    cur.execute("SELECT id FROM Project WHERE id=%s AND userId=%s", (project_id, g.current_user['id']))
    if not cur.fetchone():
        return jsonify({'error': 'Project not found'}), 404
    cur.execute("DELETE FROM Project WHERE id=%s", (project_id,))
    mysql.connection.commit()
    cur.close()
    return jsonify({'message': 'Project deleted'})

@project_bp.route('/projects/<int:project_id>/prompts', methods=['POST'])
@swag_from({
    'tags': ['Prompt'],
    'parameters': [{'name': 'body', 'in': 'body', 'required': True, 'schema': {
        'type': 'object',
        'properties': {
            'prompt': {'type': 'string'}
        },
        'required': ['prompt']
    }}],
    'responses': {
        201: {'description': 'Prompt added'},
        404: {'description': 'Project not found'}
    }
})
def add_prompt(project_id):
    data = request.get_json()
    prompt = data.get('prompt')
    if not prompt:
        return jsonify({'error': 'Prompt text required'}), 400

    cur = mysql.connection.cursor()
    cur.execute("SELECT id FROM Project WHERE id=%s AND userId=%s", (project_id, g.current_user['id']))
    if not cur.fetchone():
        return jsonify({'error': 'Project not found'}), 404

    cur.execute("SELECT MAX(version) as max_version FROM Prompts WHERE projectId=%s", (project_id,))
    row = cur.fetchone()
    next_version = (row['max_version'] or 0) + 1

    cur.execute("INSERT INTO Prompts (projectId, prompt, version) VALUES (%s, %s, %s)", (project_id, prompt, next_version))
    mysql.connection.commit()
    cur.close()
    return jsonify({'message': 'Prompt added', 'version': next_version}), 201

@project_bp.route('/projects/<int:project_id>/generations', methods=['POST'])
@swag_from({
    'tags': ['GenerationHistory'],
    'parameters': [{'name': 'body', 'in': 'body', 'required': True, 'schema': {
        'type': 'object',
        'properties': {
            'promptId': {'type': 'integer'},
            'llmResponse': {'type': 'string'}
        },
        'required': ['promptId', 'llmResponse']
    }}],
    'responses': {
        201: {'description': 'Generation recorded'},
        404: {'description': 'Project or prompt not found'}
    }
})
def add_generation(project_id):
    data = request.get_json()
    promptId = data.get('promptId')
    llmResponse = data.get('llmResponse')

    if not (promptId and llmResponse):
        return jsonify({'error': 'Missing promptId or llmResponse'}), 400

    cur = mysql.connection.cursor()
    cur.execute("SELECT id FROM Project WHERE id=%s AND userId=%s", (project_id, g.current_user['id']))
    if not cur.fetchone():
        return jsonify({'error': 'Project not found'}), 404

    cur.execute("SELECT id FROM Prompts WHERE id=%s AND projectId=%s", (promptId, project_id))
    if not cur.fetchone():
        return jsonify({'error': 'Prompt not found'}), 404

    cur.execute("INSERT INTO GenerationHistory (projectId, promptId, llmResponse) VALUES (%s, %s, %s)", (project_id, promptId, llmResponse))
    mysql.connection.commit()
    cur.close()
    return jsonify({'message': 'Generation history recorded'}), 201