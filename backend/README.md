# Backend (FastAPI) — local development

## Setup
```powershell
cd backend
..\.venv\Scripts\python.exe -m pip install -r requirements.txt
```

## Run
```powershell
cd backend
..\.venv\Scripts\python.exe -m uvicorn app.main:app --host 127.0.0.1 --port 8000
```

## Tests
```powershell
cd backend
..\.venv\Scripts\python.exe -m pytest -q
```

## Database migrations
```powershell
cd backend
..\.venv\Scripts\alembic.exe upgrade head
```

## CSV import format
Required headers (case-insensitive): one of `timestamp`/`time`/`date`/`datetime`/`ts`,
plus `open`, `high`, `low`, `close`, `volume` (aliases `o,h,l,c,v` accepted).

Timestamps may be epoch seconds, epoch milliseconds, or ISO-8601 (date or datetime;
naive values assumed UTC).

Example:
```
timestamp,open,high,low,close,volume
2024-01-01,100,105,99,103,1000
```

Import via API:
```powershell
curl -X POST http://127.0.0.1:8000/api/v1/imports `
  -F "exchange=NSE" -F "symbol=TEST" -F "dry_run=true" -F "file=@data.csv"
```

Data status: `GET /api/v1/data-status?exchange=NSE&symbol=TEST`.
Candles: `GET /api/v1/candles?exchange=NSE&symbol=TEST&from=...&to=...&limit=5000`.

All market data imported through this backend is labeled `IMPORTED` / `is_live=false`.
No live exchange feed is connected in this phase.
