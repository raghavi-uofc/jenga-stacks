# tests/test_gemini_utils.py
import pytest
from unittest.mock import patch, MagicMock
from utils import gemini_utils

def test_generate_project_plan_success(monkeypatch):
    # Mock current_app.config
    mock_config = {"GEMINI_API_KEY": "fake-key"}
    class MockCurrentApp:
        config = mock_config
    monkeypatch.setattr(gemini_utils, "current_app", MockCurrentApp())

    # Mock genai.Client
    mock_response = MagicMock()
    mock_response.text = "Generated project plan"
    mock_client_instance = MagicMock()
    mock_client_instance.models.generate_content.return_value = mock_response
    monkeypatch.setattr(gemini_utils.genai, "Client", lambda api_key: mock_client_instance)

    # Sample input data
    data = {
        "name": "Test Project",
        "goal_description": "Do something",
        "requirement_description": "Requirements",
        "budget_floor": 1000,
        "budget_ceiling": 5000,
        "start_date": "2025-12-01",
        "end_date": "2026-01-01",
        "team_members": [
            {"member": "Alice", "language": "Python", "framework": "Flask"}
        ]
    }

    prompt, response_text = gemini_utils.generate_project_plan(data)
    assert "Test Project" in prompt
    assert response_text == "Generated project plan"
    mock_client_instance.models.generate_content.assert_called_once()

def test_generate_project_plan_no_api_key(monkeypatch):
    class MockCurrentApp:
        config = {}
    monkeypatch.setattr(gemini_utils, "current_app", MockCurrentApp())

    data = {}
    with pytest.raises(RuntimeError, match="GEMINI_API_KEY not configured"):
        gemini_utils.generate_project_plan(data)

def test_generate_project_plan_client_exception(monkeypatch):
    # Mock current_app.config
    mock_config = {"GEMINI_API_KEY": "fake-key"}
    class MockCurrentApp:
        config = mock_config
    monkeypatch.setattr(gemini_utils, "current_app", MockCurrentApp())

    # Mock genai.Client to raise exception
    def mock_client_fail(api_key):
        raise Exception("Init error")
    monkeypatch.setattr(gemini_utils.genai, "Client", mock_client_fail)

    data = {}
    with pytest.raises(RuntimeError, match="Gemini Client Initialization Error"):
        gemini_utils.generate_project_plan(data)

def test_generate_project_plan_generate_content_exception(monkeypatch):
    mock_config = {"GEMINI_API_KEY": "fake-key"}
    class MockCurrentApp:
        config = mock_config
    monkeypatch.setattr(gemini_utils, "current_app", MockCurrentApp())

    mock_client_instance = MagicMock()
    mock_client_instance.models.generate_content.side_effect = Exception("API fail")
    monkeypatch.setattr(gemini_utils.genai, "Client", lambda api_key: mock_client_instance)

    data = {"team_members": []}
    with pytest.raises(RuntimeError, match="Failed to generate plan from Gemini API"):
        gemini_utils.generate_project_plan(data)
