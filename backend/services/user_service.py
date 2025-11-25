from globals import bcrypt
from models.user import User
from utils.auth_utils import generate_token

class UserService:
    def __init__(self, user_repo):
        self.user_repo = user_repo

    def register_user(self, first_name, last_name, email, password, role):
        if self.user_repo.get_user_by_email(email):
            return None, "Email already registered"

        pw_hash = bcrypt.generate_password_hash(password).decode('utf-8')
        self.user_repo.insert_user(first_name, last_name, email, pw_hash, role)
        user = self.user_repo.get_user_by_email(email)
        return user, None

    def login_user(self, email, password):
        user = self.user_repo.get_user_by_email(email)
        if not user or user.status != "active":
            return None, "Invalid credentials"

        if not bcrypt.check_password_hash(user.password, password):
            return None, "Invalid credentials"

        token = generate_token(user.to_dict())
        print(user.to_dict(), '\n', token, '\n')
        return user, token, None

    def reset_password(self, email, old_password, new_password):
        user = self.user_repo.get_user_by_email(email)
        if not user:
            return "User not found"

        if not bcrypt.check_password_hash(user.password, old_password):
            return "Old password incorrect"

        new_hash = bcrypt.generate_password_hash(new_password).decode('utf-8')
        self.user_repo.update_password(user.id, new_hash)
        return None

    def update_profile(self, email, password, first_name=None, last_name=None):
        user = self.user_repo.get_user_by_email(email)
        if not user:
            return "User not found"

        if not bcrypt.check_password_hash(user.password, password):
            return "Incorrect password"

        self.user_repo.update_profile(user.id, first_name, last_name)
        return None
