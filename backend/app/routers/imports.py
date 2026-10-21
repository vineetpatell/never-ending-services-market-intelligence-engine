"""CSV import endpoint."""
from __future__ import annotations

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile
from sqlalchemy.orm import Session

from app.config import settings
from app.database import get_session
from app.services.import_service import import_csv

router = APIRouter(tags=["imports"])


@router.post("/api/v1/imports", response_model=dict)
async def upload_import(
    exchange: str = Form(...),
    symbol: str = Form(...),
    dry_run: bool = Form(False),
    file: UploadFile = File(...),
    db: Session = Depends(get_session),
):
    if exchange not in {"NSE", "BSE"}:
        raise HTTPException(status_code=400, detail="invalid exchange")
    if not symbol or len(symbol) > 64:
        raise HTTPException(status_code=400, detail="invalid symbol")
    content = await file.read()
    if len(content) == 0:
        raise HTTPException(status_code=400, detail="empty file")
    if len(content) > settings.max_import_bytes:
        raise HTTPException(status_code=413, detail="file too large")
    summary = import_csv(
        db,
        file_name=file.filename or "upload.csv",
        content=content,
        exchange=exchange,
        symbol=symbol,
        dry_run=dry_run,
    )
    return summary.model_dump()
