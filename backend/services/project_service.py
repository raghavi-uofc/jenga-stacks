from datetime import datetime
from models.project_detailed import ProjectDetailed, Budget, Timeframe
from models.project import Project
from models.member import Member
from utils.prompt_utils import contains_invalid_phrase
from utils.gemini_utils import generate_project_plan

class ProjectService:
    def __init__(self, project_repo):
        self.project_repo = project_repo
        
    # Project Detail Validation 
    def validate_project(self, project_detailed):
        validated = {}
        self._validate_name_and_goal(project_detailed, validated)
        self._validate_budget(project_detailed, validated)
        self._validate_timeframe(project_detailed, validated)
        self._validate_team_members(project_detailed, validated)
        return validated


    # ---------------- NAME & GOAL ----------------
    def _validate_name_and_goal(pd, out):
        name = pd.project.name if pd.project else None
        goal = pd.project.goal_description if pd.project else None
        if not name:
            raise ValueError("Project name is required")

        if not goal:
            raise ValueError("Goal description is required")

        out["name"] = name
        out["goal_description"] = goal


    # ---------------- BUDGET ----------------
    def _validate_budget(pd, out):
        floor = pd.budget.floor if pd.budget else None
        ceiling = pd.budget.ceiling if pd.budget else None

        if floor not in (None, ""):
            floor = float(floor)
            if floor < 0:
                raise ValueError("Budget floor cannot be negative")

        if ceiling not in (None, ""):
            ceiling = float(ceiling)
            if ceiling < 0:
                raise ValueError("Budget ceiling cannot be negative")

        if floor not in (None, "") and ceiling not in (None, ""):
            if floor > ceiling:
                raise ValueError("Budget floor cannot exceed budget ceiling")

        out["budget_floor"] = floor
        out["budget_ceiling"] = ceiling


    # ---------------- TIMEFRAME ----------------
    def _validate_timeframe(pd, out):
        start = pd.timeframe.start if pd.timeframe else None
        end = pd.timeframe.end if pd.timeframe else None

        def parse_date(value):
            try:
                return datetime.fromisoformat(value)
            except:
                raise ValueError("Dates must be in format YYYY-MM-DD")

        now = datetime.now()

        if start:
            s = parse_date(start)
            if s < now:
                raise ValueError("Start date must be in the future")
            out["start_date"] = s

        if end:
            e = parse_date(end)
            if e < now:
                raise ValueError("End date must be in the future")
            out["end_date"] = e

        if start and end:
            if out["start_date"] >= out["end_date"]:
                raise ValueError("Start date must be earlier than end date")


    # ---------------- TEAM MEMBERS ----------------
    def _validate_team_members(pd, out):
        team = pd.team_members or []

        if not isinstance(team, list):
            raise ValueError("team_members must be a list")

        out["team_members"] = team
    

    ##########
    ## Project Detailed
    #########
    def _validate_req_fields(self, data):
        required = ['name', 'goal_description', 'start_date', 'end_date']

        if contains_invalid_phrase(data):
            raise ValueError("Input contains invalid or unsupported project topics")

        if not all(data.get(f) for f in required):
            raise ValueError("Missing required fields")
    
    def build_project_detailed(self, data, user_id):
        raw_members = data.get("team_members", [])
        team_members = [
            Member.from_full_name(
                m.get("member", ""),
                m.get("language"),
                m.get("framework")
            )
            for m in raw_members
        ]

        return ProjectDetailed(
            project=Project(
                name=data['name'],
                requirement_description=data.get('requirement_description'),
                goal_description=data['goal_description'],
                status='draft',
                user_id=user_id,
            ),
            budget=Budget(
                floor=data.get('budget_floor'),
                ceiling=data.get('budget_ceiling'),
            ),
            timeframe=Timeframe(
                start=data['start_date'],
                end=data['end_date'],
            ),
            team_members=team_members
        )
    
    def save_draft(self, data: dict, user_id: int) -> int:
        # Validate required fields
        self._validate_req_fields(self, data)
        project = self.build_project_detailed(data, user_id)
        self.validate_project(project)

        # Save project to DB
        project_id = self.project_repo.save_project_complete(project, user_id, project_status = 'draft')
        return project_id
    
    
    def submit_project(self, data: dict, user_id: int) -> int:
        # Validate required fields
        self._validate_req_fields(self, data)
        project = self.build_project_detailed(data, user_id)
        self.validate_project(project)
        
        # save as submitted
        project_id = self.project_repo.save_project_complete(project, user_id, project_status = 'submitted')
        
        # generate project plan
        prompt, llm_response_text = generate_project_plan(data)
        
        # save prompt
        prompt_id = self.project_repo.save_prompt_version(project_id, prompt)
        # save llm response
        self.project_repo.save_llm_history(project_id, prompt_id, llm_response_text)
        
        return project_id, prompt_id, llm_response_text
    
    def get_projects_by_user(self, user_id):
        return self.project_repo.get_projects_by_user(user_id).to_dict()
    
    def delete_project(self, project_id, user_id):
        # Fetch raw rows from DB
        detailed_rows = self.project_repo.get_project_details_rows(project_id, user_id)
        if not detailed_rows:
            return None
        
               # Convert first row to dict for ProjectDetailed
        first_row = detailed_rows[0]
        project_dict = {
            'name': first_row['name'],
            'requirement_description': first_row.get('requirementDescription'),
            'goal_description': first_row.get('goalDescription'),
            'budget_floor': first_row.get('budget_floor'),
            'budget_ceiling': first_row.get('budget_ceiling'),
            'start_date': first_row.get('project_start_date'),
            'end_date': first_row.get('project_end_date'),
            'team_members': []
        }

        # Aggregate team members and their skills
        members_dict = {}
        for row in detailed_rows:
            member_name = row.get('member')
            if not member_name:
                continue
            if member_name not in members_dict:
                members_dict[member_name] = {'member': member_name, 'language': None, 'framework': None}

            skill = row.get('skill')
            category = row.get('category')
            if skill and category:
                if category == 'Language':
                    members_dict[member_name]['language'] = skill
                elif category == 'Framework':
                    members_dict[member_name]['framework'] = skill

        project_dict['team_members'] = list(members_dict.values())

        # Build ProjectDetailed object
        project_detailed = self.project_repo.build_project_detailed(project_dict, user_id)

        # Attach LLM response if project is submitted
        if project_detailed.project.status == 'submitted':
            project_detailed.llm_response = self.project_repo.get_latest_generation_response(project_id)

        return project_detailed.to_dict()