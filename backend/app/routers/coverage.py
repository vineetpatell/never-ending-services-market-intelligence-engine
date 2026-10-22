"""Coverage endpoint."""
from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.database import get_session
from app import schemas
from app.services.coverage_service import compute_coverage

router = APIRouter(tags=["coverage"])

VALID_EXCHANGES = {"NSE", "BSE"}


@router.get("/api/v1/coverage", response_model=schemas.CoverageReport)
def get_coverage(
    exchange: str = Query(...),
    symbol: str = Query(...),
    db: Session = Depends(get_session),
):
    if exchange not in VALID_EXCHANGES:
        raise HTTPException(status_code=400, detail="invalid exchange")
    if not symbol or len(symbol) > 64:
        raise HTTPException(status_code=400, detail="invalid symbol")
    return compute_coverage(db, exchange, symbol)
