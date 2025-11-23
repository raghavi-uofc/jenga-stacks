import utils.auth_utils as auth_utils

def test_verify_token_valid(monkeypatch, app):
    # Happy path: token deserializes and active user is returned.
    auth_utils.configure_serializer("secret-key")
    token = auth_utils.serializer.dumps("user@example.com")
    monkeypatch.setattr(auth_utils, "get_user_by_email", lambda email: {"email": email, "status": "active"})
    with app.app_context():
        assert auth_utils.verify_token(token) is True

def test_verify_token_invalid_token(monkeypatch, app):
    # Invalid or empty tokens should fail gracefully.
    auth_utils.configure_serializer("secret-key")
    monkeypatch.setattr(auth_utils, "get_user_by_email", lambda email: None)
    with app.app_context():
        assert auth_utils.verify_token("bad-token") is False
        assert auth_utils.verify_token("") is False
