# tests/test_project_service.py
import pytest
from unittest.mock import MagicMock, patch
from datetime import datetime, timedelta
from services.project_service import ProjectService
from models.project_detailed import ProjectDetailed, Budget, Timeframe
from models.project import Project
from models.member import Member

@pytest.fixture
def mock_repo():
    return MagicMock()

@pytest.fixture
def service(mock_repo):
    return ProjectService(mock_repo)

def test_validate_project_success(service):
    pd = ProjectDetailed(
        project=Project(id=1, name="Test Project", goal_description="Do something"),
        budget=Budget(floor=100, ceiling=200),
        timeframe=Timeframe(start=(datetime.now() + timedelta(days=1)).isoformat(),
                            end=(datetime.now() + timedelta(days=2)).isoformat()),
        team_members=[Member(first_name="John", last_name="Doe")]
    )
    validated = service.validate_project(pd)
    assert validated["name"] == "Test Project"
    assert validated["goal_description"] == "Do something"
    assert validated["budget_floor"] == 100
    assert validated["budget_ceiling"] == 200
    assert isinstance(validated["team_members"], list)

def test_validate_project_name_missing(service):
    pd = ProjectDetailed(project=Project(id=1, name=None, goal_description="Goal"))
    with pytest.raises(ValueError, match="Project name is required"):
        service.validate_project(pd)

def test_validate_project_goal_missing(service):
    pd = ProjectDetailed(project=Project(id=1, name="Name", goal_description=None))
    with pytest.raises(ValueError, match="Goal description is required"):
        service.validate_project(pd)

def test_validate_budget_floor_greater_than_ceiling(service):
    pd = ProjectDetailed(
        project=Project(id=1, name="Name", goal_description="Goal"),
        budget=Budget(floor=300, ceiling=200)
    )
    with pytest.raises(ValueError, match="Budget floor cannot exceed budget ceiling"):
        service.validate_project(pd)

def test_validate_timeframe_past_start_date(service):
    pd = ProjectDetailed(
        project=Project(id=1, name="Name", goal_description="Goal"),
        timeframe=Timeframe(
            start=(datetime.now() - timedelta(days=1)).isoformat(),
            end=(datetime.now() + timedelta(days=1)).isoformat()
        )
    )
    with pytest.raises(ValueError, match="Start date must be in the future"):
        service.validate_project(pd)

def test_build_project_detailed_creates_correct_object(service):
    data = {
        "id": 1,
        "name": "Proj",
        "requirement_description": "Req",
        "goal_description": "Goal",
        "project_status": "draft",
        "budget_floor": 100,
        "budget_ceiling": 200,
        "start_date": (datetime.now() + timedelta(days=1)).isoformat(),
        "end_date": (datetime.now() + timedelta(days=2)).isoformat(),
        "team_members": [{"member": "John Doe", "language": "Python", "framework": "Flask"}]
    }
    pd = service.build_project_detailed(data, user_id=42)
    assert pd.project.id == 1
    assert pd.budget.floor == 100
    assert pd.timeframe.start == data["start_date"]
    assert len(pd.team_members) == 1
    assert pd.team_members[0].first_name == "John"

def test_save_draft_calls_repo(service, mock_repo):
    future_start = (datetime.now() + timedelta(days=1)).isoformat()
    future_end = (datetime.now() + timedelta(days=2)).isoformat()
    data = {
        "name": "Proj",
        "goal_description": "Goal",
        "start_date": future_start,
        "end_date": future_end,
        "budget_floor": 50,
        "budget_ceiling": 100,
    }

    mock_repo.save_project_complete.return_value = 1

    with patch("services.project_service.contains_invalid_phrase", return_value=False):
        project_id = service.save_draft(data, user_id=42)

    mock_repo.save_project_complete.assert_called_once()
    assert project_id == 1

def test_submit_project_calls_repo_and_generates_plan(service, mock_repo):
    future_start = (datetime.now() + timedelta(days=1)).isoformat()
    future_end = (datetime.now() + timedelta(days=2)).isoformat()
    data = {
        "name": "Proj",
        "goal_description": "Goal",
        "start_date": future_start,
        "end_date": future_end,
        "budget_floor": 50,
        "budget_ceiling": 100,
    }

    mock_repo.save_project_complete.return_value = 1
    mock_repo.save_prompt_version.return_value = 99

    with patch("services.project_service.contains_invalid_phrase", return_value=False), \
         patch("services.project_service.generate_project_plan", return_value=("prompt_text", "llm_response")):

        project_id, prompt_id, llm_text = service.submit_project(data, user_id=42)

    mock_repo.save_project_complete.assert_called_once()
    mock_repo.save_prompt_version.assert_called_once()
    mock_repo.save_llm_history.assert_called_once()
    assert project_id == 1
    assert prompt_id == 99
    assert llm_text == "llm_response"

def test_delete_project_not_found_raises(service, mock_repo):
    mock_repo.get_project_by_id.return_value = None
    with pytest.raises(FileNotFoundError):
        service.delete_project(1, user_id=42)

def test_delete_project_wrong_user_raises(service, mock_repo):
    mock_repo.get_project_by_id.return_value = Project(id=1, name="P", user_id=1, requirement_description=None, goal_description=None)
    with pytest.raises(PermissionError):
        service.delete_project(1, user_id=42)
