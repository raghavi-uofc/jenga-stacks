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
from models.project_model import get_project_details_rows
from datetime import datetime

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


# Helpers 
def extract_project_fields(data):
    return {
        "id": data.get("id"),
        "name": data.get("name"),
        "requirement_description": data.get("requirement_description"),
        "goal_description": data.get("goal_description"),
        "budget_floor": data.get("budget_floor"),
        "budget_ceiling": data.get("budget_ceiling"),
        "start_date": data.get("start_date") or data.get("startDate"),
        "end_date": data.get("end_date") or data.get("endDate"),
        "team_members": data.get("team_members") or data.get("teamMembers") or [],
    }


def validate_project_fields(fields):
    name = fields["name"]
    goal = fields["goal_description"]
    floor = fields["budget_floor"]
    ceiling = fields["budget_ceiling"]
    start = fields["start_date"]
    end = fields["end_date"]
    team = fields["team_members"]

    if not name:
        raise ValueError("Project name is required")
    if not goal:
        raise ValueError("Goal description is required")

    # ----- budget -----
    if floor not in (None, ""):
        floor = float(floor)
        if floor < 0:
            raise ValueError("Budget floor cannot be negative")

    if ceiling not in (None, ""):
        ceiling = float(ceiling)
        if ceiling < 0:
            raise ValueError("Budget ceiling cannot be negative")

    if floor not in (None, "") and ceiling not in (None, ""):
        if floor > ceiling:
            raise ValueError("Budget floor cannot exceed budget ceiling")

    fields["budget_floor"] = floor
    fields["budget_ceiling"] = ceiling

    # ----- dates -----
    def parse_date(value):
        try:
            return datetime.fromisoformat(value)
        except:
            raise ValueError("Dates must be in format YYYY-MM-DD")

    now = datetime.now()

    if start:
        s = parse_date(start)
        if s < now:
            raise ValueError("Start date must be in the future")
        fields["start_date"] = s

    if end:
        e = parse_date(end)
        if e < now:
            raise ValueError("End date must be in the future")
        fields["end_date"] = e

    if start and end:
        if fields["start_date"] >= fields["end_date"]:
            raise ValueError("Start date must be earlier than end date")

    # ----- team -----
    if not isinstance(team, list):
        raise ValueError("team_members must be a list")

    return fields


def save_team_and_members(cur, project_id, members):
    if not members:
        return

    cur.execute("SELECT id FROM Team WHERE projectId=%s", (project_id,))
    row = cur.fetchone()

    if row:
        team_id = row["id"]
        cur.execute("DELETE FROM TeamMember WHERE TeamId=%s", (team_id,))
    else:
        cur.execute("INSERT INTO Team (projectId, name) VALUES (%s, %s)", (project_id, "Default Team"))
        team_id = cur.lastrowid

    for m in members:
        full_name = m.get("member") or m.get("name") or ""
        language = m.get("language")
        framework = m.get("framework")

        first, *rest = full_name.split(" ", 1)
        last = rest[0] if rest else ""

        cur.execute("SELECT id FROM Member WHERE firstName=%s AND lastName=%s", (first, last))
        row = cur.fetchone()

        if row:
            member_id = row["id"]
        else:
            cur.execute("INSERT INTO Member (firstName, lastName) VALUES (%s, %s)", (first, last))
            member_id = cur.lastrowid

        cur.execute("INSERT INTO TeamMember (TeamId, MemberId) VALUES (%s, %s)", (team_id, member_id))

        if language:
            cur.execute(
                "INSERT INTO Skillset (memberId, skill, category) VALUES (%s, %s, %s)",
                (member_id, language, "Language")
            )
        if framework and framework.lower() != "none":
            cur.execute(
                "INSERT INTO Skillset (memberId, skill, category) VALUES (%s, %s, %s)",
                (member_id, framework, "Framework")
            )

def save_timeframe(cur, project_id, start, end):
    cur.execute("SELECT id FROM Timeframe WHERE projectId=%s", (project_id,))
    exists = cur.fetchone()

    start = start if start not in (None, "") else None
    end = end if end not in (None, "") else None

    if exists:
        cur.execute(
            "UPDATE Timeframe SET startTime=%s, endTime=%s WHERE projectId=%s",
            (start, end, project_id)
        )
    else:
        cur.execute(
            "INSERT INTO Timeframe (projectId, startTime, endTime) VALUES (%s, %s, %s)",
            (project_id, start, end)
        )


def save_budget(cur, project_id, floor, ceiling):
    if floor is None or ceiling is None:
        return

    cur.execute("SELECT id FROM Budget WHERE projectId=%s", (project_id,))
    exists = cur.fetchone()

    if exists:
        cur.execute(
            "UPDATE Budget SET floor=%s, ceiling=%s WHERE projectId=%s",
            (floor, ceiling, project_id)
        )
    else:
        cur.execute(
            "INSERT INTO Budget (projectId, floor, ceiling) VALUES (%s, %s, %s)",
            (project_id, floor, ceiling)
        )


def save_project_complete(data, user_id, project_status):
    cur = mysql.connection.cursor(MySQLdb.cursors.DictCursor)

    try:
        fields = extract_project_fields(data)
        fields = validate_project_fields(fields)

        project_id = fields["id"]

        # Save or update Project
        if project_id:
            cur.execute(
                """
                UPDATE Project 
                SET name=%s, requirementDescription=%s, goalDescription=%s, status=%s 
                WHERE id=%s AND userId=%s
                """,
                (fields["name"], fields["requirement_description"], fields["goal_description"],
                 project_status, project_id, user_id)
            )
            if cur.rowcount == 0:
                raise ValueError("Project not found or unauthorized")
        else:
            cur.execute(
                """
                INSERT INTO Project (name, requirementDescription, goalDescription, status, userId)
                VALUES (%s, %s, %s, %s, %s)
                """,
                (fields["name"], fields["requirement_description"], fields["goal_description"],
                 project_status, user_id)
            )
            project_id = cur.lastrowid

        save_budget(cur, project_id, fields["budget_floor"], fields["budget_ceiling"])
        save_timeframe(cur, project_id, fields["start_date"], fields["end_date"])
        save_team_and_members(cur, project_id, fields["team_members"])

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
    print("Save Draft Data:", data)

    if not all([data.get('name'), data.get('goal_description')]):
        return jsonify({'error': 'Missing required fields'}), 400

    try:
        # Save project with status 'draft'
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
            "SELECT * FROM Project WHERE userId=%s AND status=%s ORDER BY dateTimeUpdated DESC",
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
    
    print("Authenticated user:", user)
    print("Project ID:", project_id)
    
    if error_response:
        return error_response, status_code

    cur = mysql.connection.cursor()

    # Delete project only if it belongs to the authenticated user
    cur.execute("DELETE FROM Project WHERE id=%s AND userId=%s", (project_id, user['id']))
    
    if cur.rowcount == 0:
        cur.close()
        return jsonify({'error': 'Project not found or you do not have permission'}), 404

    mysql.connection.commit()
    cur.close()

    return jsonify({'message': 'Project deleted'}), 200



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
    user, error_response, status_code = authenticate_token()
    if error_response:
        return error_response, status_code

    detailed_rows = get_project_details_rows(mysql, project_id, user['id'])

    if not detailed_rows:
        return jsonify({'message': 'Project not found'}), 404

    first_row = detailed_rows[0]
    project_details = {
        'id': first_row['project_id'],
        'name': first_row['name'],
        'goal_description': first_row['goalDescription'],
        'requirement_description': first_row['requirementDescription'],
        'status': first_row['status'],
        'budget_floor': first_row['budget_floor'],
        'budget_ceiling': first_row['budget_ceiling'],
        'timeframe': {
            'start_date': first_row['project_start_date'],
            'end_date': first_row['project_end_date']
        },
        'team_members': []
    }

    # Aggregate members and their skills
    members_dict = {}  # key: member full name

    for row in detailed_rows:
        if row['member_first_name'] and row['member_last_name']:
            full_name = f"{row['member_first_name']} {row['member_last_name']}"
            if full_name not in members_dict:
                members_dict[full_name] = {
                    'member': full_name,
                    'language': None,
                    'framework': None
                }

            # Assign skill if present
            skill = row.get('skill')
            category = row.get('category')
            if skill and category:
                if category == 'Language':
                    members_dict[full_name]['language'] = skill
                elif category == 'Framework':
                    members_dict[full_name]['framework'] = skill

    # Convert dict to list
    project_details['team_members'] = list(members_dict.values())


    return jsonify({'project': project_details})
