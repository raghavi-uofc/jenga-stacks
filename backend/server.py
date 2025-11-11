from flask import Flask, request, jsonify
from supabase import create_client, Client
import bcrypt
import jwt
import datetime
import os
from dotenv import load_dotenv
from flask_cors import CORS

app = Flask(__name__)
CORS(app, origins=["http://localhost:3000"])  # allow frontend origin

# Load environment variables
load_dotenv()

# --- Supabase setup ---
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_KEY")  # Service role key (not anon key)
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

SECRET_KEY = os.getenv("SECRET_KEY", "jengastack-secret-key")

@app.route("/login", methods=["POST"])
def login():
    data = request.get_json()
    email = data.get("email")
    password = data.get("password")

    if not email or not password:
        return jsonify({"success": False, "message": "Missing email or password"}), 400

    # Query Supabase for the user
    response = supabase.table("users").select("*").eq("email", email).execute()

    if not response.data:
        return jsonify({"success": False, "message": "Invalid credentials"}), 401

    user = response.data[0]
    hashed_pw = user["password"].encode("utf-8")

    # Verify password using bcrypt
    if not bcrypt.checkpw(password.encode("utf-8"), hashed_pw):
        return jsonify({"success": False, "message": "Invalid credentials"}), 401

    # Generate JWT token
    payload = {
        "user_id": user["id"],
        "email": user["email"],
        "role": user["role"],
        "exp": datetime.datetime.utcnow() + datetime.timedelta(hours=1)
    }
    token = jwt.encode(payload, SECRET_KEY, algorithm="HS256")

    return jsonify({"success": True, "token": token}), 200



def hash_password(plain_pw: str) -> str:
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(plain_pw.encode("utf-8"), salt)
    return hashed.decode("utf-8")


@app.route("/register", methods=["POST"])
def register():
    try:
        data = request.get_json()
        first_name = data.get("first_name")
        last_name = data.get("last_name")
        email = data.get("email")
        password = data.get("password")

        if not all([first_name, last_name, email, password]):
            return jsonify({"success": False, "message": "All fields are required"}), 400

        # Check if user already exists
        existing_user = supabase.table("users").select("*").eq("email", email).execute()
        if existing_user.data:
            return jsonify({"success": False, "message": "Email already registered"}), 409

        # Hash the password
        hashed_pw = hash_password(password)

        # Insert new user into Supabase
        result = supabase.table("users").insert({
            "first_name": first_name,
            "last_name": last_name,
            "email": email,
            "password": hashed_pw
        }).execute()

        if result.data:
            return jsonify({"success": True, "message": "User registered successfully"}), 201
        else:
            return jsonify({"success": False, "message": "Registration failed"}), 500

    except Exception as e:
        print("Error:", e)
        return jsonify({"success": False, "message": str(e)}), 500


@app.route("/dashboard-data", methods=["GET"])
def dashboard_data():
    token = request.headers.get("Authorization")
    if not token:
        return jsonify({"message": "Missing token"}), 401

    try:
        token = token.split(" ")[1]  # Bearer <token>
        payload = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
        email = payload.get("email")
        if not email:
            return jsonify({"message": "Invalid token"}), 401

        # Query users table for first_name, last_name, role
        response = supabase.table("users").select("first_name, last_name, role").eq("email", email).single().execute()

        if response.data is None:
            return jsonify({"message": "User not found"}), 404

        user = response.data
        full_name = f"{user['first_name']} {user['last_name']}"
        user_role = user['role']

        return jsonify({
            "message": f"Welcome {full_name}!",
            "name": full_name,
            "role": user_role
        })


    except jwt.ExpiredSignatureError:
        return jsonify({"message": "Token expired"}), 401
    except jwt.InvalidTokenError:
        return jsonify({"message": "Invalid token"}), 401


if __name__ == "__main__":
    app.run(debug=True, use_reloader=False)
