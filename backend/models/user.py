class User:
    def __init__(self, id, first_name, last_name, email, role, status=None, password=None):
        self.id = id
        self.first_name = first_name
        self.last_name = last_name
        self.email = email
        self.role = role
        self.status = status
        self.password = password

    def to_dict(self):
        return {
            "id": self.id,
            "firstName": self.first_name,
            "lastName": self.last_name,
            "email": self.email,
            "role": self.role,
            "status": self.status,
        }
