# tests/test_user_service.py
import pytest
from unittest.mock import MagicMock, patch
from models.user import User
from services.user_service import UserService

@pytest.fixture
def mock_repo():
    return MagicMock()

@pytest.fixture
def service(mock_repo):
    return UserService(mock_repo)

def test_register_user_success(service, mock_repo):
    # simulate no existing user
    mock_repo.get_user_by_email.return_value = None
    mock_repo.insert_user.return_value = None
    # after insertion, get_user_by_email returns a User
    mock_repo.get_user_by_email.side_effect = [
        None, 
        User(id=1, first_name="Alice", last_name="Smith", email="a@test.com", role="regular", status="active", password="hashed_pw")
    ]

    with patch("services.user_service.bcrypt.generate_password_hash") as mock_hash:
        mock_hash.return_value = b"hashed_pw"

        user, error = service.register_user("Alice", "Smith", "a@test.com", "password123", "regular")

    assert error is None
    assert isinstance(user, User)
    assert user.email == "a@test.com"
    mock_repo.insert_user.assert_called_once()

def test_register_user_missing_fields(service):
    user, error = service.register_user("", "Smith", "a@test.com", "password123", "regular")
    assert user is None
    assert error == "Missing required fields"

def test_register_user_invalid_role(service):
    user, error = service.register_user("Alice", "Smith", "a@test.com", "password123", "superuser")
    assert user is None
    assert error == "Invalid role"

def test_register_user_email_exists(service, mock_repo):
    mock_repo.get_user_by_email.return_value = User(id=1, first_name="Alice", last_name="Smith", email="a@test.com", role="regular", status="active", password="hashed_pw")
    user, error = service.register_user("Alice", "Smith", "a@test.com", "password123", "regular")
    assert user is None
    assert error == "Email already registered"

def test_login_user_success(service, mock_repo):
    user_obj = User(id=1, first_name="Alice", last_name="Smith", email="a@test.com", role="regular", status="active", password="hashed_pw")
    mock_repo.get_user_by_email.return_value = user_obj

    with patch("services.user_service.bcrypt.check_password_hash") as mock_check, \
         patch("services.user_service.generate_token") as mock_token:
        mock_check.return_value = True
        mock_token.return_value = "FAKE_TOKEN"

        user, token, error = service.login_user("a@test.com", "password123")

    assert error is None
    assert token == "FAKE_TOKEN"
    assert user.email == "a@test.com"

def test_login_user_invalid_credentials(service, mock_repo):
    # no user found
    mock_repo.get_user_by_email.return_value = None
    user, token, error = service.login_user("a@test.com", "password123")
    assert error == "Invalid credentials"

    # inactive user
    mock_repo.get_user_by_email.return_value = User(id=1, first_name="Alice", last_name="Smith", email="a@test.com", role="regular", status="inactive", password="hashed_pw")
    user, token, error = service.login_user("a@test.com", "password123")
    assert error == "Invalid credentials"

def test_reset_password_success(service, mock_repo):
    user_obj = User(id=1, first_name="Alice", last_name="Smith", email="a@test.com", role="regular", status="active", password="old_hash")
    mock_repo.get_user_by_email.return_value = user_obj

    with patch("services.user_service.bcrypt.check_password_hash") as mock_check, \
         patch("services.user_service.bcrypt.generate_password_hash") as mock_hash:
        mock_check.return_value = True
        mock_hash.return_value = b"new_hash"

        error = service.reset_password("a@test.com", "old_pw", "new_pw")

    assert error is None
    mock_repo.update_password.assert_called_once_with(1, "new_hash")

def test_reset_password_incorrect_old_pw(service, mock_repo):
    user_obj = User(id=1, first_name="Alice", last_name="Smith", email="a@test.com", role="regular", status="active", password="old_hash")
    mock_repo.get_user_by_email.return_value = user_obj

    with patch("services.user_service.bcrypt.check_password_hash") as mock_check:
        mock_check.return_value = False

        error = service.reset_password("a@test.com", "wrong_pw", "new_pw")

    assert error == "Old password incorrect"

def test_update_profile_success(service, mock_repo):
    user_obj = User(id=1, first_name="Alice", last_name="Smith", email="a@test.com", role="regular", status="active", password="pw_hash")
    mock_repo.get_user_by_email.return_value = user_obj

    with patch("services.user_service.bcrypt.check_password_hash") as mock_check:
        mock_check.return_value = True
        error = service.update_profile("a@test.com", "password", first_name="Alicia")

    assert error is None
    mock_repo.update_profile.assert_called_once_with(1, "Alicia", None)

def test_update_profile_wrong_password(service, mock_repo):
    user_obj = User(id=1, first_name="Alice", last_name="Smith", email="a@test.com", role="regular", status="active", password="pw_hash")
    mock_repo.get_user_by_email.return_value = user_obj

    with patch("services.user_service.bcrypt.check_password_hash") as mock_check:
        mock_check.return_value = False
        error = service.update_profile("a@test.com", "wrong_pw", first_name="Alicia")

    assert error == "Incorrect password"
