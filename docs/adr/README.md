# Architecture Decision Records

One file per significant technical decision, following document 21
(`21_Architecture_Decision_Record_ADR_Template.pdf`, NES-ADR-021).

## Conventions

- IDs are sequential: `ADR-0001`, `ADR-0002`, …
- Status is one of: Proposed / Accepted / Superseded / Rejected.
- Accepted decisions are **immutable** — supersede with a new ADR, never rewrite history.
- Each ADR states context, options considered, decision, consequences, and a
  review trigger.
- No performance benchmark is claimed unless it was actually run and recorded.

## Index

| ID | Title | Status | Date |
|----|-------|--------|------|
| ADR-0001 | Frontend stack: Vite + React vs Next.js | Accepted | 2026-10-20 |
| ADR-0002 | SQLite-first persistence; FastAPI introduced in a later phase | Accepted | 2026-10-20 |
| ADR-0003 | Localhost-first operation; deferred desktop packaging | Accepted | 2026-10-20 |
| ADR-0004 | TypeScript/Python testing approach | Accepted | 2026-10-20 |
| ADR-0005 | Demo-only market data; delayed provider selection | Accepted | 2026-10-20 |
| ADR-0006 | Local AI disabled until separately evaluated | Accepted | 2026-10-20 |
