"""Pydantic request/response schemas for the market-data API."""
from __future__ import annotations

from datetime import datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field

DataStatus = Literal["DEMO", "IMPORTED", "DELAYED", "LIVE"]
Exchange = Literal["NSE", "BSE"]


class HealthResponse(BaseModel):
    status: str
    version: str
    database: str


class InstrumentOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    exchange: Exchange
    symbol: str
    name: str
    currency: str


class CandleOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    exchange: Exchange
    symbol: str
    time: int  # epoch ms, UTC
    open: float
    high: float
    low: float
    close: float
    volume: float
    status: DataStatus
    source: str
    ingested_at: datetime | None = None


class CandlesResponse(BaseModel):
    exchange: Exchange
    symbol: str
    source: str
    status: DataStatus
    is_live: bool
    count: int
    candles: list[CandleOut]


class DataStatusResponse(BaseModel):
    exchange: Exchange
    symbol: str
    source: str
    status: DataStatus
    is_live: bool
    count: int
    first_ts: int | None
    last_ts: int | None
    last_imported_at: datetime | None


class ValidationErrorOut(BaseModel):
    row: int | None = None
    field: str | None = None
    message: str


class ImportSummary(BaseModel):
    file_name: str
    exchange: Exchange
    symbol: str
    dry_run: bool
    total_rows: int
    accepted: int
    rejected: int
    duplicated: int
    skipped: int
    errors: list[ValidationErrorOut]
    import_run_id: int | None = None
