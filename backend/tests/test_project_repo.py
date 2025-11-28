# tests/test_project_repository.py
import pytest
from unittest.mock import Mock, MagicMock
from models.project import Project
from models.project_detailed import ProjectDetailed, Budget, Timeframe
from models.member import Member
from repositories.project_repository import ProjectRepository

@pytest.fixture
def mock_mysql():
    # create a mock for mysql with connection.cursor context manager
    mock_cursor = MagicMock()
    mock_cursor.__enter__.return_value = mock_cursor
    mock_cursor.__exit__.return_value = None

    mock_connection = MagicMock()
    mock_connection.cursor.return_value = mock_cursor

    mock_mysql = MagicMock()
    mock_mysql.connection = mock_connection
    return mock_mysql

@pytest.fixture
def repo(mock_mysql):
    return ProjectRepository(mock_mysql)

def test_save_budget_inserts(repo, mock_mysql):
    # simulate no existing budget row
    mock_cursor = mock_mysql.connection.cursor()
    mock_cursor.fetchone.return_value = None

    budget = Budget(project_id=1, floor=100, ceiling=200)
    repo.save_budget(1, budget)

    # check that INSERT was called with correct args
    mock_cursor.execute.assert_any_call(
        "INSERT INTO Budget (projectId, floor, ceiling) VALUES (%s, %s, %s)",
        (1, 100, 200)
    )
    # check that commit was called
    mock_mysql.connection.commit.assert_called_once()

def test_get_budget_returns_budget(repo, mock_mysql):
    # simulate fetchone returning a real dict
    mock_cursor = mock_mysql.connection.cursor()
    mock_cursor.fetchone.return_value = {'projectId': 1, 'floor': 100, 'ceiling': 200}

    budget = repo.get_budget(1)

    assert isinstance(budget, Budget)
    assert budget.project_id == 1
    assert budget.floor == 100
    assert budget.ceiling == 200

def test_row_to_project_none(repo):
    result = repo._row_to_project(None)
    assert result is None

def test_row_to_project_populated(repo):
    row = {
        "id": 1,
        "name": "Test Project",
        "requirementDescription": "Req",
        "goalDescription": "Goal",
        "status": "draft",
        "userId": 42
    }
    project = repo._row_to_project(row)
    assert project.id == 1
    assert project.name == "Test Project"
    assert project.status == "draft"

# more needed