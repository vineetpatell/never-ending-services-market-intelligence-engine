"""FastAPI application entrypoint (local-only by default)."""
from __future__ import annotations

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.config import settings
from app.database import init_db
from app.routers import candles, data_status, health, imports, instruments

app = FastAPI(title="NES Market Intelligence Backend", version="0.1.0")

# CORS restricted to the local frontend origin(s).
origins = [settings.frontend_url, "http://127.0.0.1:5173", "http://localhost:5173"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=list(dict.fromkeys(origins)),
    allow_credentials=False,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["*"],
)


@app.on_event("startup")
def on_startup() -> None:
    init_db()


@app.exception_handler(Exception)
async def unhandled_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    # Do not leak internals.
    return JSONResponse(status_code=500, content={"detail": "internal server error", "code": "INTERNAL_ERROR"})


app.include_router(health.router)
app.include_router(instruments.router)
app.include_router(candles.router)
app.include_router(data_status.router)
app.include_router(imports.router)
