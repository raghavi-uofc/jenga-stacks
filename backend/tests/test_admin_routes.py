import json
import types
import pytest
from unittest.mock import patch


class FakeUser:
    def __init__(self, role):
        self.role = role

    def to_dict(self):
        return {"id": 1, "name": "Test User"}


class FakeUserRepo:
    def __init__(self, users_exist=True):
        self.users_exist = users_exist

    def get_all_users(self):
        return [FakeUser("user"), FakeUser("admin")]

    def delete_user(self, user_id):
        return self.users_exist

# admin list user tests
def test_admin_list_users_unauthorized(client, monkeypatch):
    from routes import admin_routes

    def fake_auth(repo):
        return None, (jsonify := {"error": "Unauthorized"}), 401

    monkeypatch.setattr(admin_routes, "authenticate_token", fake_auth)

    resp = client.get("/api/admin/users")
    assert resp.status_code == 401

def test_admin_list_users_forbidden_for_non_admin(client, monkeypatch):
    from routes import admin_routes

    def fake_auth(repo):
        return FakeUser(role="user"), None, 200

    monkeypatch.setattr(admin_routes, "authenticate_token", fake_auth)

    resp = client.get("/api/admin/users")
    assert resp.status_code == 403

def test_admin_list_users_success(client, monkeypatch):
    from routes import admin_routes

    def fake_auth(repo):
        return FakeUser(role="admin"), None, 200

    monkeypatch.setattr(admin_routes, "authenticate_token", fake_auth)

    monkeypatch.setattr(admin_routes.current_app, "user_repo", FakeUserRepo())

    resp = client.get("/api/admin/users")
    assert resp.status_code == 200
    data = resp.get_json()
    assert "users" in data
    assert isinstance(data["users"], list)


# admin delete user tests
def test_admin_delete_user_success(client, monkeypatch):
    from routes import admin_routes

    def fake_auth(repo):
        return FakeUser(role="admin"), None, 200

    monkeypatch.setattr(admin_routes, "authenticate_token", fake_auth)

    monkeypatch.setattr(admin_routes.current_app, "user_repo", FakeUserRepo(users_exist=True))

    resp = client.delete("/api/admin/users/1")
    assert resp.status_code == 200

def test_admin_delete_user_not_found(client, monkeypatch):
    from routes import admin_routes

    def fake_auth(repo):
        return FakeUser(role="admin"), None, 200

    monkeypatch.setattr(admin_routes, "authenticate_token", fake_auth)

    monkeypatch.setattr(admin_routes.current_app, "user_repo", FakeUserRepo(users_exist=False))

    resp = client.delete("/api/admin/users/999")
    assert resp.status_code == 404
