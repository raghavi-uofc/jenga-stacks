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
    cur.execute("SELECT * FROM User WHERE email=%s", (email,))
    
    user = cur.fetchone()
    cur.close()
    return user

def get_user_by_id(user_id):
    from app import mysql
    cur = mysql.connection.cursor()
    cur.execute("SELECT id, first_name, last_name, email, role, status, password FROM User WHERE id=%s", (user_id,))
    user = cur.fetchone()
    cur.close()
    return user


def verify_token(token):
    # (Move print to the very top to test raw input)
    print(f"1. Raw token received in auth_utils: '{token}'") 
    
    if not token:
        print("1.1 Token is missing.")
        return False
    try:
        # Check if the token can be loaded
        email = serializer.loads(token)
    except Exception as e:
        # --- NEW: Print the actual exception ---
        print(f"1.2 Token loading failed/expired: {e}") 
        return False
        
    user = get_user_by_email(email)
    
    print(f"2. User retrieved from DB: {user}")

    if user and user.get('status') == 'active':
        g.current_user = user
        print(f"3. User authenticated and g.current_user set to {user['email']}")
        return True
    
    print("4. User not found or inactive.")
    return False