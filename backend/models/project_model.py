# models/project_model.py

import MySQLdb.cursors
from flask_mysqldb import MySQL

# Assume `mysql` is initialized in your Flask app and imported here
# from app import mysql

def get_project_details_rows(mysql, project_id, user_id):
    """
    Fetch detailed project information, including budget, timeframe, and team members.

    Args:
        mysql: Flask-MySQLdb MySQL object
        project_id (int): The project ID to fetch
        user_id (int): The user ID to validate ownership

    Returns:
        list of dict: Each dict represents a row of project details
    """
    sql_query = """
SELECT
    P.id AS project_id,
    P.name,
    P.goalDescription,
    P.requirementDescription,
    P.status,
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

    cur = mysql.connection.cursor(MySQLdb.cursors.DictCursor)
    cur.execute(sql_query, (project_id, user_id))
    detailed_rows = cur.fetchall()
    cur.close()

    return detailed_rows
