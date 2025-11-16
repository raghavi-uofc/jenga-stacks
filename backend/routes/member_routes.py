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

@member_bp.route('/members/user/<int:user_id>', methods=['GET'])
def get_members_by_user(user_id):
    cur = mysql.connection.cursor(MySQLdb.cursors.DictCursor)

    # Check user exists
    cur.execute("SELECT id FROM User WHERE id=%s", (user_id,))
    if not cur.fetchone():
        return jsonify({'error': 'User not found'}), 404

    # Fetch members (fixing DISTINCT + ORDER BY issue)
    cur.execute("""
        SELECT DISTINCT m.id AS memberId, m.firstName, m.lastName, m.dateTimeUpdated
        FROM Member m
        JOIN TeamMember tm ON tm.MemberId = m.id
        JOIN Team t ON t.id = tm.TeamId
        JOIN Project p ON p.id = t.projectId
        WHERE p.userId = %s
        ORDER BY m.dateTimeUpdated DESC
    """, (user_id,))

    members = cur.fetchall()
    cur.close()

    # Optionally remove dateTimeUpdated before returning
    for m in members:
        m.pop('dateTimeUpdated', None)

    return jsonify({'user_id': user_id, 'members': members}), 200
