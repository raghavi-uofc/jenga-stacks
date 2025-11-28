# tests/test_prompt_utils.py
import pytest
from utils.prompt_utils import contains_invalid_phrase, build_team_summary, build_project_prompt

def test_contains_invalid_phrase_detects_keyword():
    data = {"name": "Test Project", "description": "This contains hack attempt"}
    assert contains_invalid_phrase(data) is True

def test_contains_invalid_phrase_no_keyword():
    data = {"name": "Safe Project", "description": "All good here"}
    assert contains_invalid_phrase(data) is False

def test_contains_invalid_phrase_nested_structures():
    data = {
        "projects": [
            {"name": "Proj1", "description": "clean"},
            {"name": "Proj2", "description": "malicious code"}
        ]
    }
    assert contains_invalid_phrase(data) is True

def test_contains_invalid_phrase_empty_structures():
    assert contains_invalid_phrase({}) is False
    assert contains_invalid_phrase([]) is False

def test_build_team_summary_generates_text():
    members = [
        {"member": "Alice", "language": "Python", "framework": "Django"},
        {"name": "Bob", "language": "JavaScript", "framework": "React"},
        {"member": "Charlie"}
    ]
    summary = build_team_summary(members)
    lines = summary.split("\n")
    assert len(lines) == 3
    assert "- Alice: Language: Python, Framework: Django" in lines
    assert "- Bob: Language: JavaScript, Framework: React" in lines
    assert "- Charlie: Language: N/A, Framework: N/A" in lines

def test_build_project_prompt_includes_data_fields():
    data = {
        "name": "My Project",
        "goal_description": "Achieve something",
        "requirement_description": "Must be secure",
        "budget_floor": 1000,
        "budget_ceiling": 5000,
        "start_date": "2025-12-01",
        "end_date": "2026-01-01"
    }
    team_summary = "- Alice: Language: Python, Framework: Flask"
    prompt = build_project_prompt(data, team_summary)
    assert "Project Name: My Project" in prompt
    assert "Project Goal: Achieve something" in prompt
    assert "Budget: 1000 to 5000" in prompt
    assert "Timeline: 2025-12-01 to 2026-01-01" in prompt
    assert team_summary in prompt
