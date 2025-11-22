# Databricks notebook source
# routes/admin_routes.py - Admin routes for user management
from MySQLdb import OperationalError
from flask import Blueprint, jsonify, g,request
from app import mysql, auth
from flasgger import swag_from
from utils.auth_utils import serializer

from models.user_model import get_users, get_user_by_email
import logging

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
    users = get_users(cur)
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

    # --- Delete user safely ---
    try:
        with mysql.connection.cursor() as cur:
            cur.execute("DELETE FROM User WHERE id=%s", (user_id,))
            if cur.rowcount == 0:  # no rows affected → user not found
                return jsonify({'error': 'User not found'}), 404

        mysql.connection.commit()
        return jsonify({'message': 'User deleted'})

    except OperationalError as e:
        mysql.connection.rollback()
        print(f"MySQL error: {e}")
        return jsonify({'error': 'Database error'}), 500