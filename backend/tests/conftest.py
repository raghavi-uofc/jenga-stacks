import os
import sys
import types
import pytest

# Pytest scaffold: stubs MySQLdb and flasgger, injects fake mysql into the app,
# and supplies a Flask test client so route tests can run without real services.

# Ensure project root is on sys.path for imports like `import app` / `import utils.*`
ROOT_DIR = os.path.dirname(os.path.dirname(__file__))
if ROOT_DIR not in sys.path:
    sys.path.insert(0, ROOT_DIR)

# Minimal stub for mysql used in routes; avoids real DB dependency and native driver.
class _FakeCursor:
    def __init__(self):
        self.rowcount = 1
        self.lastrowid = 1

    def execute(self, *args, **kwargs):
        return None

    def fetchone(self):
        return None

    def fetchall(self):
        return []

    def close(self):
        return None

    # Support context manager usage (e.g., with cursor() as cur)
    def __enter__(self):
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        return False


class _FakeConnection:
    def cursor(self, *args, **kwargs):
        return _FakeCursor()

    def commit(self):
        return None

    def rollback(self):
        return None


class _FakeMySQL:
    def __init__(self):
        self.connection = _FakeConnection()

    def init_app(self, app):
        return None  # Flask calls this during create_app


@pytest.fixture(autouse=True)
def configure_env(monkeypatch):
    # Ensure SECRET_KEY exists for serializer/token work.
    monkeypatch.setenv("SECRET_KEY", "testing-secret")

    # Stub MySQLdb to avoid native dependency during imports; provide DictCursor and OperationalError.
    fake_mysql_module = types.ModuleType("MySQLdb")
    fake_cursors = types.ModuleType("MySQLdb.cursors")
    fake_cursors.DictCursor = object
    fake_mysql_module.cursors = fake_cursors
    fake_mysql_module.OperationalError = Exception
    monkeypatch.setitem(sys.modules, "MySQLdb", fake_mysql_module)
    monkeypatch.setitem(sys.modules, "MySQLdb.cursors", fake_cursors)

    # Stub flasgger to avoid import errors in tests; Swagger.init_app and swag_from become no-ops.
    def _swagger_ctor(*args, **kwargs):
        return types.SimpleNamespace(init_app=lambda app: None)

    def _swag_from(obj=None, *args, **kwargs):
        def decorator(fn):
            return fn
        return decorator

    fake_flasgger = types.SimpleNamespace(Swagger=_swagger_ctor, swag_from=_swag_from)
    monkeypatch.setitem(sys.modules, "flasgger", fake_flasgger)
    # Ensure direct imports work (from flasgger import Swagger, swag_from)
    monkeypatch.setitem(sys.modules, "flasgger.Swagger", _swagger_ctor)
    monkeypatch.setitem(sys.modules, "flasgger.swag_from", _swag_from)
    yield


@pytest.fixture
def app(monkeypatch):
    import app as app_module

    # Replace mysql with stub before app creation so routes use the fake connection.
    fake_mysql = _FakeMySQL()
    monkeypatch.setattr(app_module, "mysql", fake_mysql)

    flask_app = app_module.create_app()
    flask_app.config.update({"TESTING": True})
    yield flask_app


@pytest.fixture
def client(app):
    return app.test_client()
