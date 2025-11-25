from datetime import datetime

# only include fields in basic Project table
class Project:
    def __init__(self, id, name, requirement_description=None, goal_description=None,
                 status='draft', user_id=None):
        self.id = id
        self.name = name
        self.requirement_description = requirement_description
        self.goal_description = goal_description
        self.status = status
        self.user_id = user_id

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "requirementDescription": self.requirement_description,
            "goalDescription": self.goal_description,
            "status": self.status,
            "userId": self.user_id,
        }
        