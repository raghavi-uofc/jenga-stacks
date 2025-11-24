import app as app_module
import utils.auth_utils as auth_utils

# Tests happy paths for project save/submit with stubbed DB and LLM.


def _token(email="user@example.com"):
    return auth_utils.serializer.dumps(email)


def test_save_project_draft_success(monkeypatch, client):
    # Ensure user exists and belongs to token email
    monkeypatch.setattr("routes.project_routes.get_user_by_email", lambda email: {"id": 1})
    # Short-circuit full save logic; return a fake project_id
    monkeypatch.setattr("routes.project_routes.save_project_complete", lambda data, user_id, status: 10)

    class _Cursor:
        def __init__(self):
            self.lastrowid = 10
            self._fetch_calls = 0

        def execute(self, *args, **kwargs):
            return None

        def fetchone(self):
            # Return a dict when asked for MAX(version); otherwise None
            self._fetch_calls += 1
            return {"max_version": 0} if self._fetch_calls == 1 else None

        def fetchall(self):
            return []

        def __enter__(self):
            return self

        def __exit__(self, exc_type, exc_val, exc_tb):
            return False

    class _Conn:
        def __init__(self):
            self.committed = False

        def cursor(self, *args, **kwargs):
            return _Cursor()

        def commit(self):
            self.committed = True

        def rollback(self):
            self.rolled_back = True

    fake_mysql = type("Obj", (), {"connection": _Conn()})()
    # Patch both app module and project_routes to ensure shared mysql stub
    monkeypatch.setattr(app_module, "mysql", fake_mysql)
    monkeypatch.setattr("routes.project_routes.mysql", fake_mysql)

    data = {
        "name": "Proj",
        "goal_description": "Goal",
        "requirement_description": "Reqs",
        "start_date": "2099-01-01",
        "end_date": "2099-02-01",
        "budget_floor": 0,
        "budget_ceiling": 100,
        "team_members": [],
    }
    resp = client.post("/api/projects/save", json=data, headers={"Authorization": f"Bearer {_token()}"})
    assert resp.status_code == 200
    assert resp.get_json()["message"] == "Project saved as draft"
    assert resp.get_json()["project_id"] == 10


def test_submit_project_success(monkeypatch, client):
    monkeypatch.setattr("routes.project_routes.get_user_by_email", lambda email: {"id": 1})
    monkeypatch.setattr("routes.project_routes.generate_project_plan", lambda data: ("prompt", "llm response"))
    # Short-circuit full save logic; return a fake project_id
    monkeypatch.setattr("routes.project_routes.save_project_complete", lambda data, user_id, status: 10)

    class _Cursor:
        def __init__(self):
            self.lastrowid = 10
            self._fetch_calls = 0

        def execute(self, *args, **kwargs):
            return None

        def fetchone(self):
            # First call used for MAX(version), second for potential checks
            self._fetch_calls += 1
            return {"max_version": 0} if self._fetch_calls == 1 else None

        def fetchall(self):
            return []

        def __enter__(self):
            return self

        def __exit__(self, exc_type, exc_val, exc_tb):
            return False

    class _Conn:
        def __init__(self):
            self.committed = False

        def cursor(self, *args, **kwargs):
            return _Cursor()

        def commit(self):
            self.committed = True

        def rollback(self):
            self.rolled_back = True

    fake_mysql = type("Obj", (), {"connection": _Conn()})()
    # Patch both app module and project_routes to ensure shared mysql stub
    monkeypatch.setattr(app_module, "mysql", fake_mysql)
    monkeypatch.setattr("routes.project_routes.mysql", fake_mysql)

    data = {
        "name": "Proj",
        "goal_description": "Goal",
        "requirement_description": "Reqs",
        "start_date": "2099-01-01",
        "end_date": "2099-02-01",
        "budget_floor": 0,
        "budget_ceiling": 100,
        "team_members": [],
    }
    resp = client.post("/api/projects/submit", json=data, headers={"Authorization": f"Bearer {_token()}"})
    body = resp.get_json()
    assert resp.status_code == 200
    assert body["message"] == "Project submitted successfully"
    assert body["project_id"] == 10
    assert body["prompt_id"] == 10
    assert body["llm_response"] == "llm response"
