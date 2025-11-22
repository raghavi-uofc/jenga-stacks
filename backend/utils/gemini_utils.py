from flask import current_app
from google import genai
from google.genai import types
from utils.prompt_utils import build_team_summary, build_project_prompt

def generate_project_plan(data):
    """
    Generates a project plan using the Gemini API.
    """
    api_key = current_app.config.get('GEMINI_API_KEY')
    if not api_key:
        raise RuntimeError("GEMINI_API_KEY not configured")

    try:
        client = genai.Client(api_key=api_key)
    except Exception as e:
        raise RuntimeError(f"Gemini Client Initialization Error: {str(e)}")

    team_members = data.get('team_members') or data.get('teamMembers') or []
    team_summary = build_team_summary(team_members)
    prompt = build_project_prompt(data, team_summary)

    try:
        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=prompt,
            config=types.GenerateContentConfig(
                system_instruction="You are an expert AI Project Manager. Respond with a structured Markdown plan only."
            )
        )
        return prompt, response.text
    except Exception as e:
        raise RuntimeError(f"Failed to generate plan from Gemini API: {str(e)}")
