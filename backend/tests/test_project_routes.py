# tests/test_project_routes.py

import pytest
from flask import Flask
from unittest.mock import Mock

from routes.project_routes import project_bp
import routes.project_routes as project_routes


@pytest.fixture
def app_with_repo():
    app = Flask(__name__)

    app.user_repo = Mock()
    app.project_service = Mock()

    app.register_blueprint(project_bp, url_prefix="/api")

    with app.app_context():
        yield app



@pytest.fixture
def client(app_with_repo):
    return app_with_repo.test_client()


# ------------------------------
# Authentication Tests
# ------------------------------

def test_save_project_draft_unauthorized(client, monkeypatch):
    monkeypatch.setattr(
        project_routes,
        "authenticate_token",
        lambda repo: (None, {"error": "Unauthorized"}, 401)
    )

    resp = client.post("/api/projects/save", json={"name": "X"})
    assert resp.status_code == 401
    assert resp.json["error"] == "Unauthorized"


# ------------------------------
# Draft Saving
# ------------------------------

def test_save_project_draft_success(app_with_repo, monkeypatch):
    client = app_with_repo.test_client()

    fake_user = Mock(id=5)
    monkeypatch.setattr(project_routes, "authenticate_token",
                        lambda repo: (fake_user, None, None))

    app_with_repo.project_service.save_draft.return_value = {"project_id": 1}

    resp = client.post("/api/projects/save", json={"name": "Demo"})
    assert resp.status_code == 200
    assert resp.json["message"] == "Project saved as draft"


def test_save_project_draft_value_error(app_with_repo, monkeypatch):
    client = app_with_repo.test_client()

    fake_user = Mock(id=5)
    monkeypatch.setattr(project_routes, "authenticate_token",
                        lambda repo: (fake_user, None, None))

    app_with_repo.project_service.save_draft.side_effect = ValueError("bad")

    resp = client.post("/api/projects/save", json={"name": "Demo"})
    assert resp.status_code == 400
    assert resp.json["error"] == "bad"


# # ------------------------------
# # Submit Project
# # ------------------------------

def test_submit_project_unauthorized(client, monkeypatch):
    monkeypatch.setattr(
        project_routes,
        "authenticate_token",
        lambda repo: (None, {"error": "Unauthorized"}, 401)
    )
    resp = client.post("/api/projects/submit", json={"id": 1})
    assert resp.status_code == 401


def test_submit_project_success(app_with_repo, monkeypatch):
    client = app_with_repo.test_client()

    fake_user = Mock(id=10)
    monkeypatch.setattr(project_routes, "authenticate_token",
                        lambda repo: (fake_user, None, None))

    app_with_repo.project_service.submit_project.return_value = (5, 99, "LLM response text")

    resp = client.post("/api/projects/submit", json={"name": "Test Project"})
    assert resp.status_code == 200
    assert resp.json["project_id"] == 5
    assert resp.json["prompt_id"] == 99
    assert resp.json["llm_response"] == "LLM response text"


def test_submit_project_bad_request(app_with_repo, monkeypatch):
    client = app_with_repo.test_client()

    fake_user = Mock(id=10)
    monkeypatch.setattr(project_routes, "authenticate_token",
                        lambda repo: (fake_user, None, None))

    app_with_repo.project_service.submit_project.side_effect = ValueError("bad project")

    resp = client.post("/api/projects/submit", json={"id": 5})
    assert resp.status_code == 400
    assert resp.json["error"] == "bad project"


# # ------------------------------
# # List Projects
# # ------------------------------

def test_list_projects_forbidden(app_with_repo, monkeypatch):
    client = app_with_repo.test_client()

    monkeypatch.setattr(project_routes, "authenticate_token",
                        lambda repo: (Mock(role="guest"), None, None))

    resp = client.get("/api/projects/user/0")
    assert resp.status_code == 403
    assert resp.json["error"] == "Forbidden"


def test_list_projects_by_user_success(app_with_repo, monkeypatch):
    client = app_with_repo.test_client()

    fake_user = Mock(id=7)
    monkeypatch.setattr(project_routes, "authenticate_token",
                        lambda repo: (fake_user, None, None))

    app_with_repo.project_service.get_projects_by_user.return_value = [
        Mock(to_dict=lambda: {"id": 1})
    ]

    resp = client.get("/api/projects/user/7")
    assert resp.status_code == 200
    assert "projects" in resp.json
    assert resp.json["projects"][0]["id"] == 1

# # ------------------------------
# # Delete Project
# # ------------------------------

def test_delete_project_success(app_with_repo, monkeypatch):
    client = app_with_repo.test_client()

    fake_user = Mock(id=3)
    monkeypatch.setattr(project_routes, "authenticate_token",
                        lambda repo: (fake_user, None, None))

    app_with_repo.project_service.delete_project.return_value = True

    resp = client.delete("/api/projects/1")
    assert resp.status_code == 200
    assert resp.json["message"] == "Project deleted"



def test_delete_project_forbidden(app_with_repo, monkeypatch):
    client = app_with_repo.test_client()

    monkeypatch.setattr(project_routes, "authenticate_token",
                        lambda repo: (Mock(id=3), None, None))

    app_with_repo.project_service.delete_project.side_effect = PermissionError("forbidden")

    resp = client.delete("/api/projects/1")
    assert resp.status_code == 403
    assert resp.json["error"] == "forbidden"


# # ------------------------------
# # Get Project Details
# # ------------------------------

def test_get_project_details_not_found(app_with_repo, monkeypatch):
    client = app_with_repo.test_client()

    fake_user = Mock(id=9)
    monkeypatch.setattr(project_routes, "authenticate_token",
                        lambda repo: (fake_user, None, None))

    app_with_repo.project_service.get_project_details.return_value = None

    resp = client.get("/api/projects/999")
    assert resp.status_code == 404
    assert resp.json["message"] == "Project not found"


def test_get_project_details_success(app_with_repo, monkeypatch):
    client = app_with_repo.test_client()

    fake_user = Mock(id=9)
    monkeypatch.setattr(project_routes, "authenticate_token",
                        lambda repo: (fake_user, None, None))

    proj = Mock(to_dict=lambda: {"id": 99, "name": "Test Project"})
    app_with_repo.project_service.get_project_details.return_value = proj

    resp = client.get("/api/projects/99")
    assert resp.status_code == 200
    assert resp.json["project"]["id"] == 99
