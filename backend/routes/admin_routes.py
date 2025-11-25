# Databricks notebook source
# routes/admin_routes.py - Admin routes for user management
from flask import Blueprint, jsonify,request, current_app
from flasgger import swag_from
from utils.auth_utils import authenticate_token

admin_bp = Blueprint('admin', __name__)
@admin_bp.route('/admin/users', methods=['GET'])
def admin_list_users():
    # Reuse the same token authentication logic as other routes
    user, error_response, status_code = authenticate_token(current_app.user_repo)
    if error_response:
        return error_response, status_code

    # Enforce admin authorization
    if user.get('role') != 'admin':
        return jsonify({'error': 'Forbidden – admin access required'}), 403

    user_repo = current_app.user_repo
    users = user_repo.get_all_users()
    
    return jsonify({'users': users})

@admin_bp.route('/admin/users/<int:user_id>', methods=['DELETE'])
def admin_delete_user(user_id):
    # Reuse the same token authentication logic as other routes
    user, error_response, status_code = authenticate_token(current_app.user_repo)
    if error_response:
        return error_response, status_code

    # Enforce admin authorization
    if user.get('role') != 'admin':
        return jsonify({'error': 'Forbidden – admin access required'}), 403

    # --- Delete user safely ---
    try:
        deleted = current_app.user_repo.delete_user(user_id)
        if not deleted:
            return jsonify({'error': 'User not found'}), 404

        return jsonify({'message': 'User deleted'}), 200

    except Exception:
        return jsonify({'error': 'Database error'}), 500