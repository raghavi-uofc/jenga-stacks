# models/project.py
from typing import List, Optional
from models.member import Member
from models.project import Project

class Budget:
    def __init__(self, project_id=None, floor=None, ceiling=None):
        self.project_id = project_id
        self.floor = floor
        self.ceiling = ceiling

    def to_dict(self):
        return {
            "project_id": self.project_id,
            "budget_floor": self.floor,
            "budget_ceiling": self.ceiling,
        }

class Timeframe:
    def __init__(self, project_id=None, start=None, end=None):
        self.project_id = project_id
        self.start = start
        self.end = end

    def to_dict(self):
        return {
            "project_id": self.project_id,
            "start_date": self.start,
            "end_date": self.end,
        }

class ProjectDetailed:
    def __init__(
        self,
        project: Optional[Project] = None,
        budget: Optional[Budget] = None,
        timeframe: Optional[Timeframe] = None,
        team_members: Optional[List[Member]] = None,
        llm_response: Optional[dict] = None
    ):
        self.project = project
        self.budget = budget
        self.timeframe = timeframe
        self.team_members = team_members or []
        self.llm_response = llm_response

    def to_dict(self):
        return {
            "id": self.project.id if self.project else None,
            "name": self.project.name if self.project else None,
            "requirement_description": self.project.requirement_description if self.project else None,
            "goal_description": self.project.goal_description if self.project else None,
            "status": self.project.status if self.project else None,
            "user_id": self.project.user_id if self.project else None,
            "budget_floor": self.budget.floor if self.budget else None,
            "budget_ceiling": self.budget.ceiling if self.budget else None,
            "start_date": self.timeframe.start if self.timeframe else None,
            "end_date": self.timeframe.end if self.timeframe else None,
            "team_members": [m.to_dict() for m in self.team_members],
            "llm_response": self.llm_response
        }
        
    