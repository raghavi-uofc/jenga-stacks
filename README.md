# Jenga Stacks

- Fall 2025, ENSF 607/608 Final Project 
  
- A web application designed for developers and project managers to generate structured project plans, powered by Gemini AI.

## Frontend 

### 1. Navigate to the frontend directory:
``` bash
cd jenga-frontend
```

### 2. Install dependencies:
``` bash
npm install 
```

### 3. Run the development server:
```bash
npm run start
```

---

## Backend

### 1. Navigate to the backend directory
``` bash
cd backend
```

### 2. Create a virtual environment: 
```
py -3 -m venv .venv
```
### 2. Activate virtual environment:
```
.\.venv\Scripts\activate
```
### 3. Install requirements:

```bash
sudo apt update && sudo apt install pkg-config
pip install -r requirements.txt
```
### 4. load_dotenv comes from python-dotenv
```bash
pip install python-dotenv
```
### 5. Start the backend server

With AWS database connection (development mode):
```bash
python3 app.py --env=dev
```
With local database connection:
```bash
python3 app.py
```

---

## DATABASE 
MySQL: Set Up The Database Using Either The Combined Scripts Or The Modular DDL Scripts<br/><br/>
**i) Start MySQL Workbench**<br/>
Ensure MySQL server is running as well as that know: Host (e.g., `localhost`), Port (default: `3306`), A user with `CREATE DATABASE` and `ALL` privileges on the new DB.<br/>
**ii) Create Database**<br/>
_Option A-Using the Helper Script:_
>In MySQL Workbench/CLI
```
SOURCE sql/DDL/CREATE/CREATE_DATABASE_jengadb.sql;
```
_Option B-Manual:_
```
CREATE DATABASE jengadb;
```
**iii) Create Schema (Tables)**<br/>
_Quick Option (Single Script):_
```
USE jengadb;
SOURCE sql/tables.sql;
```
