"""Candles read endpoint."""
from __future__ import annotations

from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.config import settings
from app.database import get_session
from app import models, schemas

router = APIRouter(tags=["candles"])

VALID_EXCHANGES = {"NSE", "BSE"}


def _resolve_instrument(db: Session, exchange: str, symbol: str) -> models.Instrument | None:
    return db.execute(
        select(models.Instrument).where(models.Instrument.exchange == exchange, models.Instrument.symbol == symbol)
    ).scalar_one_or_none()


@router.get("/api/v1/candles", response_model=schemas.CandlesResponse)
def get_candles(
    exchange: Annotated[str, Query()],
    symbol: Annotated[str, Query()],
    from_ms: Annotated[int | None, Query(alias="from")] = None,
    to_ms: Annotated[int | None, Query(alias="to")] = None,
    limit: Annotated[int, Query(ge=1, le=20000)] = settings.default_candles_limit,
    db: Session = Depends(get_session),
) -> schemas.CandlesResponse:
    if exchange not in VALID_EXCHANGES:
        raise HTTPException(status_code=400, detail="invalid exchange")
    if not symbol or len(symbol) > 64:
        raise HTTPException(status_code=400, detail="invalid symbol")
    if from_ms is not None and from_ms <= 0:
        raise HTTPException(status_code=400, detail="invalid from timestamp")
    if to_ms is not None and to_ms <= 0:
        raise HTTPException(status_code=400, detail="invalid to timestamp")
    if from_ms is not None and to_ms is not None and from_ms > to_ms:
        raise HTTPException(status_code=400, detail="from must be <= to")
    limit = min(limit, settings.max_candles_limit)

    instrument = _resolve_instrument(db, exchange, symbol)
    if instrument is None:
        # Auto-create instrument row for demo symbols? No; return empty.
        # We still allow querying candles for any symbol that has imported data;
        # if none, 404-ish empty. Use 200 with empty list for UX.
        return schemas.CandlesResponse(
            exchange=exchange,  # type: ignore[arg-type]
            symbol=symbol,
            source="IMPORTED_CSV",
            status="IMPORTED",
            is_live=False,
            count=0,
            candles=[],
        )

    q = select(models.Candle).where(models.Candle.instrument_id == instrument.id)
    if from_ms is not None:
        q = q.where(models.Candle.ts >= from_ms)
    if to_ms is not None:
        q = q.where(models.Candle.ts <= to_ms)
    q = q.order_by(models.Candle.ts).limit(limit)
    rows = db.execute(q).scalars().all()

    status = rows[0].status if rows else "IMPORTED"
    source = rows[0].source if rows else "IMPORTED_CSV"
    is_live = status == "LIVE"
    candles = [
        schemas.CandleOut(
            exchange=exchange,  # type: ignore[arg-type]
            symbol=symbol,
            time=r.ts,
            open=r.open,
            high=r.high,
            low=r.low,
            close=r.close,
            volume=r.volume,
            status=r.status,  # type: ignore[arg-type]
            source=r.source,
            ingested_at=r.ingested_at,
        )
        for r in rows
    ]
    return schemas.CandlesResponse(
        exchange=exchange,  # type: ignore[arg-type]
        symbol=symbol,
        source=source,
        status=status,  # type: ignore[arg-type]
        is_live=is_live,
        count=len(candles),
        candles=candles,
    )
