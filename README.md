# NES AI Finance Intelligence Platform

A **local-first, personal-use** workspace for NSE/BSE equity research,
historical strategy testing, and simulated paper trading.
AI assistance is explanatory and grounded in local records — never a source of
financial truth.

## Personal-use boundaries (non-negotiable for the initial release)

- Historical research and **paper trading only** — no live brokerage order
  execution, no auto-trading, no investment recommendations.
- Backtesting only over **historical** data with stated costs, explicit
  fills/slippage, and no look-ahead — no prediction or performance guarantees.
- All demo/synthetic data is **explicitly labelled** (`DEMO_DATA`,
  `is_live: false`); nothing is presented as live until a provider is
  evaluated, approved, and tested.
- Localhost-first; personal data stays on this machine by default and is
  never sent to external services without explicit approval and disclosure.
- Any future customer-facing regulated financial activity requires
  India-specific compliance review first (see doc 20 in the pack).

## Scope note — insurance module removed (ADR-0008)

The frontend-only insurance module (policy vault, document review, comparison,
claims checklist, renewals) was removed on 2026-10-21. The product is now
finance-only: market data, charts, historical coverage, backtesting, and paper
trading are all retained. The immutable baseline PDFs (including
`13_Insurance_Document_and_Comparison_Rules.pdf`) are unchanged. See
`docs/adr/ADR-0008-finance-only-product-reorientation.md`.

## Documentation

- Immutable requirements baseline (22 PDFs, Phase 0-verified, do not modify):
  `NES_AI_Finance_Insurance_Project_Documentation_Pack/`
  (index: `00_Document_Register_and_Reading_Order.pdf`).
- Living docs and decisions: `docs/` (start at `docs/README.md`).
- Architecture decisions: `docs/adr/`.
- Standing agent instructions: `AGENTS.md`.

## Current status — Phase 6 (finance-only prototype)

> The application is a working **finance-only prototype**: a Vite + React
> frontend (market data, charts, screener, watchlist, backtesting, paper
> trading, Copilot, Motion Lab) plus a local FastAPI backend
> (instruments, candles, imports, data status, health, historical coverage,
> backtest runs). Market data is **demo-only** (`DEMO_DATA` / `is_live: false`)
> and the AI Copilot is a **preset demo** — no model is connected.

Delivered and recorded in `docs/`: eight ADRs (Vite+React, SQLite-first,
localhost-first, Vitest/Playwright/pytest, demo-only market data, AI disabled,
historical coverage + backtesting, finance-only reorientation), the
12-animation inventory, and environment notes.

Still **not** built: live market-data provider integration, a real AI model
integration, and any customer-facing regulated flow.

## Approved stack direction

Vite + React + TypeScript + Tailwind + shadcn/ui, Inter, CSS + GSAP +
ScrollTrigger, lazy Three.js + R3F with static fallback, FastAPI + Pydantic +
SQLAlchemy + Alembic (later phase), SQLite-first, demo fixtures only,
local AI disabled, localhost-first with packaging deferred, Node.js 22,
Python 3.11 venv (required before backend phase; this machine currently has
Python 3.10.11).
