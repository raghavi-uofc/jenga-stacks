import pytest
from flask import Flask, g
from unittest.mock import Mock
from utils.auth_utils import configure_serializer, generate_token, verify_token, authenticate_token

@pytest.fixture(autouse=True)
def reset_serializer():
    # Reset serializer and tokens before each test
    from utils import auth_utils
    auth_utils.serializer = None
    auth_utils.tokens = {}


def test_generate_token_after_configuration():
    configure_serializer("secret-key")
    user = {"email": "alice@example.com", "id": 42}
    token = generate_token(user)

    from utils import auth_utils
    assert isinstance(token, str)
    assert token in auth_utils.tokens
    assert auth_utils.tokens[token] == 42


def test_generate_token_without_configure_raises():
    user = {"email": "bob@example.com", "id": 1}
    with pytest.raises(RuntimeError):
        generate_token(user)


def test_verify_token_valid_active_user():
    configure_serializer("secret-key")
    user_repo = Mock()
    user = {"email": "charlie@example.com", "id": 7, "status": "active"}
    token = generate_token(user)
    user_repo.get_user_by_email.return_value = user

    app = Flask(__name__)
    with app.app_context():
        result = verify_token(token, user_repo)
        assert result is True
        assert g.current_user == user


def test_verify_token_invalid_token():
    configure_serializer("secret-key")
    user_repo = Mock()
    app = Flask(__name__)
    with app.app_context():
        result = verify_token("not-a-real-token", user_repo)
        assert result is False


def test_verify_token_inactive_user():
    configure_serializer("secret-key")
    user_repo = Mock()
    token = generate_token({"email": "dave@example.com", "id": 11})
    user_repo.get_user_by_email.return_value = {"email": "dave@example.com", "status": "inactive"}

    app = Flask(__name__)
    with app.app_context():
        result = verify_token(token, user_repo)
        assert result is False


def test_authenticate_token_missing_header():
    app = Flask(__name__)
    user_repo = Mock()
    with app.test_request_context(headers={}):
        user, error, status = authenticate_token(user_repo)
        assert user is None
        assert status == 401


def test_authenticate_token_invalid_token():
    app = Flask(__name__)
    user_repo = Mock()
    configure_serializer("secret-key")
    with app.test_request_context(headers={"Authorization": "Bearer invalid-token"}):
        user, error, status = authenticate_token(user_repo)
        assert user is None
        assert status == 401


def test_authenticate_token_success():
    app = Flask(__name__)
    configure_serializer("secret-key")

    fake_user = {"email": "eva@example.com", "id": 9}
    token = generate_token(fake_user)

    user_repo = Mock()
    user_repo.get_user_by_email.return_value = fake_user

    with app.test_request_context(headers={"Authorization": f"Bearer {token}"}):
        user, error, status = authenticate_token(user_repo)
        assert user == fake_user
        assert error is None
        assert status is None
