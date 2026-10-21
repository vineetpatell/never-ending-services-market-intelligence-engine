"""Data status endpoint."""
from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.database import get_session
from app import models, schemas

router = APIRouter(tags=["data-status"])

VALID_EXCHANGES = {"NSE", "BSE"}


@router.get("/api/v1/data-status", response_model=schemas.DataStatusResponse)
def data_status(
    exchange: str = Query(...),
    symbol: str = Query(...),
    db: Session = Depends(get_session),
) -> schemas.DataStatusResponse:
    if exchange not in VALID_EXCHANGES:
        raise HTTPException(status_code=400, detail="invalid exchange")
    if not symbol or len(symbol) > 64:
        raise HTTPException(status_code=400, detail="invalid symbol")

    instrument = db.execute(
        select(models.Instrument).where(models.Instrument.exchange == exchange, models.Instrument.symbol == symbol)
    ).scalar_one_or_none()

    if instrument is None:
        return schemas.DataStatusResponse(
            exchange=exchange,  # type: ignore[arg-type]
            symbol=symbol,
            source="IMPORTED_CSV",
            status="IMPORTED",
            is_live=False,
            count=0,
            first_ts=None,
            last_ts=None,
            last_imported_at=None,
        )

    count = db.execute(select(func.count()).select_from(models.Candle).where(models.Candle.instrument_id == instrument.id)).scalar_one()
    first_ts = db.execute(select(func.min(models.Candle.ts)).where(models.Candle.instrument_id == instrument.id)).scalar_one()
    last_ts = db.execute(select(func.max(models.Candle.ts)).where(models.Candle.instrument_id == instrument.id)).scalar_one()
    last_imp = db.execute(select(func.max(models.Candle.ingested_at)).where(models.Candle.instrument_id == instrument.id)).scalar_one()

    # Determine status/source from latest candle if any
    latest = db.execute(
        select(models.Candle).where(models.Candle.instrument_id == instrument.id).order_by(models.Candle.ts.desc()).limit(1)
    ).scalar_one_or_none()
    status = latest.status if latest else "IMPORTED"
    source = latest.source if latest else "IMPORTED_CSV"

    return schemas.DataStatusResponse(
        exchange=exchange,  # type: ignore[arg-type]
        symbol=symbol,
        source=source,
        status=status,  # type: ignore[arg-type]
        is_live=(status == "LIVE"),
        count=count,
        first_ts=first_ts,
        last_ts=last_ts,
        last_imported_at=last_imp,
    )
