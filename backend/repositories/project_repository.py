from models.project_detailed import Budget, Timeframe, ProjectDetailed
from models.member import Member
from models.project import Project

class ProjectRepository:
    def __init__(self, mysql):
        self.mysql = mysql
        
    
    #####################################################
    ### Project operations
    #####################################################
    def save_project_complete(self, projectDetailed: ProjectDetailed, user_id, project_status):
        with self.mysql.connection.cursor() as cur:
            try:
                project_id = projectDetailed.project.id

                # Save or update Project
                if project_id:
                    # check ownership
                    cur.execute("SELECT 1 FROM Project WHERE id=%s AND userId=%s", (project_id, user_id))
                    if not cur.fetchone():
                        raise ValueError("Project not found or unauthorized")
                    
                    cur.execute(
                        """
                        UPDATE Project 
                        SET name=%s, requirementDescription=%s, goalDescription=%s, status=%s 
                        WHERE id=%s AND userId=%s
                        """,
                        (projectDetailed.project.name, projectDetailed.project.requirement_description, projectDetailed.project.goal_description,
                        project_status, project_id, user_id)
                    )
                    
                else:
                    cur.execute(
                        """
                        INSERT INTO Project (name, requirementDescription, goalDescription, status, userId)
                        VALUES (%s, %s, %s, %s, %s)
                        """,
                        (projectDetailed.project.name, projectDetailed.project.requirement_description, projectDetailed.project.goal_description,
                        project_status, user_id)
                    )
                    project_id = cur.lastrowid

                self.save_budget(project_id, projectDetailed.budget)
                self.save_timeframe(project_id, projectDetailed.timeframe)
                self.save_team_and_members(project_id, projectDetailed.team_members)

                self.mysql.connection.commit()
                return project_id

            except Exception as e:
                self.mysql.connection.rollback()
                raise e

    def get_project_details_rows(self, project_id, user_id):
        sql_query = """
    SELECT
        P.id AS project_id,
        P.name,
        P.goalDescription,
        P.requirementDescription,
        P.status,
        P.userId,
        B.floor AS budget_floor,
        B.ceiling AS budget_ceiling,
        Tf.startTime AS project_start_date,
        Tf.endTime AS project_end_date,
        CONCAT(M.firstName, ' ', M.lastName) AS member,
        S.skill,
        S.category
    FROM
        Project P
    LEFT JOIN Budget B ON P.id = B.projectId
    LEFT JOIN Timeframe Tf ON P.id = Tf.projectId
    LEFT JOIN Team Tm ON P.id = Tm.projectId
    LEFT JOIN TeamMember TmM ON Tm.id = TmM.TeamId
    LEFT JOIN Member M ON TmM.MemberId = M.id
    LEFT JOIN Skillset S ON M.id = S.memberId AND S.category IN ('Language', 'Framework')
    WHERE
        P.id = %s AND P.userId = %s

        """

        with self.mysql.connection.cursor() as cur:
            cur.execute(sql_query, (project_id, user_id))
            detailed_rows = cur.fetchall()

        return detailed_rows
    
    def get_projects_by_user(self, user_id):
        with self.mysql.connection.cursor() as cur:
            cur.execute("SELECT * FROM Project WHERE userId=%s", (user_id,))
            rows = cur.fetchall()
        return [self._row_to_project(row) for row in rows]

    def get_project_by_id(self, project_id):
        with self.mysql.connection.cursor() as cur:
            cur.execute("SELECT * FROM Project WHERE id=%s", (project_id,))
            row = cur.fetchone()
        return self._row_to_project(row)
    
    def _row_to_project(self, row):
        if not row:
            return None
        return Project(
            id=row['id'],
            name=row['name'],
            requirement_description=row['requirementDescription'],
            goal_description=row['goalDescription'],
            status=row['status'],
            user_id=row['userId']
        )
        
    def delete_project(self, project_id, user_id):
        with self.mysql.connection.cursor() as cur:
            cur.execute("DELETE FROM Project WHERE id=%s AND userId=%s", (project_id, user_id))
        self.mysql.connection.commit()
        return cur.rowcount > 0
    
    #####################################################
    ### Generation History & Prompt Operations
    #####################################################
    def get_latest_generation_response(self, project_id):
        with self.mysql.connection.cursor() as cur:
                cur.execute(
                    """
                    SELECT GH.llmResponse
                    FROM GenerationHistory GH
                    WHERE GH.projectId=%s
                    ORDER BY GH.dateTimeCreated DESC
                    LIMIT 1
                    """,
                    (project_id,)
                )
                row = cur.fetchone()
        return row['llmResponse'] if row else None
    
    
    def save_prompt_version(self, project_id, prompt):
        with self.mysql.connection.cursor() as cur:
            cur.execute(
                "SELECT MAX(version) AS max_version FROM Prompt WHERE projectId=%s",
                (project_id,)
            )
            row = cur.fetchone()
            next_version = (row['max_version'] or 0) + 1

            cur.execute(
                "INSERT INTO Prompt (projectId, prompt, version) VALUES (%s, %s, %s)",
                (project_id, prompt, next_version)
            )
            self.mysql.connection.commit()
            return cur.lastrowid

    def save_llm_history(self, project_id, prompt_id, llm_text):
        with self.mysql.connection.cursor() as cur:
            cur.execute(
                "INSERT INTO GenerationHistory (projectId, promptId, llmResponse) VALUES (%s, %s, %s)",
                (project_id, prompt_id, llm_text)
            )
            self.mysql.connection.commit()
    
    
    #####################################################
    ### Team & Member operations
    #####################################################
    def save_team_and_members(self, project_id, members: list[Member]):
        if not members:
            return

        with self.mysql.connection.cursor() as cur:
            team_id = self._get_or_create_team(cur, project_id)
            self._clear_team_members(cur, team_id)

            for member in members:
                member_id = self._get_or_create_member(cur, member)
                self._add_member_to_team(cur, team_id, member_id)
                self._add_member_skills(cur, member_id, member)

        self.mysql.connection.commit()

    # --- helper methods ---
    # generated by ChatGPT
    def _get_or_create_team(self, cur, project_id):
        cur.execute("SELECT id FROM Team WHERE projectId=%s", (project_id,))
        row = cur.fetchone()
        if row:
            return row["id"]

        cur.execute("INSERT INTO Team (projectId, name) VALUES (%s, %s)", (project_id, "Default Team"))
        return cur.lastrowid


    def _clear_team_members(self, cur, team_id):
        cur.execute("DELETE FROM TeamMember WHERE TeamId=%s", (team_id,))


    def _get_or_create_member(self, cur, member: Member):
        cur.execute("SELECT id FROM Member WHERE firstName=%s AND lastName=%s",
                    (member.first_name, member.last_name))
        row = cur.fetchone()
        if row:
            return row["id"]

        cur.execute("INSERT INTO Member (firstName, lastName) VALUES (%s, %s)",
                    (member.first_name, member.last_name))
        return cur.lastrowid


    def _add_member_to_team(self, cur, team_id, member_id):
        cur.execute("INSERT INTO TeamMember (TeamId, MemberId) VALUES (%s, %s)", (team_id, member_id))


    def _add_member_skills(self, cur, member_id, member: Member):
        if member.language:
            cur.execute(
                "INSERT INTO Skillset (memberId, skill, category) VALUES (%s, %s, %s)",
                (member_id, member.language, "Language")
            )
        if member.framework and member.framework.lower() != "none":
            cur.execute(
                "INSERT INTO Skillset (memberId, skill, category) VALUES (%s, %s, %s)",
                (member_id, member.framework, "Framework")
            )


    #####################################################
    ### Timeframe operations
    #####################################################
    def save_timeframe(self, project_id, time: Timeframe):
        if time.start is None and time.end is None:
            return
        # never save incomplete timeframe

        with self.mysql.connection.cursor() as cur:
            cur.execute("SELECT id FROM Timeframe WHERE projectId=%s", (project_id,))
            exists = cur.fetchone()

            time.start = time.start if time.start not in (None, "") else None
            time.end= time.end if time.end not in (None, "") else None

            if exists:
                cur.execute(
                    "UPDATE Timeframe SET startTime=%s, endTime=%s WHERE projectId=%s",
                    (time.start, time.end, project_id)
                )
            else:
                cur.execute(
                    "INSERT INTO Timeframe (projectId, startTime, endTime) VALUES (%s, %s, %s)",
                    (project_id, time.start, time.end)
                )
        self.mysql.connection.commit()
        
    def get_timeframe(self, project_id):
        with self.mysql.connection.cursor() as cur:
            cur.execute("SELECT * FROM Timeframe WHERE projectId=%s", (project_id,))
            row = cur.fetchone()
        return self._row_to_timeframe(row)
    
    def _row_to_timeframe(self, row):
        if not row:
            return None
        return Timeframe(
            project_id=row['projectId'],
            start=row['startTime'],
            end=row['endTime']
        )
        

    #####################################################
    ### Budget operations
    #####################################################
    def save_budget(self, project_id, budget: Budget):
        if budget.floor is None and budget.ceiling is None:
            return
        # never save incomplete budget

        with self.mysql.connection.cursor() as cur:
            cur.execute("SELECT id FROM Budget WHERE projectId=%s", (project_id,))
            exists = cur.fetchone()

            if exists:
                cur.execute(
                    "UPDATE Budget SET floor=%s, ceiling=%s WHERE projectId=%s",
                    (budget.floor, budget.ceiling, project_id)
                )
            else:
                cur.execute(
                    "INSERT INTO Budget (projectId, floor, ceiling) VALUES (%s, %s, %s)",
                    (project_id, budget.floor, budget.ceiling)
                )
        self.mysql.connection.commit()
            
    
    def get_budget(self, project_id):
        with self.mysql.connection.cursor() as cur:
            cur.execute("SELECT * FROM Budget WHERE projectId=%s", (project_id,))
            row = cur.fetchone()
        return self._row_to_budget(row)
    
    def _row_to_budget(self, row):
        if not row:
            return None
        return Budget(
            project_id=row['projectId'],
            floor=row['floor'],
            ceiling=row['ceiling']
        )




