"""Backtesting endpoints."""
from __future__ import annotations

import json
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select
from sqlalchemy.orm import Session

from app import models, schemas
from app.backtesting.engine import BacktestConfig, run_sma_crossover
from app.database import get_session

router = APIRouter(tags=["backtests"])

VALID_EXCHANGES = {"NSE", "BSE"}


def _load_run(db: Session, run_id: int) -> models.BacktestRun:
    run = db.get(models.BacktestRun, run_id)
    if run is None:
        raise HTTPException(status_code=404, detail="backtest run not found")
    return run


def _run_to_detail(run: models.BacktestRun) -> schemas.BacktestDetailOut:
    result = json.loads(run.result_json) if run.result_json else {}
    params = json.loads(run.params_json) if run.params_json else {}
    metrics = result.get("metrics")
    equity = result.get("equity_curve") or []
    trades = result.get("trades") or []
    assumptions = result.get("assumptions") or []
    warnings = result.get("warnings") or []
    base = schemas.BacktestRunOut.model_validate(run)
    return schemas.BacktestDetailOut(
        **base.model_dump(),
        params=params,
        metrics=schemas.BacktestMetricsOut(**metrics) if metrics else None,
        equity_curve=[schemas.EquityPointOut(**p) for p in equity],
        trades=[schemas.BacktestTradeOut(**t) for t in trades],
        assumptions=assumptions,
        warnings=warnings,
    )


@router.get("/api/v1/backtests", response_model=schemas.BacktestListResponse)
def list_backtests(
    exchange: str | None = Query(default=None),
    symbol: str | None = Query(default=None),
    limit: int = Query(default=50, ge=1, le=200),
    db: Session = Depends(get_session),
):
    q = select(models.BacktestRun).order_by(models.BacktestRun.created_at.desc()).limit(limit)
    if exchange:
        if exchange not in VALID_EXCHANGES:
            raise HTTPException(status_code=400, detail="invalid exchange")
        q = q.where(models.BacktestRun.exchange == exchange)
    if symbol:
        if len(symbol) > 64:
            raise HTTPException(status_code=400, detail="invalid symbol")
        q = q.where(models.BacktestRun.symbol == symbol)
    runs = db.execute(q).scalars().all()
    return schemas.BacktestListResponse(count=len(runs), runs=[schemas.BacktestRunOut.model_validate(r) for r in runs])


@router.get("/api/v1/backtests/{run_id}", response_model=schemas.BacktestDetailOut)
def get_backtest(run_id: int, db: Session = Depends(get_session)):
    run = _load_run(db, run_id)
    return _run_to_detail(run)


@router.post("/api/v1/backtests", response_model=schemas.BacktestDetailOut)
def create_backtest(req: schemas.BacktestRequest, db: Session = Depends(get_session)):
    if req.exchange not in VALID_EXCHANGES:
        raise HTTPException(status_code=400, detail="invalid exchange")

    # Load candles in range.
    instrument = db.execute(
        select(models.Instrument).where(models.Instrument.exchange == req.exchange, models.Instrument.symbol == req.symbol)
    ).scalar_one_or_none()

    q = select(models.Candle)
    if instrument is not None:
        q = q.where(models.Candle.instrument_id == instrument.id)
    else:
        q = q.where(models.Candle.id == -1)  # none
    q = q.where(models.Candle.ts >= req.start_ms, models.Candle.ts <= req.end_ms).order_by(models.Candle.ts).limit(req.max_candles)
    rows = db.execute(q).scalars().all() if instrument is not None else []

    if instrument is None or not rows:
        raise HTTPException(status_code=400, detail="insufficient historical data for selected range")

    candles = [
        {
            "ts": r.ts,
            "open": r.open,
            "high": r.high,
            "low": r.low,
            "close": r.close,
            "volume": r.volume,
        }
        for r in rows
    ]

    if len(candles) < req.long_period + 2:
        raise HTTPException(status_code=400, detail="insufficient candles for strategy warm-up")

    config = BacktestConfig(
        short_period=req.short_period,
        long_period=req.long_period,
        initial_capital=req.initial_capital,
        allocation_pct=req.allocation_pct,
        cost_bps=req.cost_bps,
        slippage_bps=req.slippage_bps,
        cost_per_trade=req.cost_per_trade,
        split_ts=req.split_ms,
    )

    try:
        result = run_sma_crossover(candles, config)
    except Exception:
        raise HTTPException(status_code=500, detail="backtest failed")

    run = models.BacktestRun(
        exchange=req.exchange,
        symbol=req.symbol,
        strategy_name=req.strategy,
        strategy_version="1",
        params_json=json.dumps(req.model_dump(), default=str),
        start_ts=req.start_ms,
        end_ts=req.end_ms,
        split_ts=req.split_ms,
        initial_capital=req.initial_capital,
        allocation_pct=req.allocation_pct,
        cost_bps=req.cost_bps,
        slippage_bps=req.slippage_bps,
        execution_rule="signal_at_close_execute_next_open",
        dataset_source=rows[0].source if rows else "IMPORTED_CSV",
        dataset_first_ts=candles[0]["ts"],
        dataset_last_ts=candles[-1]["ts"],
        candle_count=len(candles),
        status="COMPLETED",
        finished_at=datetime.now(timezone.utc),
        result_json=json.dumps(result.__dict__, default=str),
    )
    db.add(run)
    db.commit()
    db.refresh(run)
    return _run_to_detail(run)
