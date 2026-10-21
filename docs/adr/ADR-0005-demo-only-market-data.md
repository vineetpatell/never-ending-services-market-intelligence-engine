# ADR-0005 — Demo-only market data; delayed provider selection

- **Status:** Accepted
- **Date:** 2026-10-20
- **Decision owner:** Project owner
- **Baseline refs:** NES-MKT-011 (no provider selected/endorsed; 8-point
  checklist; adapter contract; DEMO-only prototype rule), NES-API-007 (demo
  adapters; `is_live:false` envelope), NES-SRS-003 (FR-003/FR-004, "no live feed
  until authorised provider"), NES-DATA-008 (MarketBar/QuoteCache with
  source/quality), NES-COMP-020 (licensing gate).

## Context

Document 11 deliberately selects **no** market-data provider and requires
licence, coverage, delay, history, limits, corporate-action, auth, and cost
evaluation before any integration. The product scope is historical NSE/BSE
research; redistribution licensing is the largest non-RAM risk (Phase 0
finding). Any premature "live" claim would violate FR-003 and the prototype
rule.

## Options considered

- **Option A — Explicitly labelled synthetic/demo fixtures + a provider
  adapter interface; real provider only after a documented doc-11 evaluation.**
  Benefits: UI milestones (M2–M5) unblocked without legal/technical exposure;
  every value carries `source/data_timestamp/status`; first real feed scoped to
  delayed daily EOD to minimise storage/RAM/licence weight. Costs/risks: demo
  fixtures must be maintained and clearly fenced so they can never leak into a
  "live" presentation.
- **Option B — Integrate a free/unofficial feed now (e.g. scraping or an
  unverified API).** Rejected: unverified redistribution terms, unknown
  adjustment/corporate-action handling, contradicts NES-MKT-011 and the
  compliance gate.
- **Option C — Intraday/WebSocket-first integration.** Rejected for now:
  storage, RAM, and licensing weight far exceed "historical research" needs;
  retained only as a post-M8 option with its own ADR.

## Decision

Adopt **Option A**. All market displays use `DEMO_DATA` labelling and the doc-07
envelope (`source`, `data_timestamp`, `status:"demo"`, `is_live:false`); the
seven freshness states (LIVE/DELAYED/STALE/CLOSED/DISCONNECTED/PARTIAL/DEMO)
are implemented as distinct UI states with DEMO the only populated one until a
provider passes review. No provider credentials are procured in this phase.

## Consequences

- Positive: zero licensing risk during prototype; backtest/paper milestones run
  on reproducible fixtures; provider swap is an adapter change, not a rewrite.
- Trade-offs: demo data must never be mistaken for coverage of real
  corporate-action/adjustment edge cases — engine tests use hand-built fixtures
  per NES-BT-012 §5 instead.
- No fixtures, adapters, or provider code written in this phase.

## Review trigger

Reconsider when a specific NSE/BSE data need (history depth, delay tolerance,
budget) is named; provider choice then gets its own evaluation note + ADR
covering licence, latency, retention, and measured storage/RAM.
