from models.user import User

class UserRepository:
    def __init__(self, mysql):
        self.mysql = mysql

    def get_user_by_email(self, email):
        with self.mysql.connection.cursor() as cur:
            cur.execute("SELECT * FROM User WHERE email=%s", (email,))
            row = cur.fetchone()
        return self._row_to_user(row)

    def get_user_by_id(self, user_id):
        with self.mysql.connection.cursor() as cur:
            cur.execute("""
                SELECT id, firstName, lastName, email, role, status, password
                FROM User WHERE id=%s
            """, (user_id,))
            row = cur.fetchone()
        return self._row_to_user(row)

    def insert_user(self, firstName, lastName, email, pw_hash, role):
        with self.mysql.connection.cursor() as cur:
            sql = """
                INSERT INTO User (firstName, lastName, email, password, role)
                VALUES (%s, %s, %s, %s, %s)
            """
            cur.execute(sql, (firstName, lastName, email, pw_hash, role))
        self.mysql.connection.commit()
        
    def delete_user(self, user_id):
        with self.mysql.connection.cursor() as cur:
            cur.execute("DELETE FROM User WHERE id=%s", (user_id,))
            affected = cur.rowcount

        if affected > 0:
            self.mysql.connection.commit()
            return True

        self.mysql.connection.rollback()
        return False


    def get_all_users(self):
        with self.mysql.connection.cursor() as cur:
            cur.execute("""
                SELECT id, firstName, lastName, email, role, status, dateTimeCreated
                FROM User ORDER BY dateTimeCreated DESC
            """)
            rows = cur.fetchall()
        return [self._row_to_user(row) for row in rows]

    def update_password(self, user_id, new_pw_hash):
        with self.mysql.connection.cursor() as cur:
            cur.execute("UPDATE User SET password=%s WHERE id=%s", (new_pw_hash, user_id))
        self.mysql.connection.commit()

    def update_profile(self, user_id, first_name=None, last_name=None):
        updates = []
        params = []

        if first_name:
            updates.append("firstName=%s")
            params.append(first_name)
        if last_name:
            updates.append("lastName=%s")
            params.append(last_name)

        if not updates:
            return  # Nothing to update

        sql = f"UPDATE User SET {', '.join(updates)} WHERE id=%s"
        params.append(user_id)

        with self.mysql.connection.cursor() as cur:
            cur.execute(sql, tuple(params))
        self.mysql.connection.commit()

    def _row_to_user(self, row):
        if not row:
            return None
        return User(
            id=row["id"],
            first_name=row["firstName"],
            last_name=row["lastName"],
            email=row["email"],
            role=row["role"],
            status=row.get("status"),
            password=row.get("password")
        )