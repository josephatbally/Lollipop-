# Lollipop API

FastAPI backend for the Lollipop creator-media platform.

## Run locally

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r backend/requirements.txt
python -m uvicorn backend.app.main:app --reload --port 8000
```

The default development database is SQLite at `./lollipop.db`. Set `DATABASE_URL` to PostgreSQL for a production-like environment.

Set a strong `JWT_SECRET` before any non-local deployment. Authentication uses Argon2 password hashing and bearer access tokens.

Health: `GET /api/v1/health`

Auth: `POST /api/v1/auth/register`, `POST /api/v1/auth/login`, `GET /api/v1/auth/me`

Do not store raw identity documents or real intimate media in this repository. Verification, storage, moderation, payments, and production secrets require dedicated services and migration/operational controls before launch.
