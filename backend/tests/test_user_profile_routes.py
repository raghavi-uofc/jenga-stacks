# # to be updated

# import utils.auth_utils as auth_utils
# import app as app_module

# # Tests password reset and profile update flows.


# def _token(email="user@example.com"):
#     return auth_utils.serializer.dumps(email)


# def test_reset_password_success(monkeypatch, client):
#     # Valid token and correct old password should update password.
#     monkeypatch.setattr("routes.user_routes.get_user_by_email", lambda email: {"id": 1, "password": "old"})
#     monkeypatch.setattr(app_module.bcrypt, "check_password_hash", lambda stored, supplied: True)
#     monkeypatch.setattr(app_module.bcrypt, "generate_password_hash", lambda pwd: b"new-hash")

#     resp = client.post(
#         "/api/users/reset_password",
#         headers={"Authorization": f"Bearer {_token()}"},
#         json={"old_password": "old", "new_password": "new"},
#     )
#     assert resp.status_code == 200
#     assert resp.get_json()["message"] == "Password updated successfully"


# def test_reset_password_wrong_old(monkeypatch, client):
#     # Wrong old password should return 401.
#     monkeypatch.setattr("routes.user_routes.get_user_by_email", lambda email: {"id": 1, "password": "old"})
#     monkeypatch.setattr(app_module.bcrypt, "check_password_hash", lambda stored, supplied: False)

#     resp = client.post(
#         "/api/users/reset_password",
#         headers={"Authorization": f"Bearer {_token()}"},
#         json={"old_password": "bad", "new_password": "new"},
#     )
#     assert resp.status_code == 401
#     assert resp.get_json()["error"] == "Old password incorrect"


# def test_update_profile_success(monkeypatch, client):
#     # Correct password updates first/last name.
#     user = {"id": 1, "email": "user@example.com", "password": "old"}
#     monkeypatch.setattr("routes.user_routes.get_user_by_email", lambda email: user)
#     monkeypatch.setattr(app_module.bcrypt, "check_password_hash", lambda stored, supplied: True)

#     resp = client.put(
#         "/api/users/profile",
#         json={"email": "user@example.com", "first_name": "New", "last_name": "Name", "password": "old"},
#     )
#     assert resp.status_code == 200
#     assert resp.get_json()["message"] == "Profile updated successfully"


# def test_update_profile_bad_password(monkeypatch, client):
#     # Incorrect password should return 400.
#     user = {"id": 1, "email": "user@example.com", "password": "old"}
#     monkeypatch.setattr("routes.user_routes.get_user_by_email", lambda email: user)
#     monkeypatch.setattr(app_module.bcrypt, "check_password_hash", lambda stored, supplied: False)

#     resp = client.put(
#         "/api/users/profile",
#         json={"email": "user@example.com", "first_name": "New", "last_name": "Name", "password": "bad"},
#     )
#     assert resp.status_code == 400
#     assert resp.get_json()["error"] == "Incorrect password"
