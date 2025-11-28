# tests/test_user_routes.py
import pytest
from flask import Flask
from unittest.mock import Mock
from routes.user_routes import user_bp
from utils import auth_utils
from routes import user_routes

@pytest.fixture
def app_with_service():
    app = Flask(__name__)
    app.user_service = Mock()
    app.user_repo = Mock()
    app.register_blueprint(user_bp, url_prefix="/api")
    with app.app_context():
        yield app

@pytest.fixture
def client(app_with_service):
    return app_with_service.test_client()


# ----- REGISTER -----
def test_register_missing_json(client):
    resp = client.post("/api/register", json={})
    assert resp.status_code == 400
    assert resp.json["error"] == "Missing JSON body"

def test_register_success(client, app_with_service):
    app_with_service.user_service.register_user.return_value = (True, None)
    data = {"first_name": "Alice", "last_name": "Smith", "email": "a@example.com",
            "password": "pass", "role": "user"}
    resp = client.post("/api/register", json=data)
    assert resp.status_code == 201
    assert resp.json["message"] == "User created successfully"

def test_register_failure(client, app_with_service):
    app_with_service.user_service.register_user.return_value = (False, "Email exists")
    data = {"first_name": "Alice", "last_name": "Smith", "email": "a@example.com",
            "password": "pass", "role": "user"}
    resp = client.post("/api/register", json=data)
    assert resp.status_code == 400
    assert resp.json["error"] == "Email exists"


# ----- LOGIN -----
def test_login_missing_json(client):
    resp = client.post("/api/login", json = {})
    assert resp.status_code == 400
    assert resp.json["error"] == "Missing JSON body"

def test_login_missing_fields(client):
    resp = client.post("/api/login", json={"email": "a@example.com"})
    assert resp.status_code == 400
    assert resp.json["error"] == "Missing email or password"

def test_login_success(client, app_with_service):
    fake_user = Mock(to_dict=lambda: {"email": "a@example.com"})
    token = "fake-token"
    app_with_service.user_service.login_user.return_value = (fake_user, token, None)
    data = {"email": "a@example.com", "password": "pass"}
    resp = client.post("/api/login", json=data)
    assert resp.status_code == 200
    assert resp.json["token"] == token
    assert resp.json["user"]["email"] == "a@example.com"

def test_login_failure(client, app_with_service):
    app_with_service.user_service.login_user.return_value = (None, None, "Invalid credentials")
    data = {"email": "a@example.com", "password": "wrong"}
    resp = client.post("/api/login", json=data)
    assert resp.status_code == 401
    assert resp.json["error"] == "Invalid credentials"


# ----- RESET PASSWORD -----
def test_reset_password_missing_auth(client, monkeypatch):
    monkeypatch.setattr(user_routes, "authenticate_token",
                        lambda repo: (None, {"error": "Unauthorized"}, 401))
    resp = client.post("/api/users/reset_password", json={"old_password": "x", "new_password": "y"})
    assert resp.status_code == 401

def test_reset_password_success(client, app_with_service, monkeypatch):
    fake_user = Mock(email="a@example.com")
    monkeypatch.setattr(user_routes, "authenticate_token",
                        lambda repo: (fake_user, None, None))
    app_with_service.user_service.reset_password.return_value = None
    resp = client.post("/api/users/reset_password", json={"old_password": "x", "new_password": "y"})
    assert resp.status_code == 200
    assert resp.json["message"] == "Password updated successfully"

def test_reset_password_failure(client, app_with_service, monkeypatch):
    fake_user = Mock(email="a@example.com")
    monkeypatch.setattr(user_routes, "authenticate_token",
                        lambda repo: (fake_user, None, None))
    app_with_service.user_service.reset_password.return_value = "Wrong password"
    resp = client.post("/api/users/reset_password", json={"old_password": "x", "new_password": "y"})
    assert resp.status_code == 401
    assert resp.json["error"] == "Wrong password"


# ----- UPDATE PROFILE -----
def test_update_profile_missing_fields(client):
    resp = client.put("/api/users/profile", json={"email": "a@example.com"})
    assert resp.status_code == 400
    assert resp.json["error"] == "Email and password are required"

def test_update_profile_success(client, app_with_service):
    app_with_service.user_service.update_profile.return_value = None
    data = {"email": "a@example.com", "password": "pass", "first_name": "Alice", "last_name": "Smith"}
    resp = client.put("/api/users/profile", json=data)
    assert resp.status_code == 200
    assert resp.json["message"] == "Profile updated successfully"

def test_update_profile_failure(client, app_with_service):
    app_with_service.user_service.update_profile.return_value = "Error updating"
    data = {"email": "a@example.com", "password": "pass", "first_name": "Alice", "last_name": "Smith"}
    resp = client.put("/api/users/profile", json=data)
    assert resp.status_code == 400
    assert resp.json["error"] == "Error updating"
