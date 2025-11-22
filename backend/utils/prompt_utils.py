INVALID_KEYWORDS = {
    'ignore all', 'spam', 'do not answer', 'bypass', 'malicious',
    'exploit', 'hack', 'illegal', 'inappropriate', 'sensitive'
}

def contains_invalid_phrase(data):
    """
    Recursively check all string values in the dictionary for invalid keywords.
    """
    if isinstance(data, dict):
        for value in data.values():
            if contains_invalid_phrase(value):
                return True
    elif isinstance(data, list):
        for item in data:
            if contains_invalid_phrase(item):
                return True
    elif isinstance(data, str):
        lower_val = data.lower()
        for keyword in INVALID_KEYWORDS:
            if keyword in lower_val:
                return True
    return False


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
Budget: {data.get('budget_floor')} to {data.get('budget_ceiling')}
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
