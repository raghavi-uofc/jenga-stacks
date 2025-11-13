# Databricks notebook source
from flask import Blueprint, jsonify, current_app
import MySQLdb.cursors
import sys
from flask_mysqldb import MySQL

try:
    from app import mysql
except ImportError:
    print("FATAL: Could not import 'mysql' object from app. Ensure app.py defines it globally.")
    mysql = None

health_bp = Blueprint('health_bp', __name__)

@health_bp.route('/health/db', methods=['GET'])
def db_status_check():
    """
    Checks the status of the MySQL database connection.
    """
    if not isinstance(mysql, MySQL):
        return jsonify({"status": "error", "message": "Database object not initialized."}), 500

    try:
        cursor = mysql.connection.cursor(MySQLdb.cursors.DictCursor)

        cursor.execute("SELECT CURRENT_TIMESTAMP() AS `current_time`")
        result = cursor.fetchone()
        cursor.close()

        return jsonify({
            "status": "success",
            "message": "MySQL connection is established and healthy.",
            "host": current_app.config.get('MYSQL_HOST'),
            "database": current_app.config.get('MYSQL_DB'),
            "timestamp": result['current_time'].isoformat() if result else 'N/A'
        }), 200

    except Exception as e:
        error_details = str(e)

        if 'Can\'t connect to MySQL server' in error_details or '1045' in error_details:
             custom_message = "Connection details are incorrect (IP/Port/User/Password) or MySQL server is not accessible."
        elif 'Unknown database' in error_details:
             custom_message = f"The database {current_app.config.get('MYSQL_DB')} does not exist on the server."
        else:
             custom_message = "An unexpected error occurred during database connection or query execution."

        return jsonify({
            "status": "error",
            "message": custom_message,
            "error_details": error_details,
            "host": current_app.config.get('MYSQL_HOST') or "Unknown"
        }), 503