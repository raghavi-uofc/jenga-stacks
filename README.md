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

### 2. Create virtual environment: 

```bash
python3 -m venv .venv
```

### 2. Activate virtual environment:

```bash
. .venv/bin/activate
```

### 3. Install requirements:

```bash
sudo apt update && sudo apt install pkg-config
pip install -r requirements.txt
```

### 4. Start the backend server

With AWS database connection (development mode):
```bash
python3 app.py --env=dev
```
With local database connection:
```bash
python3 app.py
```

---

## Database
...