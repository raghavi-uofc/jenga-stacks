# Databricks notebook source
# routes/admin_routes.py - Admin routes for user management

from flask import Blueprint, jsonify, g,request 
from app import mysql, auth
from flasgger import swag_from
from auth_utils import get_user_by_email, serializer

admin_bp = Blueprint('admin', __name__)

@admin_bp.route('/admin/users', methods=['GET'])
def admin_list_users():
    auth_header = request.headers.get('Authorization', '')
    if not auth_header.startswith('Bearer '):
        return jsonify({'error': 'Unauthorized'}), 401
    token = auth_header[len('Bearer '):]
    try:
        email = serializer.loads(token)
    except Exception as e:
        print(f"Token decode error: {e}")
        return jsonify({'error': 'Unauthorized'}), 401

    user = get_user_by_email(email)
    if not user or user.get('role') != 'admin':
        return jsonify({'error': 'Unauthorized'}), 401

    cur = mysql.connection.cursor()
    cur.execute("SELECT id, first_name, last_name, email, role, status, dateTimeCreated FROM User ORDER BY dateTimeCreated DESC")
    users = cur.fetchall()
    cur.close()
    return jsonify({'users': users})

@admin_bp.route('/admin/users/<int:user_id>', methods=['DELETE'])
def admin_delete_user(user_id):
    # Extract token from Authorization header
    auth_header = request.headers.get('Authorization', '')
    if not auth_header.startswith('Bearer '):
        return jsonify({'error': 'Unauthorized'}), 401
    token = auth_header[len('Bearer '):]

    try:
        email = serializer.loads(token)
    except Exception as e:
        print(f"Token decode error: {e}")
        return jsonify({'error': 'Unauthorized'}), 401

    user = get_user_by_email(email)
    if not user or user.get('role') != 'admin':
        return jsonify({'error': 'Unauthorized'}), 401

    cur = mysql.connection.cursor()
    cur.execute("SELECT id FROM User WHERE id=%s", (user_id,))
    if not cur.fetchone():
        cur.close()
        return jsonify({'error': 'User not found'}), 404

    cur.execute("DELETE FROM User WHERE id=%s", (user_id,))
    mysql.connection.commit()
    cur.close()
    return jsonify({'message': 'User deleted'})