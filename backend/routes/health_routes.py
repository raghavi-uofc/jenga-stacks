# Databricks notebook source
from flask import Blueprint, jsonify, current_app
import MySQLdb.cursors
import sys
from flask_mysqldb import MySQL

# We attempt to import 'mysql' from the main application module ('app').
# This relies on the fact that 'app' has already been imported and initialized
# before the blueprint is registered.
try:
    # Safely access the globally initialized 'mysql' object from the main application
    from app import mysql
except ImportError:
    # This should only happen if the import path is fundamentally wrong
    print("FATAL: Could not import 'mysql' object from app. Ensure app.py defines it globally.")
    mysql = None

health_bp = Blueprint('health_bp', __name__)

@health_bp.route('/health/db', methods=['GET'])
def db_status_check():
    """
    Checks the status of the MySQL database connection.
    """
    # Defensive check: if the import failed (which it shouldn't in the correct setup)
    if not isinstance(mysql, MySQL):
        return jsonify({"status": "error", "message": "Database object not initialized."}), 500

    try:
        # Use mysql.connection to access the current session connection.
        cursor = mysql.connection.cursor(MySQLdb.cursors.DictCursor)

        # Execute a simple, lightweight query to confirm read/write ability.
        cursor.execute("SELECT CURRENT_TIMESTAMP() AS `current_time`")
        result = cursor.fetchone()
        cursor.close()

        # FIXED: Using current_app.config.get() to safely access configuration within a request context.
        return jsonify({
            "status": "success",
            "message": "MySQL connection is established and healthy.",
            "host": current_app.config.get('MYSQL_HOST'),
            "database": current_app.config.get('MYSQL_DB'),
            "timestamp": result['current_time'].isoformat() if result else 'N/A'
        }), 200

    except Exception as e:
        # Catch connection errors (OperationalError, ProgrammingError, etc.)
        error_details = str(e)

        # Better error reporting based on common MySQL error types
        if 'Can\'t connect to MySQL server' in error_details or '1045' in error_details:
             custom_message = "Connection details are incorrect (IP/Port/User/Password) or MySQL server is not accessible."
        elif 'Unknown database' in error_details:
             custom_message = f"The database {current_app.config.get('MYSQL_DB')} does not exist on the server."
        else:
             custom_message = "An unexpected error occurred during database connection or query execution."

        # FIXED: Using current_app.config.get() for error response details.
        return jsonify({
            "status": "error",
            "message": custom_message,
            "error_details": error_details,
            "host": current_app.config.get('MYSQL_HOST') or "Unknown"
        }), 503 # 503 Service Unavailable for dependency failure