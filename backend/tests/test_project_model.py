# tests/test_project_model.py
import pytest
from models.project import Project
from datetime import datetime

def test_project_to_dict_basic_fields():
    proj = Project(
        id=1,
        name="Test Project",
        requirement_description="Requirement",
        goal_description="Goal",
        status="draft",
        user_id=42
    )
    d = proj.to_dict()
    assert d["id"] == 1
    assert d["name"] == "Test Project"
    assert d["requirementDescription"] == "Requirement"
    assert d["goalDescription"] == "Goal"
    assert d["status"] == "draft"
    assert d["userId"] == 42

def test_project_to_dict_defaults():
    proj = Project(id=2, name="Another Project")
    d = proj.to_dict()
    assert d["id"] == 2
    assert d["name"] == "Another Project"
    assert d["requirementDescription"] is None
    assert d["goalDescription"] is None
    assert d["status"] == "draft"
    assert d["userId"] is None
