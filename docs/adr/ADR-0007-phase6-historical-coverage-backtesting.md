# ADR-0007 — Historical coverage service and local backtesting engine

- **Status:** Accepted
- **Date:** 2026-10-21
- **Decision owner:** Project owner

## Context

Phase 6 requires reliable historical-data coverage reporting and reproducible
backtesting without live feeds, broker orders, or prediction claims.

## Decision

- Add a read-only coverage service that reports counts, range, inferred gaps,
  import-run provenance, duplicate/invalid counts, and unverified corporate-action
  status. It does not fabricate candles or enforce an assumed trading calendar.
- Add a separate pure-Python backtesting module (`app.backtesting`) implementing
  a long-only SMA crossover strategy. Signals use closes up to the decision bar;
  execution occurs at the next bar open with configurable slippage/costs.
- Persist run metadata and results in `backtest_runs` via SQLAlchemy/Alembic.
- Expose validated `/api/v1/coverage` and `/api/v1/backtests` endpoints.
- Frontend calls backend for all calculations; no fake performance numbers.

## Consequences

- Reproducible runs with recorded assumptions.
- Walk-forward split supported via `split_ms`.
- Metrics include drawdown, costs, win rate, exposure, optional Sharpe.
- Limitations: no trading calendar, no corporate-action verification, no
  parameter optimization, no live execution.
