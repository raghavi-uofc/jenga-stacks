import app as app_module


def test_register_success(monkeypatch, client):
    # New user: insert_user should be called and endpoint returns 201.
    monkeypatch.setattr("routes.user_routes.get_user_by_email", lambda email: None)
    inserted = {}
    monkeypatch.setattr("routes.user_routes.insert_user", lambda cur, *args, **kwargs: inserted.update({"called": True}))
    monkeypatch.setattr(app_module.bcrypt, "generate_password_hash", lambda pwd: b"hashed-pw")

    resp = client.post("/api/register", json={
        "first_name": "Jane",
        "last_name": "Doe",
        "email": "jane@example.com",
        "password": "pw",
        "role": "regular",
    })
    assert resp.status_code == 201
    assert resp.get_json()["message"] == "User created successfully"
    assert inserted.get("called") is True


def test_login_success(monkeypatch, client):
    # Valid credentials: returns token and user payload.
    user = {
        "id": 1,
        "email": "jane@example.com",
        "firstName": "Jane",
        "lastName": "Doe",
        "role": "regular",
        "status": "active",
        "password": "hashed",
    }
    monkeypatch.setattr("routes.user_routes.get_user_by_email", lambda email: user)
    monkeypatch.setattr(app_module.bcrypt, "check_password_hash", lambda hashed, plain: True)
    monkeypatch.setattr("routes.user_routes.generate_token", lambda u: "token-123")

    resp = client.post("/api/login", json={"email": "jane@example.com", "password": "pw"})
    body = resp.get_json()
    assert resp.status_code == 200
    assert body["token"] == "token-123"
    assert body["user"]["id"] == 1


def test_login_inactive_user(monkeypatch, client):
    # Inactive user or bad password should yield 401.
    inactive = {"status": "inactive", "password": "hashed"}
    monkeypatch.setattr("routes.user_routes.get_user_by_email", lambda email: inactive)
    monkeypatch.setattr(app_module.bcrypt, "check_password_hash", lambda hashed, plain: False)

    resp = client.post("/api/login", json={"email": "jane@example.com", "password": "pw"})
    assert resp.status_code == 401
    assert resp.get_json()["error"] == "Invalid credentials"
