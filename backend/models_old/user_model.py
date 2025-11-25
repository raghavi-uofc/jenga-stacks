import logging


def get_user_by_email(email):
    from app import mysql
    cur = mysql.connection.cursor()
    cur.execute("SELECT * FROM User WHERE email=%s", (email,))

    user = cur.fetchone()
    return user

def get_user_by_id(user_id):
    from app import mysql
    cur = mysql.connection.cursor()
    cur.execute("SELECT id, firstName, lastName, email, role, status, password FROM User WHERE id=%s", (user_id,))
    user = cur.fetchone()
    return user

def insert_user(cursor, firstName, lastName, email, pw_hash, role):
    sql = """
        INSERT INTO User (firstName, lastName, email, password, role)
        VALUES (%s, %s, %s, %s, %s)
    """
    cursor.execute(sql, (firstName, lastName, email, pw_hash, role))

def get_users(cursor):
    sql = """
        SELECT id, firstName, lastName, email, role, status, dateTimeCreated
        FROM User
        ORDER BY dateTimeCreated DESC
    """
    cursor.execute(sql)
    rows = cursor.fetchall()

    # Convert result to list of dicts
    users = []
    for row in rows:
        user = {
            "id": row['id'],
            "firstName": row['firstName'],
            "lastName": row['lastName'],
            "email": row['email'],
            "role": row['role'],
        }
        users.append(user)

    return users
#
# ({'id': 205,
#   'firstName': 'November',
#   'lastName': 'Rain',
#   'email': 'novemberrain@calgary.com',
#   'role': 'admin',
#   'status': 'active',
#   'dateTimeCreated': datetime.datetime(2025, 11, 20, 0, 52, 10)
#   }