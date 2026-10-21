# ADR-0002 — SQLite-first persistence; FastAPI introduced in a later phase

- **Status:** Accepted
- **Date:** 2026-10-20
- **Decision owner:** Project owner
- **Baseline refs:** NES-ARCH-004 ("PostgreSQL as intended primary; SQLite for a
  small initial prototype"; backend "later"), NES-DATA-008 (proposed logical
  model, "not a final schema"; ERD before migrations), NES-PLAN-005 (prototype
  before backend integration), NES-DEV-017 (Python 3.11 venv, lockfile
  workflow), NES-DATAOPS-016 (backup/restore/deletion semantics).

## Context

The roadmap requires a clickable prototype with demo data **before** backend
integration, and the data model doc explicitly forbids treating its entity list
as a final schema. The dev machine has 16 GB RAM shared with the frontend,
browser, and (later) optional local AI. The application is single-user,
local-first; no concurrency, multi-tenancy, or networked access is required in
the initial release.

## Options considered

- **Option A — SQLite-first via SQLAlchemy + Alembic from the first backend
  commit; FastAPI + Pydantic v2 introduced in a later phase (M4+).**
  Benefits: zero resident service/RAM, single-file backup story matching
  NES-DATAOPS-016, full migration path via Alembic from day one, SQLAlchemy
  models portable to PostgreSQL later. Costs/risks: single-writer semantics
  (fine for one user); a later engine swap needs a migration ADR.
- **Option B — PostgreSQL from day one.** Benefits: matches doc 04's "intended
  primary", richer types/concurrency. Costs/risks: ~200–400 MB idle service plus
  ops/backup complexity for one local user; contradicts prototype-first
  sequencing and the 16 GB budget discipline.
- **Option C — JSON files, no database.** Rejected: no integrity constraints,
  no migrations, contradicts NES-DATA-008 modelling principles.

## Decision

Adopt **Option A**. Phases 1–3 remain frontend-only with typed demo adapters;
the FastAPI backend lands in a later phase with SQLAlchemy models against
SQLite (file under the user data directory), Alembic migrations from the first
commit, decimal-safe money fields and tz-aware timestamps per NES-DATA-008.
PostgreSQL remains a documented future option, not a commitment.

## Consequences

- Positive: lightest viable persistence, honest backup/restore story, no
  backend needed to validate UI milestones.
- Trade-offs: engine-specific SQL must be avoided so a future Postgres move is
  cheap; file-path, backup-format, and encryption decisions still open (see
  ADR review trigger + doc 16).
- No benchmarks run; no database code written in this phase.

## Review trigger

Reconsider when measured data volume, concurrent writers, or full-text needs
exceed SQLite comfort, or when backup/encryption requirements demand a server
database. Any engine change gets a superseding ADR plus a tested migration.
