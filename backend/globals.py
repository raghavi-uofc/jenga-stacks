# globals.py
from flask_mysqldb import MySQL
from flask_bcrypt import Bcrypt
from flask_httpauth import HTTPTokenAuth
from flasgger import Swagger

# Flask extensions / global objects
mysql = MySQL()
bcrypt = Bcrypt()
auth = HTTPTokenAuth(scheme='Bearer')
swagger = Swagger()
