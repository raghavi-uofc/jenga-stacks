# Databricks notebook source
# project_routes.py
from flask import Blueprint, request, jsonify, current_app
from flasgger import swag_from
from utils.auth_utils import authenticate_token


project_bp = Blueprint('project', __name__)


# Save as draft endpoint
@project_bp.route('/projects/save', methods=['POST'])
def save_project_draft():
    user, error_response, status_code = authenticate_token(current_app.user_repo)
    if error_response:
        return error_response, status_code

    data = request.get_json() or {}
    print("Saving Draft Data:", data)

    try:
        project_service = current_app.project_service  # assume you attach it at app init
        project_id = project_service.save_draft(data, user.id)
        return jsonify({'message': 'Project saved as draft', 'project_id': project_id}), 200
    except ValueError as ve:
        return jsonify({'error': str(ve)}), 400
    except Exception as e:
        return jsonify({'error': str(e)}), 500


# Submit project endpoint with LLM call
@project_bp.route('/projects/submit', methods=['POST'])
def submit_project():
    user, error_response, status_code = authenticate_token(current_app.user_repo)
    if error_response:
        return error_response, status_code

    data = request.get_json() or {}
    print("Submitting Project Data:", data)

    try:
        project_service = current_app.project_service
        project_id, prompt_id, llm_text = project_service.submit_project(data, user.id)

        return jsonify({
            'message': 'Project submitted successfully',
            'project_id': project_id,
            'prompt_id': prompt_id,
            'llm_response': llm_text
        }), 200

    except ValueError as e:
        return jsonify({'error': str(e)}), 400
    except Exception as e:
        print("500: ", e, '\n')
        return jsonify({'error': str(e)}), 500


# list projects by user endpoint
@project_bp.route('/projects/user/<int:user_id>', methods=['GET'])
def list_projects_by_user(user_id):
    user, error_response, status_code = authenticate_token(current_app.user_repo)
    if error_response:
        return error_response, status_code
    if user.id != user_id:
        return jsonify({'error': 'Forbidden'}), 403

    project_service = current_app.project_service
    projects = project_service.get_projects_by_user(user_id)

    project_dicts = [project.to_dict() for project in projects]
    return jsonify({'projects': project_dicts}), 200

# Delete project endpoint
@project_bp.route('/projects/<int:project_id>', methods=['DELETE'])
def delete_project(project_id):
    user, error_response, status_code = authenticate_token(current_app.user_repo)
    if error_response:
        return error_response, status_code

    project_service = current_app.project_service
    try:
        project_service.delete_project(project_id, user.id)
        return jsonify({'message': 'Project deleted'}), 200
    except PermissionError as e:
        return jsonify({'error': str(e)}), 403
    except FileNotFoundError as e:
        return jsonify({'error': str(e)}), 404
    except Exception as e:
        print("500: ", e)
        return jsonify({'error': str(e)}), 500



# Get project details endpoint
@project_bp.route('/projects/<int:project_id>', methods=['GET'])
@swag_from({
    'tags': ['Project'],
    'parameters': [
        {'name': 'project_id', 'in': 'path', 'type': 'integer', 'required': True}
    ],
    'responses': {'200': {'description': 'Project details'},
                  '404': {'description': 'Project not found'}}
})
def get_project_details(project_id):
    user, error_response, status_code = authenticate_token(current_app.user_repo)
    if error_response:
        return error_response, status_code

    project_service = current_app.project_service
    project = project_service.get_project_details(project_id, user.id)
    if not project:
        return jsonify({'message': 'Project not found'}), 404

    return jsonify({'project': project.to_dict()}), 200
