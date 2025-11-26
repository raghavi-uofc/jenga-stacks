# # to be updated

# import utils.auth_utils as auth_utils

# # Tests project routes for auth enforcement and required-field validation.


# def test_save_project_draft_requires_auth(client):
#     # No Authorization header should result in 401.
#     resp = client.post("/api/projects/save", json={})
#     assert resp.status_code == 401
#     assert resp.get_json()["error"] == "Unauthorized"


# def test_submit_project_missing_required_fields(monkeypatch, client):
#     # Authenticated but missing required payload fields should 400.
#     token = auth_utils.serializer.dumps("user@example.com")
#     monkeypatch.setattr("routes.project_routes.get_user_by_email", lambda email: {"id": 1})

#     resp = client.post(
#         "/api/projects/submit",
#         json={"name": "", "goal_description": "", "start_date": "", "end_date": ""},
#         headers={"Authorization": f"Bearer {token}"},
#     )

#     assert resp.status_code == 400
#     assert resp.get_json()["error"] == "Missing required fields"


# def test_delete_project_requires_auth(client):
#     # Delete without a bearer token should 401.
#     resp = client.delete("/api/projects/123")
#     assert resp.status_code == 401
#     assert resp.get_json()["error"] == "Unauthorized"
