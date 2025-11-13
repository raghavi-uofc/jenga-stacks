# Databricks notebook source
# routes/member_routes.py - Member and TeamMember routes

from flask import Blueprint, request, jsonify, g
from app import mysql, auth
from flasgger import swag_from

member_bp = Blueprint('member', __name__)

@member_bp.route('/members', methods=['GET'])
@swag_from({
    'tags': ['Member'],
    'parameters': [{'name': 'projectId', 'in': 'query', 'type': 'integer', 'required': False}],
    'responses': {'200': {'description': 'List of members'}}
})
def list_members():
    project_id = request.args.get('projectId')
    cur = mysql.connection.cursor()
    if project_id:
        cur.execute("""
            SELECT DISTINCT m.* FROM Member m
            JOIN TeamMember tm ON m.id = tm.MemberId
            JOIN Team t ON tm.TeamId = t.id
            WHERE t.projectId = %s
            ORDER BY m.dateTimeUpdated DESC
        """, (project_id,))
    else:
        cur.execute("SELECT * FROM Member ORDER BY dateTimeUpdated DESC")
    members = cur.fetchall()
    cur.close()
    return jsonify({'members': members})

@member_bp.route('/members', methods=['POST'])
@swag_from({
    'tags': ['Member'],
    'parameters': [{'name': 'body', 'in': 'body', 'required': True, 'schema': {
        'type': 'object',
        'properties': {
            'firstName': {'type': 'string'},
            'lastName': {'type': 'string'}
        },
        'required': ['firstName', 'lastName']
    }}],
    'responses': {201: {'description': 'Member added'}}
})
def add_member():
    data = request.get_json()
    firstName = data.get('firstName')
    lastName = data.get('lastName')
    if not (firstName and lastName):
        return jsonify({'error': 'Missing firstName or lastName'}), 400
    cur = mysql.connection.cursor()
    cur.execute("INSERT INTO Member (firstName, lastName) VALUES (%s, %s)", (firstName, lastName))
    mysql.connection.commit()
    new_id = cur.lastrowid
    cur.close()
    return jsonify({'message': 'Member added', 'member_id': new_id}), 201