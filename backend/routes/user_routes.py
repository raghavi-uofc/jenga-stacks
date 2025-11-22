# Databricks notebook source
# routes/user_routes.py - User related routes
import logging

from flask import Blueprint, request, jsonify, g
from app import mysql, bcrypt, auth
from utils.auth_utils import get_user_by_email, generate_token, serializer
from flasgger import swag_from

from models.user_model import insert_user

user_bp = Blueprint('user', __name__)

# USER REGISTRATION
@user_bp.route('/register', methods=['POST'])
@swag_from({
    'tags': ['User'],
    'parameters': [{'name': 'body', 'in': 'body', 'required': True, 'schema': {
        'type': 'object',
        'properties': {
            'first_name': {'type': 'string'},
            'last_name': {'type': 'string'},
            'email': {'type': 'string'},
            'password': {'type': 'string'},
            'role' : {'type': 'string'},
        },
        'required': ['first_name', 'last_name', 'email', 'password', 'role']
    }}],
    'responses': {
        201: {'description': 'User created successfully'},
        400: {'description': 'Invalid input or user exists'}
    }
})
def register():
    data = request.get_json()
    if not data:
        return jsonify({'error': 'Missing JSON body'}), 400

    first_name = data.get('first_name')
    last_name = data.get('last_name')
    email = data.get('email')
    password = data.get('password')
    role = data.get('role')

    if not (first_name and last_name and email and password and role):
        return jsonify({'error': 'Missing required fields'}), 400

    ALLOWED_ROLES = ['regular', 'admin']
    if role not in ALLOWED_ROLES:
        return jsonify({'error': f'Invalid role specified. Must be one of: {", ".join(ALLOWED_ROLES)}'}), 400

    if get_user_by_email(email):
        return jsonify({'error': 'Email already registered'}), 400

    pw_hash = bcrypt.generate_password_hash(password).decode('utf-8')
    cur = mysql.connection.cursor()
    insert_user(cur, first_name, last_name, email, pw_hash, role)
    mysql.connection.commit()
    cur.close()
    return jsonify({'message': 'User created successfully'}), 201



# USER LOGIN
@user_bp.route('/login', methods=['POST'])
@swag_from({
    'tags': ['User'],
    'parameters': [{'name': 'body', 'in': 'body', 'required': True, 'schema': {
        'type': 'object',
        'properties': {
            'email': {'type': 'string'},
            'password': {'type': 'string'}
        },
        'required': ['email', 'password']
    }}],
    'responses': {
        200: {'description': 'Login successful, returns token'},
        401: {'description': 'Invalid credentials'}
    }
})
def login():
    data = request.get_json()
    if not data:
        data = request.get_json()
    if not data:
        return jsonify({'error': 'Missing JSON body'}), 400

    email = data.get('email')
    password = data.get('password')

    if not (email and password):
        return jsonify({'error': 'Missing email or password'}), 400

    user = get_user_by_email(email)
    if not user or user['status'] != 'active':
        return jsonify({'error': 'Invalid credentials'}), 401

    if not bcrypt.check_password_hash(user['password'], password):
        return jsonify({'error': 'Invalid credentials'}), 401

    token = generate_token(user)

    return jsonify({'token': token, 'user': {'id': user['id'], 'email': user['email'], 'first_name': user['firstName'], 'last_name': user['lastName'], 'role': user['role']}})



# UPDATE PASSWORD
@user_bp.route('/users/reset_password', methods=['POST'])
def reset_password():
    # Extract token from Authorization header
    auth_header = request.headers.get('Authorization', '')
    if not auth_header.startswith('Bearer '):
        return jsonify({'error': 'Unauthorized'}), 401
    token = auth_header[len('Bearer '):]

    try:
        # Deserialize token to get email
        email = serializer.loads(token)
    except Exception as e:
        print(f"Token decode error: {e}")
        return jsonify({'error': 'Unauthorized'}), 401

    user = get_user_by_email(email)
    if not user:
        return jsonify({'error': 'User not found'}), 404

    data = request.get_json()
    old_password = data.get('old_password')
    new_password = data.get('new_password')

    if not (old_password and new_password):
        return jsonify({'error': 'Missing old or new password'}), 400

    if not bcrypt.check_password_hash(user['password'], old_password):
        return jsonify({'error': 'Old password incorrect'}), 401

    pw_hash = bcrypt.generate_password_hash(new_password).decode('utf-8')
    cur = mysql.connection.cursor()
    try:
        cur.execute("UPDATE User SET password=%s WHERE id=%s", (pw_hash, user['id']))
        mysql.connection.commit()
    finally:
        cur.close()

    return jsonify({'message': 'Password updated successfully'}), 200


# UPDATE USER PROFILE (FirstName and LastName) WITH PASSWORD CHECK
@user_bp.route('/users/profile', methods=['PUT'])
@swag_from({
    'tags': ['User'],
    'parameters': [{
        'name': 'body',
        'in': 'body',
        'required': True,
        'schema': {
            'type': 'object',
            'properties': {
                'email': {'type': 'string'},  # required to identify user
                'first_name': {'type': 'string'},
                'last_name': {'type': 'string'},
                'password': {'type': 'string'}  # required for security check
            }
        }
    }],
    'responses': {
        200: {'description': 'Profile updated'},
        400: {'description': 'Invalid input or incorrect password'},
        404: {'description': 'User not found'}
    }
})
def update_profile():
    data = request.get_json()
    email = data.get('email')
    first_name = data.get('first_name')
    last_name = data.get('last_name')
    password = data.get('password')  # password for verification

    if not email or not password:
        return jsonify({'error': 'Email and password are required'}), 400

    user = get_user_by_email(email)
    if not user:
        return jsonify({'error': 'User not found'}), 404

    # Verify password
    if not bcrypt.check_password_hash(user['password'], password):
        return jsonify({'error': 'Incorrect password'}), 400

    updates = []
    params = []

    if first_name:
        updates.append("firstName=%s")
        params.append(first_name)
    if last_name:
        updates.append("lastName=%s")
        params.append(last_name)

    if not updates:
        return jsonify({'error': 'No data to update'}), 400

    query = "UPDATE User SET " + ", ".join(updates) + " WHERE id=%s"
    params.append(user['id'])

    cur = mysql.connection.cursor()
    cur.execute(query, tuple(params))
    mysql.connection.commit()
    cur.close()

    return jsonify({'message': 'Profile updated successfully'})
