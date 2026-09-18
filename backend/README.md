# Lollipop Backend

FastAPI API foundation for identity, creators, media, moderation, monetization, reporting and audit.

## Run locally

From the repository root:

```bash
python -m venv .venv
# Windows: .venv\\Scripts\\Activate.ps1
pip install -r backend/requirements.txt
python -m uvicorn backend.app.main:app --reload --port 8000
```

Health endpoint: `GET /api/v1/health`.

The SQL model in `backend/app/models.sql` is a foundation only. Production deployment should add migrations, connection pooling, secrets management, transactional service boundaries and provider integrations.

No raw identity documents or real intimate media belong in this repository.
