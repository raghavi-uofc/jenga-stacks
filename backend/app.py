# Databricks notebook source
# app.py - Main entry point and app factory

from flask import Flask
from flask_mysqldb import MySQL
from flask_cors import CORS
from flask_bcrypt import Bcrypt
from flask_httpauth import HTTPTokenAuth
from flasgger import Swagger

from dotenv import load_dotenv
import os

load_dotenv()
mysql = MySQL()
bcrypt = Bcrypt()
auth = HTTPTokenAuth(scheme='Bearer')
swagger = Swagger()
import auth_utils
def create_app():
    app = Flask(__name__)
    app.config['MYSQL_HOST'] = os.getenv("DB_HOST") #IPv4 address
    app.config['MYSQL_USER'] =  os.getenv("DB_USER")
    app.config['MYSQL_PASSWORD'] =  os.getenv("DB_PASSWORD")
    app.config['MYSQL_DB'] = os.getenv("DB_NAME")

    app.config['SECRET_KEY'] =  os.getenv("SECRET_KEY")
    
    app.config['MYSQL_CURSORCLASS'] = os.getenv("MYSQL_CURSORCLASS")
    app.config['GEMINI_API_KEY'] = os.getenv("GEMINI_API_KEY")
    mysql.init_app(app)
    bcrypt.init_app(app)
    swagger.init_app(app)
    auth_utils.configure_serializer(app.config['SECRET_KEY'])
    
    CORS(app, resources={
        r"/api/*": {
            "origins": [
                "http://localhost:3000",
                "http://127.0.0.1:3000"
            ]
        }
    })

    auth.verify_token(verify_auth_token)

    from routes.user_routes import user_bp
    from routes.project_routes import project_bp
    from routes.member_routes import member_bp
    from routes.admin_routes import admin_bp
    from routes.health_routes import health_bp
    from routes.gemini_routes import gemini_bp

    app.register_blueprint(user_bp, url_prefix='/api')
    app.register_blueprint(project_bp, url_prefix='/api')
    app.register_blueprint(member_bp, url_prefix='/api')
    app.register_blueprint(admin_bp, url_prefix='/api')
    app.register_blueprint(health_bp, url_prefix='/api')
    app.register_blueprint(gemini_bp)

    return app

#@auth.verify_token
def verify_auth_token(token):
    return auth_utils.verify_token(token)

if __name__ == '__main__':
    app = create_app()
    app.run(host="localhost", port=int("5050"))