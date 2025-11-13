# Databricks notebook source
# routes/admin_routes.py - Admin routes for user management

from flask import Blueprint, jsonify, g
from app import mysql, auth
from flasgger import swag_from

admin_bp = Blueprint('admin', __name__)

@admin_bp.route('/admin/users', methods=['GET'])
@swag_from({
    'tags': ['Admin'],
    'responses': {
        200: {'description': 'List of users'},
        401: {'description': 'Unauthorized'}
    }
})
def admin_list_users():
    if g.current_user['role'] != 'admin':
        return jsonify({'error': 'Unauthorized'}), 401
    cur = mysql.connection.cursor()
    cur.execute("SELECT id, first_name, last_name, email, role, status, dateTimeCreated FROM User ORDER BY dateTimeCreated DESC")
    users = cur.fetchall()
    cur.close()
    return jsonify({'users': users})

@admin_bp.route('/admin/users/<int:user_id>', methods=['DELETE'])
@swag_from({
    'tags': ['Admin'],
    'responses': {
        200: {'description': 'User deleted'},
        401: {'description': 'Unauthorized'},
        404: {'description': 'User not found'}
    }
})
def admin_delete_user(user_id):
    if g.current_user['role'] != 'admin':
        return jsonify({'error': 'Unauthorized'}), 401
    cur = mysql.connection.cursor()
    cur.execute("SELECT id FROM User WHERE id=%s", (user_id,))
    if not cur.fetchone():
        return jsonify({'error': 'User not found'}), 404
    cur.execute("DELETE FROM User WHERE id=%s", (user_id,))
    mysql.connection.commit()
    cur.close()
    return jsonify({'message': 'User deleted'})