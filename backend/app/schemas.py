"""Pydantic request/response schemas for the market-data API."""
from __future__ import annotations

from datetime import datetime
from typing import Any, Literal

from pydantic import BaseModel, ConfigDict, Field, model_validator

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



# ---------------------------------------------------------------------------
# Phase 6: historical data coverage + backtesting
# ---------------------------------------------------------------------------

class CoverageGapOut(BaseModel):
    from_ts: int
    to_ts: int
    gap_ms: int


class ImportRunOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    file_name: str
    status: str
    total_rows: int
    accepted: int
    rejected: int
    duplicated: int
    skipped: int
    started_at: datetime | None = None
    finished_at: datetime | None = None


class CoverageReport(BaseModel):
    exchange: Exchange
    symbol: str
    candle_count: int
    first_ts: int | None = None
    last_ts: int | None = None
    date_range_days: float | None = None
    duplicate_records: int = 0
    invalid_records: int = 0
    gaps: list[CoverageGapOut] = Field(default_factory=list)
    missing_sessions: list[str] = Field(default_factory=list)
    corporate_action_status: str = "unknown / unverified"
    source: str = "IMPORTED_CSV"
    status: DataStatus = "IMPORTED"
    is_live: bool = False
    import_runs: list[ImportRunOut] = Field(default_factory=list)
    warnings: list[str] = Field(default_factory=list)
    limitations: list[str] = Field(default_factory=list)


class BacktestRequest(BaseModel):
    exchange: Exchange
    symbol: str = Field(min_length=1, max_length=64)
    strategy: Literal["sma_crossover"] = "sma_crossover"
    short_period: int = Field(ge=2, le=200)
    long_period: int = Field(ge=3, le=500)
    start_ms: int = Field(gt=0)
    end_ms: int = Field(gt=0)
    split_ms: int | None = Field(default=None, gt=0)
    initial_capital: float = Field(gt=0, le=1_000_000_000)
    allocation_pct: float = Field(gt=0, le=1.0)
    cost_bps: float = Field(ge=0, le=500)
    slippage_bps: float = Field(ge=0, le=500)
    cost_per_trade: float = Field(ge=0, le=100000, default=0.0)
    max_candles: int = Field(ge=1, le=20000, default=20000)

    @model_validator(mode="after")
    def _validate_periods_and_range(self):
        if self.short_period >= self.long_period:
            raise ValueError("short_period must be less than long_period")
        if self.start_ms >= self.end_ms:
            raise ValueError("start_ms must be < end_ms")
        if self.split_ms is not None and not (self.start_ms < self.split_ms < self.end_ms):
            raise ValueError("split_ms must be between start_ms and end_ms")
        return self


class BacktestTradeOut(BaseModel):
    entry_ts: int
    exit_ts: int
    entry_price: float
    exit_price: float
    quantity: float
    gross_pnl: float
    costs: float
    net_pnl: float


class BacktestMetricsOut(BaseModel):
    initial_capital: float
    final_equity: float
    net_profit: float
    net_return_pct: float
    gross_profit: float
    total_costs: float
    completed_trades: int
    win_rate: float | None = None
    avg_win: float | None = None
    avg_loss: float | None = None
    max_drawdown_pct: float
    exposure_pct: float
    sharpe_ratio: float | None = None


class EquityPointOut(BaseModel):
    ts: int
    equity: float


class BacktestRunOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    exchange: Exchange
    symbol: str
    strategy_name: str
    strategy_version: str
    status: str
    error_message: str | None = None
    start_ts: int
    end_ts: int
    split_ts: int | None = None
    initial_capital: float
    allocation_pct: float
    cost_bps: float
    slippage_bps: float
    created_at: datetime | None = None
    finished_at: datetime | None = None
    candle_count: int = 0
    dataset_first_ts: int | None = None
    dataset_last_ts: int | None = None


class BacktestDetailOut(BacktestRunOut):
    params: dict[str, Any] = Field(default_factory=dict)
    metrics: BacktestMetricsOut | None = None
    equity_curve: list[EquityPointOut] = Field(default_factory=list)
    trades: list[BacktestTradeOut] = Field(default_factory=list)
    assumptions: list[str] = Field(default_factory=list)
    warnings: list[str] = Field(default_factory=list)


class BacktestListResponse(BaseModel):
    count: int
    runs: list[BacktestRunOut]


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
