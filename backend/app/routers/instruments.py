"""Instruments endpoints."""
from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.database import get_session
from app import models, schemas

router = APIRouter(tags=["instruments"])


@router.get("/api/v1/instruments", response_model=list[schemas.InstrumentOut])
def list_instruments(db: Session = Depends(get_session)) -> list[schemas.InstrumentOut]:
    rows = db.execute(select(models.Instrument).order_by(models.Instrument.exchange, models.Instrument.symbol)).scalars().all()
    return [schemas.InstrumentOut.model_validate(r) for r in rows]
