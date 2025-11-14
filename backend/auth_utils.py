# Databricks notebook source
# auth_utils.py

from flask import g
from itsdangerous import URLSafeTimedSerializer

serializer = None
tokens = {}

def configure_serializer(secret_key):
    global serializer
    serializer = URLSafeTimedSerializer(secret_key)

def generate_token(user):
    if serializer is None:
        raise RuntimeError("Serializer not configured. Call configure_serializer(secret_key) first.")
    token = serializer.dumps(user['email'])
    tokens[token] = user['id']
    return token

def get_user_by_email(email):
    from app import mysql
    cur = mysql.connection.cursor()
    cur.execute("SELECT * FROM Users WHERE email=%s", (email,))
    user = cur.fetchone()
    cur.close()
    return user

def get_user_by_id(user_id):
    from app import mysql
    cur = mysql.connection.cursor()
    cur.execute("SELECT id, first_name, last_name, email, role, status, password FROM Users WHERE id=%s", (user_id,))
    user = cur.fetchone()
    cur.close()
    return user


def verify_token(token):
    if not token:
        return False
    try:
        email = serializer.loads(token)
    except:
        return False
    user = get_user_by_email(email)
    if user and user['status'] == 'active':
        g.current_user = user
        return True
    return False