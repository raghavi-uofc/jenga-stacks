# tests/test_user_repo.py
import pytest
from unittest.mock import MagicMock
from models.user import User
from repositories.user_repository import UserRepository

@pytest.fixture
def mock_mysql():
    # mock cursor context manager
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
    return UserRepository(mock_mysql)

def test_get_user_by_email_returns_user(repo, mock_mysql):
    mock_cursor = mock_mysql.connection.cursor()
    mock_cursor.fetchone.return_value = {
        "id": 1,
        "firstName": "Alice",
        "lastName": "Smith",
        "email": "alice@test.com",
        "role": "admin",
        "status": "active",
        "password": "hashed_pw"
    }

    user = repo.get_user_by_email("alice@test.com")

    assert isinstance(user, User)
    assert user.email == "alice@test.com"
    assert user.first_name == "Alice"
    assert user.role == "admin"

def test_insert_user_calls_execute_and_commit(repo, mock_mysql):
    mock_cursor = mock_mysql.connection.cursor()
    repo.insert_user("Bob", "Jones", "bob@test.com", "pw_hash", "user")
    
    mock_cursor.execute.assert_called_once_with(
        """
                INSERT INTO User (firstName, lastName, email, password, role)
                VALUES (%s, %s, %s, %s, %s)
            """,
        ("Bob", "Jones", "bob@test.com", "pw_hash", "user")
    )
    mock_mysql.connection.commit.assert_called_once()

def test_delete_user_success(repo, mock_mysql):
    mock_cursor = mock_mysql.connection.cursor()
    mock_cursor.rowcount = 1  # simulate affected row

    result = repo.delete_user(1)

    assert result is True
    mock_mysql.connection.commit.assert_called_once()

def test_delete_user_failure(repo, mock_mysql):
    mock_cursor = mock_mysql.connection.cursor()
    mock_cursor.rowcount = 0  # simulate no row affected

    result = repo.delete_user(999)

    assert result is False
    mock_mysql.connection.rollback.assert_called_once()

def test_get_all_users_returns_list(repo, mock_mysql):
    mock_cursor = mock_mysql.connection.cursor()
    mock_cursor.fetchall.return_value = [
        {"id": 1, "firstName": "Alice", "lastName": "Smith", "email": "a@test.com", "role": "admin", "status": "active", "dateTimeCreated": "2025-01-01"},
        {"id": 2, "firstName": "Bob", "lastName": "Jones", "email": "b@test.com", "role": "user", "status": "active", "dateTimeCreated": "2025-01-02"}
    ]

    users = repo.get_all_users()
    assert len(users) == 2
    assert users[0].email == "a@test.com"
    assert users[1].role == "user"
