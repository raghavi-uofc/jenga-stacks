import pytest
from flask import Flask
from unittest.mock import Mock
from routes.admin_routes import admin_bp
from utils import auth_utils
from routes import admin_routes

@pytest.fixture
def app_with_repo():
    app = Flask(__name__)
    app.user_repo = Mock()
    app.register_blueprint(admin_bp, url_prefix="/api")
    with app.app_context():
        yield app

@pytest.fixture
def client(app_with_repo):
    return app_with_repo.test_client()

def test_admin_list_users_unauthorized(client, monkeypatch):
    monkeypatch.setattr(admin_routes, "authenticate_token", lambda repo: (None, {"error": "Unauthorized"}, 401))
    resp = client.get("/api/admin/users")
    assert resp.status_code == 401
    assert resp.json["error"] == "Unauthorized"

def test_admin_list_users_forbidden_for_non_admin(client, monkeypatch):
    monkeypatch.setattr(admin_routes, "authenticate_token", lambda repo: (Mock(role="user"), None, None))
    resp = client.get("/api/admin/users")
    assert resp.status_code == 403
    assert resp.json["error"] == "Forbidden – admin access required"

def test_admin_list_users_success(app_with_repo, monkeypatch):
    client = app_with_repo.test_client()
    app_with_repo.user_repo.get_all_users.return_value = [
        Mock(to_dict=lambda: {"email": "admin@test.com", "role": "admin"})
    ]
    monkeypatch.setattr(admin_routes, "authenticate_token", lambda repo: (Mock(role="admin"), None, None))
    resp = client.get("/api/admin/users")
    assert resp.status_code == 200
    assert "users" in resp.json

def test_admin_delete_user_success(app_with_repo, monkeypatch):
    client = app_with_repo.test_client()
    app_with_repo.user_repo.delete_user.return_value = True
    monkeypatch.setattr(admin_routes, "authenticate_token", lambda repo: (Mock(role="admin"), None, None))
    resp = client.delete("/api/admin/users/1")
    assert resp.status_code == 200
    assert resp.json["message"] == "User deleted"

def test_admin_delete_user_not_found(app_with_repo, monkeypatch):
    client = app_with_repo.test_client()
    app_with_repo.user_repo.delete_user.return_value = False
    monkeypatch.setattr(admin_routes, "authenticate_token", lambda repo: (Mock(role="admin"), None, None))
    resp = client.delete("/api/admin/users/999")
    assert resp.status_code == 404
    assert resp.json["error"] == "User not found"
