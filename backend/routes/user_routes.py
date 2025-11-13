# Databricks notebook source
# routes/user_routes.py - User related routes

from flask import Blueprint, request, jsonify, g, current_app
from app import mysql, bcrypt, auth
from auth_utils import get_user_by_email, generate_token
from flasgger import swag_from

user_bp = Blueprint('user', __name__)

@user_bp.route('/register', methods=['POST'])
@swag_from({
    'tags': ['User'],
    'parameters': [{'name': 'body', 'in': 'body', 'required': True, 'schema': {
        'type': 'object',
        'properties': {
            'first_name': {'type': 'string'},
            'last_name': {'type': 'string'},
            'email': {'type': 'string'},
            'password': {'type': 'string'}
        },
        'required': ['first_name', 'last_name', 'email', 'password']
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

    if not (first_name and last_name and email and password):
        return jsonify({'error': 'Missing required fields'}), 400

    if get_user_by_email(email):
        return jsonify({'error': 'Email already registered'}), 400

    pw_hash = bcrypt.generate_password_hash(password).decode('utf-8')
    cur = mysql.connection.cursor()
    cur.execute(
        "INSERT INTO User (first_name, last_name, email, password) VALUES (%s, %s, %s, %s)",
        (first_name, last_name, email, pw_hash)
    )
    mysql.connection.commit()
    cur.close()
    return jsonify({'message': 'User created successfully'}), 201

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
    return jsonify({'token': token, 'user': {'id': user['id'], 'email': user['email'], 'first_name': user['first_name'], 'last_name': user['last_name'], 'role': user['role']}})

@user_bp.route('/users/reset_password', methods=['POST'])
@auth.login_required
@swag_from({
    'tags': ['User'],
    'parameters': [{'name': 'body', 'in': 'body', 'required': True, 'schema': {
        'type': 'object',
        'properties': {
            'old_password': {'type': 'string'},
            'new_password': {'type': 'string'}
        },
        'required': ['old_password', 'new_password']
    }}],
    'responses': {
        200: {'description': 'Password updated'},
        400: {'description': 'Bad request'},
        401: {'description': 'Unauthorized'}
    }
})
def reset_password():
    data = request.get_json()
    old_password = data.get('old_password')
    new_password = data.get('new_password')

    if not (old_password and new_password):
        return jsonify({'error': 'Missing old or new password'}), 400

    user = get_user_by_email(g.current_user['email'])
    if not bcrypt.check_password_hash(user['password'], old_password):
        return jsonify({'error': 'Old password incorrect'}), 401

    pw_hash = bcrypt.generate_password_hash(new_password).decode('utf-8')
    cur = mysql.connection.cursor()
    cur.execute("UPDATE User SET password=%s WHERE id=%s", (pw_hash, user['id']))
    mysql.connection.commit()
    cur.close()
    return jsonify({'message': 'Password updated successfully'})

@user_bp.route('/users/profile', methods=['PUT'])
@auth.login_required
@swag_from({
    'tags': ['User'],
    'parameters': [{'name': 'body', 'in': 'body', 'required': True, 'schema': {
        'type': 'object',
        'properties': {
            'first_name': {'type': 'string'},
            'last_name': {'type': 'string'},
            'email': {'type': 'string'}
        }
    }}],
    'responses': {
        200: {'description': 'Profile updated'},
        400: {'description': 'Invalid input'},
        401: {'description': 'Unauthorized'}
    }
})
def update_profile():
    data = request.get_json()
    first_name = data.get('first_name')
    last_name = data.get('last_name')
    email = data.get('email')

    if not (first_name or last_name or email):
        return jsonify({'error': 'No data to update'}), 400

    user = get_user_by_email(g.current_user['email'])

    if email and email != user['email']:
        if get_user_by_email(email):
            return jsonify({'error': 'Email already used'}), 400

    cur = mysql.connection.cursor()
    query = "UPDATE User SET "
    params = []
    updates = []
    if first_name:
        updates.append("first_name=%s")
        params.append(first_name)
    if last_name:
        updates.append("last_name=%s")
        params.append(last_name)
    if email:
        updates.append("email=%s")
        params.append(email)
    query += ", ".join(updates) + " WHERE id=%s"
    params.append(user['id'])

    cur.execute(query, tuple(params))
    mysql.connection.commit()
    cur.close()
    return jsonify({'message': 'Profile updated successfully'})