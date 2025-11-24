import utils.auth_utils as auth_utils

# Tests admin routes for proper auth/role checks and user deletion handling.


def _make_token(email="admin@example.com"):
    return auth_utils.serializer.dumps(email)


def test_admin_list_users_as_admin(monkeypatch, client):
    # Admin token should allow listing users.
    monkeypatch.setattr("routes.admin_routes.get_user_by_email", lambda email: {"role": "admin"})
    monkeypatch.setattr("routes.admin_routes.get_users", lambda cur: [{"id": 1, "email": "a@b.com"}])

    resp = client.get("/api/admin/users", headers={"Authorization": f"Bearer {_make_token()}"})
    assert resp.status_code == 200
    assert resp.get_json()["users"] == [{"id": 1, "email": "a@b.com"}]


def test_admin_list_users_non_admin(monkeypatch, client):
    # Non-admin token should be rejected.
    monkeypatch.setattr("routes.admin_routes.get_user_by_email", lambda email: {"role": "regular"})

    resp = client.get("/api/admin/users", headers={"Authorization": f"Bearer {_make_token()}"})
    assert resp.status_code == 401
    assert resp.get_json()["error"] == "Unauthorized"


def test_admin_delete_user_success(monkeypatch, client):
    # Admin token + existing user should delete and return success.
    monkeypatch.setattr("routes.admin_routes.get_user_by_email", lambda email: {"role": "admin"})

    class _Cursor:
        def __init__(self, rowcount=1):
            self.rowcount = rowcount

        def execute(self, *args, **kwargs):
            return None

        def __enter__(self):
            return self

        def __exit__(self, exc_type, exc_val, exc_tb):
            return False

    class _Conn:
        def __init__(self):
            self.committed = False

        def cursor(self):
            return _Cursor(rowcount=1)

        def commit(self):
            self.committed = True

        def rollback(self):
            self.rolled_back = True

    monkeypatch.setattr("routes.admin_routes.mysql", type("Obj", (), {"connection": _Conn()})())

    resp = client.delete("/api/admin/users/5", headers={"Authorization": f"Bearer {_make_token()}"})
    assert resp.status_code == 200
    assert resp.get_json()["message"] == "User deleted"


def test_admin_delete_user_not_found(monkeypatch, client):
    # Admin token + missing user should return 404.
    monkeypatch.setattr("routes.admin_routes.get_user_by_email", lambda email: {"role": "admin"})

    class _Cursor:
        def __init__(self, rowcount=0):
            self.rowcount = rowcount

        def execute(self, *args, **kwargs):
            return None

        def __enter__(self):
            return self

        def __exit__(self, exc_type, exc_val, exc_tb):
            return False

    class _Conn:
        def cursor(self):
            return _Cursor(rowcount=0)

        def commit(self):
            self.committed = True

        def rollback(self):
            self.rolled_back = True

    monkeypatch.setattr("routes.admin_routes.mysql", type("Obj", (), {"connection": _Conn()})())

    resp = client.delete("/api/admin/users/5", headers={"Authorization": f"Bearer {_make_token()}"})
    assert resp.status_code == 404
    assert resp.get_json()["error"] == "User not found"
