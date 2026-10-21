# ADR-0004 — TypeScript/Python testing approach

- **Status:** Accepted
- **Date:** 2026-10-20
- **Decision owner:** Project owner
- **Baseline refs:** NES-TEST-009 (7 test levels; calc/doc/AI test
  requirements; gates), NES-SRS-003 (AT-01…AT-06), NES-BT-012 (hand-calculated
  validation sets), NES-CLINE-006 (run lint/type-check/tests/build per change).

## Context

The baseline names test levels and acceptance criteria but selects **no test
frameworks** (Phase 0 gap G2). The stack is TypeScript-first (frontend now,
backend Python later). Suites must run comfortably on 16 GB RAM alongside the
dev servers — one browser at a time, serial suites, no heavy grid.

## Options considered

- **Option A — Vitest (unit/component) + Playwright small suite (e2e) +
  pytest (backend later) + secret scanning (e.g. gitleaks).**
  Benefits: Vitest is the Vite-native runner (fast, ESM-clean); Playwright
  covers the six acceptance paths with one local Chromium; pytest pairs with
  FastAPI/SQLAlchemy; secret-scan enforces NES-SEC-010 in the tree.
  Costs/risks: two JS runners to learn (Vitest + Playwright) — standard pairing,
  well documented.
- **Option B — Jest + Testing Library only.** Benefits: familiar. Costs/risks:
  heavier/slower under Vite ESM, no real-browser coverage for AT-01/03/04/06 —
  would still need Playwright, so Jest adds weight without removing a tool.
- **Option C — Full e2e for everything.** Rejected: browser-RAM hungry,
  brittle for calculation logic that belongs in unit tests per NES-TEST-009 §4.

## Decision

Adopt **Option A**. Minimum suites: unit (indicators, validators, formatters,
backtest math against hand-checkable fixtures, no look-ahead); component (forms,
tables, loading/error states, reduced-motion); e2e smoke (navigation, screener,
backtest wizard, paper-order simulation banner, policy review/compare,
no-WebGL fallback); backend contract tests when FastAPI lands. Every coding
task runs lint + type-check + affected tests per NES-CLINE-006.

## Consequences

- Positive: lightest standard coverage of all 7 baseline levels; gates in
  NES-TEST-009 §6 become mechanically checkable.
- Trade-offs: Playwright browsers download on first use (documented at scaffold
  time, not installed in this phase); e2e suite must stay small by policy.
- No frameworks installed and no tests written in this phase.

## Review trigger

Reconsider if Vitest proves incompatible with a chosen library, if e2e runtime
exceeds the (to-be-set) perf budget, or when backend contract testing needs
exceed pytest's fit.
