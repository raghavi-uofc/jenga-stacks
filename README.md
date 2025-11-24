# Jenga Stacks

- Fall 2025, ENSF 607/608 Final Project 
  
- A web application designed for developers and project managers to generate structured project plans, powered by Gemini AI.
## Folder Structure
```
├── backend/                => Flask Backend [API, Models, Utils, Tests]
├── jenga-frontend/         => React Frontend {SPA}
├── sql/                    => MySQL Schema, Data & Stored Procedures
│   ├── DDL/                => CREATE / DROP Scripts
│   ├── DML/                => INSERT / TRUNCATE Scripts
│   ├── DQL/                => SELECT Queries For Debugging
│   ├── init.sql            => Example DB + User Initialization
│   ├── tables.sql          => Combined Schema For All Tables
│   └── insert.sql          => Combined Sample Data Insert
├── designDocuments/        => ER & UML Diagrams (Reference)
└── README.md               => Project Documentation
```
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
|| This Creates the Core Tables: User, Project, Team, Member, TeamMember, Skillset, Budget, Timeframe, Prompt, GenerationHistory ||<br/>
_Modular option (1 File Per Table):_
```
USE jengadb;
SOURCE sql/DDL/CREATE/001_CREATE_TABLE_User.sql;
SOURCE sql/DDL/CREATE/002_CREATE_TABLE_Project.sql;
SOURCE sql/DDL/CREATE/003_CREATE_TABLE_Team.sql;
SOURCE sql/DDL/CREATE/004_CREATE_TABLE_Member.sql;
SOURCE sql/DDL/CREATE/005_CREATE_TABLE_Skillset.sql;
SOURCE sql/DDL/CREATE/006_CREATE_TABLE_TeamMember.sql;
SOURCE sql/DDL/CREATE/007_CREATE_TABLE_Budget.sql;
SOURCE sql/DDL/CREATE/008_CREATE_TABLE_Timeframe.sql;
SOURCE sql/DDL/CREATE/009_CREATE_TABLE_Prompts.sql;
SOURCE sql/DDL/CREATE/010_CREATE_TABLE_GenerationHistory.sql;
SOURCE sql/DDL/CREATE/011_CREATE_TABLE_GenerationFeedback.sql;
```
**iv) Create Stored Procedures**<br/>
<Stored Procedures for Prompts & Generation History>
```
USE jengadb;
SOURCE sql/DDL/CREATE/100_CREATE_PROCS_Prompt_GenerationHistory.sql;
```
This Defines Procedures Such as: sp_add_prompt **|** sp_add_generation_history **|** sp_get_generation_history_by_project<br/>
**v) Seed Sample Data {Optional}** <br/>
| To Pre-populate the DB with Sample Users, Projects & Related Entities |<br/>
_Single File_
```
USE jengadb;
SOURCE sql/insert.sql;
```
_Or Granular_
```
USE jengadb;
SOURCE sql/DML/INSERT/001_INSERT_User.sql;
SOURCE sql/DML/INSERT/002_INSERT_Project.sql;
SOURCE sql/DML/INSERT/003_INSERT_Member.sql;
SOURCE sql/DML/INSERT/004_INSERT_Team.sql;
SOURCE sql/DML/INSERT/005_INSERT_Budget.sql;
SOURCE sql/DML/INSERT/006_INSERT_TeamMember.sql;
SOURCE sql/DML/INSERT/007_INSERT_Timeframe.sql;
SOURCE sql/DML/INSERT/008_INSERT_Skillset.sql;
```
**vi) {Optional} Create a Dedicated DB User**<br/>
If want a Specific DB user for the app:<br/>
>Example only-use own Username/Password
```
CREATE USER 'jenga_user'@'%' IDENTIFIED BY 'your_strong_password_here';
GRANT ALL PRIVILEGES ON jengadb.* TO 'jenga_user'@'%';
FLUSH PRIVILEGES;
```
Reference this user in the Backend Environment Variables
