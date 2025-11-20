# jenga-stacks backend

## Setup:

1. Create virtual environment:

```bash
$ python3 -m venv .venv
```

2. Activate virtual environment:

```bash
$ . .venv/bin/activate
```

3. Install requirements:

```bash
$ sudo apt update && sudo apt install pkg-config
$ pip install -r requirements.txt
```

4. Start server with AWS databsse connection :

```bash
python3 app.py --env=dev
```

Start server with local databsse connection :
```bash
python3 app.py
```