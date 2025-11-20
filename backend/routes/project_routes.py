# Databricks notebook source
# project_routes.py
from flask import Blueprint, request, jsonify, current_app, request
from app import mysql
import MySQLdb.cursors
from flasgger import swag_from
from google import genai
from google.genai import types
import json
from auth_utils import get_user_by_email, serializer
from models.project_model import get_project_details

project_bp = Blueprint('project', __name__)

def authenticate_token():
    auth_header = request.headers.get('Authorization', '')
    if not auth_header.startswith('Bearer '):
        return None, jsonify({'error': 'Unauthorized'}), 401
    token = auth_header[len('Bearer '):]

    try:
        email = serializer.loads(token)
    except Exception as e:
        print(f"Token decode error: {e}")
        return None, jsonify({'error': 'Unauthorized'}), 401

    user = get_user_by_email(email)
    if not user:
        return None, jsonify({'error': 'Unauthorized'}), 401

    return user, None, None


def build_team_summary(members):
    """Create a human-readable team summary for the prompt."""
    return "\n".join([
        f"- {m.get('name', m.get('member', 'Unknown'))}: "
        f"Language: {m.get('language', 'N/A')}, Framework: {m.get('framework', 'N/A')}"
        for m in members
    ])


def build_project_prompt(data, team_summary: str) -> str:
    """Build a unified prompt."""
    start_date = data.get('start_date') or data.get('startDate')
    end_date = data.get('end_date') or data.get('endDate')

    return f"""
Analyze the following software project and act as an expert AI Project Manager.

Project Name: {data.get('name')}
Project Goal: {data.get('goal_description')}
Requirements: {data.get('requirement_description')}
Budget: {data.get('budget')}
Timeline: {start_date} to {end_date}

Team Members and Skills:
{team_summary}

Your tasks:
1. Recommend the best-fit programming languages, frameworks, and tools for frontend, backend, database, and devops.
2. Assign clear roles to each team member based on their skills (e.g., Backend Developer, Frontend Developer, Full-Stack, DevOps, QA, Tech Lead).
3. Provide a high-level project plan and milestone-based timeline.
4. Mention potential risks and mitigation strategies.

Return a single, well-structured answer in Markdown with clear headings and bullet points.
"""


def save_project_complete(data, user_id, project_status):
    """
    Saves project with budget, timeframe, team, and members.
    Returns project_id.
    """
    cur = mysql.connection.cursor(MySQLdb.cursors.DictCursor)

    try:
        project_id = data.get('id')
        name = data.get('name')
        requirement_description = data.get('requirement_description')
        goal_description = data.get('goal_description')
        budget = data.get('budget')

        # Accept both snake_case and camelCase for dates
        start_date = data.get('start_date') or data.get('startDate')
        end_date = data.get('end_date') or data.get('endDate')

        # Accept both team_members and teamMembers
        team_members = data.get('team_members') or data.get('teamMembers') or []

        # Validate required fields
        if not name:
            raise ValueError("Project name is required")
        if not requirement_description:
            raise ValueError("Requirement description is required")
        if not goal_description:
            raise ValueError("Goal description is required")

        # 1. Create or Update Project
        if project_id:
            cur.execute(
                """
                UPDATE Project 
                SET name=%s, requirement_description=%s, goal_description=%s, project_status=%s 
                WHERE id=%s AND userId=%s
                """,
                (name, requirement_description, goal_description, project_status, project_id, user_id)
            )
            if cur.rowcount == 0:
                raise ValueError("Project not found or unauthorized")
        else:
            cur.execute(
                """
                INSERT INTO Project 
                    (name, requirement_description, goal_description, project_status, userId) 
                VALUES (%s, %s, %s, %s, %s)
                """,
                (name, requirement_description, goal_description, project_status, user_id)
            )
            project_id = cur.lastrowid

        # 2. Save or Update Budget
        if budget is not None:
            cur.execute("SELECT id FROM Budget WHERE projectId=%s", (project_id,))
            budget_exists = cur.fetchone()

            # Convert budget to decimal for floor and ceiling,
            # or insert same value for both if only one number
            budget_floor = float(budget)
            budget_ceiling = float(budget)

            if budget_exists:
                cur.execute(
                    "UPDATE Budget SET floor=%s, ceiling=%s WHERE projectId=%s",
                    (budget_floor, budget_ceiling, project_id)
                )
            else:
                cur.execute(
                    "INSERT INTO Budget (projectId, floor, ceiling) VALUES (%s, %s, %s)",
                    (project_id, budget_floor, budget_ceiling)
                )

        # 3. Save or Update Timeframe
        if start_date and end_date:
            cur.execute("SELECT id FROM Timeframe WHERE projectId=%s", (project_id,))
            timeframe_exists = cur.fetchone()

            if timeframe_exists:
                cur.execute(
                    "UPDATE Timeframe SET startTime=%s, endTime=%s WHERE projectId=%s",
                    (start_date, end_date, project_id)
                )
            else:
                cur.execute(
                    "INSERT INTO Timeframe (projectId, startTime, endTime) VALUES (%s, %s, %s)",
                    (project_id, start_date, end_date)
                )

        # 4. Save Team and Members
        if team_members:
            cur.execute("SELECT id FROM Team WHERE projectId=%s", (project_id,))
            team_row = cur.fetchone()

            if team_row:
                team_id = team_row['id']
                # Delete existing members (fresh insert)
                cur.execute("DELETE FROM TeamMember WHERE TeamId=%s", (team_id,))
                cur.execute("DELETE FROM Skillset WHERE memberId IN "
                            "(SELECT MemberId FROM TeamMember WHERE TeamId=%s)", (team_id,))
            else:
                team_name = "Default Team"  # Could come from data if desired
                cur.execute("INSERT INTO Team (projectId, name) VALUES (%s, %s)", (project_id, team_name))
                team_id = cur.lastrowid

            for member in team_members:
                member_name = member.get('member') or member.get('name') or ''
                language = member.get('language')
                framework = member.get('framework')
                if member_name:
                    name_parts = member_name.split(' ', 1)
                    first_name = name_parts[0]
                    last_name = name_parts[1] if len(name_parts) > 1 else ''

                    cur.execute(
                        "SELECT id FROM Member WHERE firstName=%s AND lastName=%s",
                        (first_name, last_name)
                    )
                    member_row = cur.fetchone()

                    if member_row:
                        member_id = member_row['id']
                    else:
                        cur.execute(
                            "INSERT INTO Member (firstName, lastName) VALUES (%s, %s)",
                            (first_name, last_name)
                        )
                        member_id = cur.lastrowid

                    # Link member to team - no skills column here
                    cur.execute(
                        "INSERT INTO TeamMember (TeamId, MemberId) VALUES (%s, %s)",
                        (team_id, member_id)
                    )

                    # Insert language skill if provided
                    if language:
                        cur.execute(
                            "INSERT INTO Skillset (memberId, skill, category) VALUES (%s, %s, %s)",
                            (member_id, language, 'Language')
                        )
                    # Insert framework skill if provided and not 'None'
                    if framework and framework.lower() != 'none':
                        cur.execute(
                            "INSERT INTO Skillset (memberId, skill, category) VALUES (%s, %s, %s)",
                            (member_id, framework, 'Framework')
                        )

        mysql.connection.commit()
        return project_id

    except Exception as e:
        mysql.connection.rollback()
        raise e
    finally:
        cur.close()


# Save as draft endpoint
@project_bp.route('/projects/save', methods=['POST'])
def save_project_draft():
    user, error_response, status_code = authenticate_token()
    if error_response:
        return error_response, status_code

    data = request.get_json() or {}

    if not all([data.get('name'), data.get('requirement_description'), data.get('goal_description')]):
        return jsonify({'error': 'Missing required fields'}), 400

    try:
        project_id = save_project_complete(data, user['id'], 'draft')
        return jsonify({'message': 'Project saved as draft', 'project_id': project_id}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500


# Submit project endpoint with LLM call
@project_bp.route('/projects/submit', methods=['POST'])
def submit_project():
    user, error_response, status_code = authenticate_token()
    if error_response:
        return error_response, status_code

    data = request.get_json() or {}

    INVALID_KEYWORDS = {'dog', 'cat', 'pet', 'animal'}

    def is_input_reasonable(data):
        combined_text = ' '.join([
            str(data.get('goal_description', '')).lower(),
            str(data.get('requirement_description', '')).lower(),
            str(data.get('name', '')).lower()
        ])
        if any(keyword in combined_text for keyword in INVALID_KEYWORDS):
            return False
        return True

    # Validate inputs before LLM call
    if not is_input_reasonable(data):
        return jsonify({'error': 'Input contains invalid or unsupported project topics'}), 400

    if not all([data.get('name'), data.get('requirement_description'), data.get('goal_description')]):
        return jsonify({'error': 'Missing required fields'}), 400

    try:
        project_id = save_project_complete(data, user['id'], 'submitted')

        # Build prompt for Gemini
        team_members = data.get('team_members') or data.get('teamMembers') or []
        team_summary = build_team_summary(team_members)
        prompt = build_project_prompt(data, team_summary)

        cur = mysql.connection.cursor(MySQLdb.cursors.DictCursor)
        cur.execute("SELECT MAX(version) as max_version FROM Prompts WHERE projectId=%s", (project_id,))
        row = cur.fetchone()
        next_version = (row['max_version'] or 0) + 1

        cur.execute(
            "INSERT INTO Prompts (projectId, prompt, version) VALUES (%s, %s, %s)",
            (project_id, prompt, next_version)
        )
        prompt_id = cur.lastrowid
        mysql.connection.commit()

        # Call Gemini API
        api_key = current_app.config.get('GEMINI_API_KEY')
        if not api_key:
            return jsonify({'error': 'GEMINI_API_KEY not configured'}), 500

        client = genai.Client(api_key=api_key)
        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=prompt,
            config=types.GenerateContentConfig(
                system_instruction="You are an expert AI Project Manager. Respond with a structured Markdown plan only."
            )
        )

        llm_response_text = response.text

        cur.execute(
            "INSERT INTO GenerationHistory (projectId, promptId, llmResponse) VALUES (%s, %s, %s)",
            (project_id, prompt_id, llm_response_text)
        )
        mysql.connection.commit()
        cur.close()

        return jsonify({
            'message': 'Project submitted successfully',
            'project_id': project_id,
            'prompt_id': prompt_id,
            'llm_response': llm_response_text
        }), 200

    except Exception as e:
        mysql.connection.rollback()
        return jsonify({'error': str(e)}), 500

@project_bp.route('/projects/user/<int:user_id>', methods=['GET'])
def list_projects_by_user(user_id):
    user, error_response, status_code = authenticate_token()
    if error_response:
        return error_response, status_code

    # Ensure user only gets their own projects or admin if needed
    if user['id'] != user_id:
        return jsonify({'error': 'Forbidden'}), 403

    status = request.args.get('status')
    cur = mysql.connection.cursor(MySQLdb.cursors.DictCursor)

    if status in ['draft', 'submitted']:
        cur.execute(
            "SELECT * FROM Project WHERE userId=%s AND project_status=%s ORDER BY dateTimeUpdated DESC",
            (user_id, status)
        )
    else:
        cur.execute(
            "SELECT * FROM Project WHERE userId=%s ORDER BY dateTimeUpdated DESC",
            (user_id,)
        )

    projects = cur.fetchall()
    cur.close()
    return jsonify({'projects': projects}), 200



@project_bp.route('/projects/<int:project_id>', methods=['DELETE'])
def delete_project(project_id):
    user, error_response, status_code = authenticate_token()
    if error_response:
        return error_response, status_code

    cur = mysql.connection.cursor()

    cur.execute("SELECT id FROM Project WHERE id=%s AND userId=%s", (project_id, user['id']))
    if not cur.fetchone():
        cur.close()
        return jsonify({'error': 'Project not found'}), 404

    cur.execute("DELETE FROM Project WHERE id=%s", (project_id,))
    mysql.connection.commit()
    cur.close()

    return jsonify({'message': 'Project deleted'}), 200

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
    user, error_response, status_code = authenticate_token()
    if error_response:
        return error_response, status_code

    # sql_query = """
    # SELECT
    #     P.id AS project_id,
    #     P.name,
    #     P.goal_description,
    #     P.requirement_description,
    #     P.project_status,
    #     B.floor AS budget_floor,
    #     B.ceiling AS budget_ceiling,
    #     Tf.startTime AS project_start_date,
    #     Tf.endTime AS project_end_date,
    #     M.firstName AS member_first_name,
    #     M.lastName AS member_last_name
    # FROM
    #     Project P
    # LEFT JOIN Budget B ON P.id = B.projectId
    # LEFT JOIN Timeframe Tf ON P.id = Tf.projectId
    # LEFT JOIN Team Tm ON P.id = Tm.projectId
    # LEFT JOIN TeamMember TmM ON Tm.id = TmM.TeamId
    # LEFT JOIN Member M ON TmM.MemberId = M.id
    # WHERE
    #     P.id = %s AND P.userId = %s
    # """
    #
    # cur = mysql.connection.cursor(MySQLdb.cursors.DictCursor)
    # cur.execute(sql_query, (project_id, user['id']))
    # detailed_rows = cur.fetchall()
    # cur.close()

    detailed_rows = get_project_details(mysql, project_id, user['id'])

    if not detailed_rows:
        return jsonify({'message': 'Project not found'}), 404

    first_row = detailed_rows[0]
    project_details = {
        'id': first_row['project_id'],
        'name': first_row['name'],
        'goal_description': first_row['goal_description'],
        'requirement_description': first_row['requirement_description'],
        'status': first_row['project_status'],
        'budget': {
            'floor': first_row['budget_floor'],
            'ceiling': first_row['budget_ceiling']
        },
        'timeframe': {
            'start_date': first_row['project_start_date'],
            'end_date': first_row['project_end_date']
        },
        'team_members': []
    }

    seen_members = set()
    for row in detailed_rows:
        if row['member_first_name']:
            member_name = f"{row['member_first_name']} {row['member_last_name']}"
            if member_name not in seen_members:
                project_details['team_members'].append({
                    'first_name': row['member_first_name'],
                    'last_name': row['member_last_name']
                })
                seen_members.add(member_name)

    return jsonify({'project': project_details})
