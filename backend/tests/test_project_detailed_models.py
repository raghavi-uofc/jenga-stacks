import pytest
from models.project_detailed import Budget, Timeframe, ProjectDetailed
from unittest.mock import Mock

def test_budget_to_dict():
    budget = Budget(project_id=1, floor=1000, ceiling=5000)
    d = budget.to_dict()
    assert d["project_id"] == 1
    assert d["budget_floor"] == 1000
    assert d["budget_ceiling"] == 5000

def test_timeframe_to_dict():
    tf = Timeframe(project_id=2, start="2025-11-01", end="2025-12-01")
    d = tf.to_dict()
    assert d["project_id"] == 2
    assert d["start_date"] == "2025-11-01"
    assert d["end_date"] == "2025-12-01"

def test_project_detailed_defaults():
    pd = ProjectDetailed()
    d = pd.to_dict()
    assert d["id"] is None
    assert d["name"] is None
    assert d["budget_floor"] is None
    assert d["budget_ceiling"] is None
    assert d["team_members"] == []
    assert d["llm_response"] is None

def test_project_detailed_with_all_fields():
    # Mock Project
    project = Mock()
    project.id = 10
    project.name = "Test Project"
    project.requirement_description = "Requirements"
    project.goal_description = "Goals"
    project.status = "draft"
    project.user_id = 99

    # Mock Budget and Timeframe
    budget = Budget(project_id=10, floor=1000, ceiling=5000)
    timeframe = Timeframe(project_id=10, start="2025-11-01", end="2025-12-01")

    # Mock Members
    member1 = Mock()
    member1.to_dict.return_value = {"id": 1, "name": "Alice"}
    member2 = Mock()
    member2.to_dict.return_value = {"id": 2, "name": "Bob"}

    pd = ProjectDetailed(
        project=project,
        budget=budget,
        timeframe=timeframe,
        team_members=[member1, member2],
        llm_response={"summary": "Generated text"}
    )

    d = pd.to_dict()
    assert d["id"] == 10
    assert d["name"] == "Test Project"
    assert d["requirement_description"] == "Requirements"
    assert d["goal_description"] == "Goals"
    assert d["status"] == "draft"
    assert d["user_id"] == 99
    assert d["budget_floor"] == 1000
    assert d["budget_ceiling"] == 5000
    assert d["start_date"] == "2025-11-01"
    assert d["end_date"] == "2025-12-01"
    assert d["team_members"] == [{"id": 1, "name": "Alice"}, {"id": 2, "name": "Bob"}]
    assert d["llm_response"] == {"summary": "Generated text"}
