# routes/user_routes.py - User related routes
from flask import Blueprint, request, jsonify, current_app
from utils.auth_utils import serializer
from flasgger import swag_from
from utils.auth_utils import authenticate_token

user_bp = Blueprint("user", __name__)

@user_bp.route('/register', methods=['POST'])
@swag_from({'tags': ['User']})
def register():
    data = request.get_json()
    if not data:
        return jsonify({'error': 'Missing JSON body'}), 400
    
    first_name = data.get('first_name')
    last_name = data.get('last_name')
    email = data.get('email')
    password = data.get('password')
    role = data.get('role')

    service = current_app.user_service
    success, error = service.register_user(first_name, last_name, email, password, role)
    if not success:
        return jsonify({'error': error}), 400

    return jsonify({'message': 'User created successfully'}), 201


@user_bp.route('/login', methods=['POST'])
@swag_from({'tags': ['User']})
def login():
    data = request.get_json()
    if not data:
        return jsonify({'error': 'Missing JSON body'}), 400

    email = data.get('email')
    password = data.get('password')
    if not (email and password):
        return jsonify({'error': 'Missing email or password'}), 400

    service = current_app.user_service
    user, token, error = service.login_user(email, password)

    if error:
        return jsonify({'error': error}), 401

    return jsonify({'token': token, 'user': user.to_dict()}), 200


@user_bp.route('/users/reset_password', methods=['POST'])
def reset_password():
    user, error_response, status_code = authenticate_token(current_app.user_repo)
    if error_response:
        return error_response, status_code

    data = request.get_json()
    old_pw = data.get('old_password')
    new_pw = data.get('new_password')

    if not (old_pw and new_pw):
        return jsonify({'error': 'Missing old or new password'}), 400

    service = current_app.user_service
    error = service.reset_password(user.email, old_pw, new_pw)
    if error:
        return jsonify({'error': error}), 401

    return jsonify({'message': 'Password updated successfully'}), 200


@user_bp.route('/users/profile', methods=['PUT'])
def update_profile():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')
    first_name = data.get('first_name')
    last_name = data.get('last_name')

    if not email or not password:
        return jsonify({'error': 'Email and password are required'}), 400

    service = current_app.user_service
    error = service.update_profile(email, password, first_name, last_name)
    if error:
        return jsonify({'error': error}), 400

    return jsonify({'message': 'Profile updated successfully'})