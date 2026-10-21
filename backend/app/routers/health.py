"""Health endpoint."""
from __future__ import annotations

from fastapi import APIRouter

from app import __version__
from app.database import engine
from app.schemas import HealthResponse

router = APIRouter(tags=["health"])


@router.get("/api/v1/health", response_model=HealthResponse)
def health() -> HealthResponse:
    db_ok = True
    try:
        with engine.connect() as conn:
            conn.exec_driver_sql("SELECT 1")
    except Exception:
        db_ok = False
    return HealthResponse(
        status="ok" if db_ok else "degraded",
        version=__version__,
        database="ok" if db_ok else "error",
    )
