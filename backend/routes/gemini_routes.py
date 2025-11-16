# Databricks notebook source
# gemini_routes.py
from flask import Blueprint, request, current_app
from google import genai
from google.genai import types
from flask_restx import Api, Resource, fields

# --- Blueprint Setup ---
gemini_bp = Blueprint('gemini', __name__, url_prefix='/api/gemini')
api = Api(gemini_bp, doc='/docs', title='Gemini LLM API', description='Generate project plan using Gemini API')

# --- flask_restx Models ---
team_member_model = api.model('TeamMember', {
    'name': fields.String(required=True, description='Member name/role'),
    'language': fields.String(required=False, description='Primary language skill (e.g., Python)'),
    'framework': fields.String(required=False, description='Primary framework skill (e.g., React)')
})

generate_request_model = api.model('GenerateRequest', {
    'name': fields.String(required=True, description='Project name'),
    'requirement_description': fields.String(required=True, description='Detailed project requirements'),
    'budget': fields.String(required=True, description='Project budget or range'),
    'startDate': fields.String(required=True, description='Project start date (YYYY-MM-DD)'),
    'endDate': fields.String(required=True, description='Project end date (YYYY-MM-DD)'),
    'goal_description': fields.String(required=True, description='Project goal description'),
    'teamMembers': fields.List(fields.Nested(team_member_model), required=True, description='List of team members with skills'),
})

generate_response_model = api.model('GenerateResponse', {
    'plan': fields.String(description='Generated project plan, framework suggestions, and role assignments')
})


def build_team_summary(members):
    """Create a human-readable team summary for the prompt."""
    return "\n".join([
        f"- {m.get('name', 'Unknown')}: Language: {m.get('language', 'N/A')}, Framework: {m.get('framework', 'N/A')}"
        for m in members
    ])


def build_project_prompt(data, team_summary: str) -> str:
    """Build a unified prompt used by both Gemini and project submit."""
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


@api.route('/generate')
class GeminiGenerate(Resource):

    @api.expect(generate_request_model)
    @api.marshal_with(generate_response_model, code=200)
    @api.response(500, 'Internal Server Error')
    def post(self):
        """
        Generates a project plan based on input data using the Gemini model.
        """
        data = request.json or {}

        # 1. Access and Validate API Key
        api_key = current_app.config.get('GEMINI_API_KEY')
        if not api_key:
            api.abort(500, "Configuration Error: GEMINI_API_KEY is not set in app configuration.")

        # 2. Initialize Gemini Client
        try:
            client = genai.Client(api_key=api_key)
        except Exception as e:
            api.abort(500, f"Gemini Client Initialization Error: {str(e)}")

        # Normalize team structure
        team_members = data.get('teamMembers', [])
        team_summary = build_team_summary(team_members)

        # 3. Construct the Prompt
        prompt = build_project_prompt(data, team_summary)

        # 4. Call the Gemini API
        try:
            response = client.models.generate_content(
                model="gemini-2.5-flash",
                contents=prompt,
                config=types.GenerateContentConfig(
                    system_instruction="You are an expert AI Project Manager. Respond with a structured Markdown plan only."
                )
            )

            return {"plan": response.text}

        except Exception as e:
            api.abort(500, f"Failed to generate plan from Gemini API: {str(e)}")
