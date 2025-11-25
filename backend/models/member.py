class Member:
    def __init__(self, first_name, last_name, language=None, framework=None):
        self.first_name = first_name
        self.last_name = last_name
        self.language = language
        self.framework = framework

    @classmethod
    def from_full_name(cls, full_name, language=None, framework=None):
        parts = full_name.strip().split(" ", 1)
        first = parts[0]
        last = parts[1] if len(parts) > 1 else ""
        return cls(first, last, language, framework)

    @property
    def member(self):
        return f"{self.first_name} {self.last_name}".strip()

    def to_dict(self):
        return {
            "member": self.member,
            "language": self.language,
            "framework": self.framework
        }
