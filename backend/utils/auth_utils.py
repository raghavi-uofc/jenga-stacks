# Databricks notebook source
# auth_utils.py

from flask import g
from itsdangerous import URLSafeTimedSerializer
from flask import request, jsonify

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


def verify_token(token, user_repo):
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
        
    user = user_repo.get_user_by_email(email)
    
    print(f"2. User retrieved from DB: {user}")

    if user and user.get('status') == 'active':
        g.current_user = user
        print(f"3. User authenticated and g.current_user set to {user['email']}")
        return True
    
    print("4. User not found or inactive.")
    return False



def authenticate_token(user_repo):
    auth_header = request.headers.get('Authorization', '')
    if not auth_header.startswith('Bearer '):
        return None, jsonify({'error': 'Unauthorized'}), 401
    token = auth_header[len('Bearer '):]

    try:
        email = serializer.loads(token)
    except Exception as e:
        print(f"Token decode error: {e}")
        return None, jsonify({'error': 'Unauthorized'}), 401

    user = user_repo.get_user_by_email(email)
    if not user:
        return None, jsonify({'error': 'Unauthorized'}), 401

    return user, None, None

