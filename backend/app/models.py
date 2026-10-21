"""SQLAlchemy ORM models for instruments, candles and import runs."""
from __future__ import annotations

from datetime import datetime

from sqlalchemy import (
    DateTime,
    Float,
    ForeignKey,
    Index,
    Integer,
    String,
    Text,
    UniqueConstraint,
    func,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class Instrument(Base):
    __tablename__ = "instruments"
    __table_args__ = (UniqueConstraint("exchange", "symbol", name="uq_instrument_exchange_symbol"),)

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    exchange: Mapped[str] = mapped_column(String(8), nullable=False, index=True)
    symbol: Mapped[str] = mapped_column(String(64), nullable=False, index=True)
    name: Mapped[str] = mapped_column(String(128), nullable=False, default="")
    currency: Mapped[str] = mapped_column(String(8), nullable=False, default="INR")
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now(), nullable=False)

    candles: Mapped[list["Candle"]] = relationship(back_populates="instrument", cascade="all, delete-orphan")


class Candle(Base):
    __tablename__ = "candles"
    __table_args__ = (
        UniqueConstraint("instrument_id", "ts", name="uq_candle_instrument_ts"),
        Index("ix_candle_lookup", "instrument_id", "ts"),
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    instrument_id: Mapped[int] = mapped_column(ForeignKey("instruments.id", ondelete="CASCADE"), nullable=False, index=True)
    ts: Mapped[int] = mapped_column(Integer, nullable=False)  # epoch ms, UTC
    open: Mapped[float] = mapped_column(Float, nullable=False)
    high: Mapped[float] = mapped_column(Float, nullable=False)
    low: Mapped[float] = mapped_column(Float, nullable=False)
    close: Mapped[float] = mapped_column(Float, nullable=False)
    volume: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)
    status: Mapped[str] = mapped_column(String(16), nullable=False, default="IMPORTED")
    source: Mapped[str] = mapped_column(String(32), nullable=False, default="IMPORTED_CSV")
    adjustment_note: Mapped[str | None] = mapped_column(String(256), nullable=True)
    ingested_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now(), nullable=False)

    instrument: Mapped[Instrument] = relationship(back_populates="candles")


class ImportRun(Base):
    __tablename__ = "import_runs"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    exchange: Mapped[str] = mapped_column(String(8), nullable=False)
    symbol: Mapped[str] = mapped_column(String(64), nullable=False)
    file_name: Mapped[str] = mapped_column(String(256), nullable=False, default="")
    source_name: Mapped[str] = mapped_column(String(64), nullable=False, default="CSV")
    status: Mapped[str] = mapped_column(String(16), nullable=False, default="COMPLETED")
    started_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now(), nullable=False)
    finished_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    total_rows: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    accepted: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    rejected: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    duplicated: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    skipped: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    errors_json: Mapped[str | None] = mapped_column(Text, nullable=True)
