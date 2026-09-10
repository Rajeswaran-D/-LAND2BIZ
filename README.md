# LAND2BIZ

AI-Driven Hyper-Local Business Advisory & Financial Structuring Assistant.

FastAPI backend (`apps/api`, port 8000) + Next.js web app (`apps/web`, port 3001).

## Quick start

```powershell
powershell -ExecutionPolicy Bypass -File scripts\start_dev.ps1
```

- API  → http://127.0.0.1:8000 (health check at `/health`, dataset status at `/data/health`)
- Web  → http://localhost:3001

Manual start (if you prefer separate terminals):

```powershell
# Backend
cd apps/api
venv\Scripts\python -m uvicorn app.main:app --port 8000

# Frontend (new terminal)
cd apps/web
npm run dev
```

## Configuration

Copy `apps/api/.env.example` to `apps/api/.env` and fill in:

- `GOOGLE_PLACES_API_KEY` — Google Places API (New) key; the API must be enabled
  and the project linked to a billing account. Used for live site/market/competitor counts.
- `DATABASE_URL` — defaults to a local SQLite file.

Never commit `.env` — it is gitignored. If a key leaks, rotate it in Google Cloud Console.

Data notes:

- Schemes, cost templates, finance rules, TN district/ODOP/HCES baselines and NIC
  mappings are served from curated JSON under `data/` — no external calls needed.
- Site metrics, market snapshots and competitor counts query Google Places (New)
  live; if Google and Overpass are unreachable they fall back to an approximate
  OpenStreetMap Nominatim search (status `ESTIMATED`), and categories that still
  cannot be measured are returned as `DATA_UNAVAILABLE` rather than invented.

## Tests

```powershell
cd apps/api
venv\Scripts\python -m pytest tests -q
```
