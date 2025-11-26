# conftest.py
import os
import sys
import types
import pytest
from flask import Flask
from unittest.mock import Mock
from routes.admin_routes import admin_bp

# Make project root importable
ROOT_DIR = os.path.dirname(os.path.dirname(__file__))
if ROOT_DIR not in sys.path:
    sys.path.insert(0, ROOT_DIR)

# Ensure auth_utils is importable for tests referring directly to it
import utils.auth_utils as auth_utils


@pytest.fixture
def app_with_repo():
    app = Flask(__name__)
    app.config["SECRET_KEY"] = "testing-secret"
    app.user_repo = Mock()
    app.register_blueprint(admin_bp)

    with app.app_context():
        yield app


@pytest.fixture
def client(app_with_repo):
    return app_with_repo.test_client()


# ---- Dependency stubs so imports don't break ----

class _FakeCursor:
    def __init__(self):
        self.rowcount = 1
        self.lastrowid = 1

    def execute(self, *a, **k): pass
    def fetchone(self): return None
    def fetchall(self): return []
    def close(self): pass
    def __enter__(self): return self
    def __exit__(self, *a): return False


class _FakeConnection:
    def cursor(self, *a, **k): return _FakeCursor()
    def commit(self): pass
    def rollback(self): pass


class _FakeMySQL:
    def __init__(self):
        self.connection = _FakeConnection()
    def init_app(self, app): pass


@pytest.fixture(autouse=True)
def configure_env(monkeypatch):
    # stub MySQLdb
    fake_mysql_module = types.ModuleType("MySQLdb")
    fake_cursors = types.ModuleType("MySQLdb.cursors")
    fake_cursors.DictCursor = object
    fake_mysql_module.cursors = fake_cursors
    fake_mysql_module.OperationalError = Exception

    monkeypatch.setitem(sys.modules, "MySQLdb", fake_mysql_module)
    monkeypatch.setitem(sys.modules, "MySQLdb.cursors", fake_cursors)

    # stub flasgger
    fake_flasgger = types.SimpleNamespace(
        Swagger=lambda *a, **k: types.SimpleNamespace(init_app=lambda app: None),
        swag_from=lambda *a, **k: (lambda fn: fn)
    )
    monkeypatch.setitem(sys.modules, "flasgger", fake_flasgger)

    yield
