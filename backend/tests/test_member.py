import pytest
from models.member import Member  # adjust import path if needed

def test_member_init():
    m = Member("John", "Doe", language="Python", framework="Django")
    assert m.first_name == "John"
    assert m.last_name == "Doe"
    assert m.language == "Python"
    assert m.framework == "Django"
    assert m.member == "John Doe"
    assert m.to_dict() == {
        "member": "John Doe",
        "language": "Python",
        "framework": "Django"
    }

def test_from_full_name_two_parts():
    m = Member.from_full_name("Jane Smith", language="Java", framework="Spring")
    assert m.first_name == "Jane"
    assert m.last_name == "Smith"
    assert m.language == "Java"
    assert m.framework == "Spring"

def test_from_full_name_one_part():
    m = Member.from_full_name("Cher")
    assert m.first_name == "Cher"
    assert m.last_name == ""
    assert m.member == "Cher"
