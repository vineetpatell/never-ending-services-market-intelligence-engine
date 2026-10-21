# Development environment

Verified toolchain state + setup guidance. Follows baseline document 17
(`17_Environment_Setup_and_Local_Runbook.pdf`, NES-DEV-017).

## Verified versions (Phase 0 audit, 2026-10-20)

| Tool | Verified version | Note |
|------|------------------|------|
| OS | Windows 11 | Target platform |
| Node.js | v22.18.0 | Matches "Node.js LTS" requirement |
| npm | 10.9.3 | Ships with Node 22 |
| Git | 2.51.0 | Working tree clean, `main` in sync |
| Python | **3.10.11** | **Not 3.11** — see below |
| RAM / GPU | 16 GB / RTX 4050 6 GB VRAM | One heavy process at a time |

No PDF tooling, no frontend/backend dependencies, and no model runtimes are
installed. Phase 1A installs nothing (per phase rules).

## Python 3.11 requirement (NOT yet satisfied)

Document 17 and ADR-0002 require **Python 3.11 in an isolated virtual
environment** before any backend work. The audit verified this machine has
**Python 3.10.11** — do **not** assume 3.11 is present.

Before the backend phase:

1. Install Python 3.11 (windows installer, per-user, **without** modifying the
   global PATH unless you intend it).
2. Verify with `py -3.11 --version`.
3. Create the project venv (from the repo root, once a backend exists):
   `py -3.11 -m venv .venv`, then activate per-session.
4. Pin backend dependencies in project files with a lockfile; record exact
   versions in the backend ADR update.

## Environment files

- `.env.example` (repo root) holds **placeholders only**. Copy to `.env`
  (git-ignored) when a phase actually needs it. Never commit real credentials.
- `MARKET_PROVIDER=demo` stays until a doc-11 provider evaluation + ADR says
  otherwise. `LOCAL_MODEL_URL` stays empty until M7.

## First-run checklist (applies once the scaffold exists)

Per doc 17: clone/open → install from the committed lockfile → copy `.env` from
the example → run lint, type-check, tests, build → start frontend (and backend
only when its phase lands) → verify loopback-only access → confirm every
market/policy value shows DEMO labelling.

## Verification commands (verified 2026-10-21)

- `npm run lint` — ESLint over `src/`.
- `npm run typecheck` — `tsc -b`.
- `npm test` — Vitest (jsdom) over `src/charts/__tests__/`.
- `npm run build` — `tsc -b && vite build`.

## Backend verification (Phase 5, 2026-10-21)

- Python 3.11 was NOT available; used system Python 3.10.11 in `.venv` (no global changes).
- Backend tests: `cd backend && ..\.venv\Scripts\python.exe -m pytest -q` → 18 passed.
- Backend run: `cd backend && ..\.venv\Scripts\python.exe -m uvicorn app.main:app --host 127.0.0.1 --port 8000`.
- Health check: `GET http://127.0.0.1:8000/api/v1/health` → `{"status":"ok","version":"0.1.0","database":"ok"}`.
- Frontend gates still pass: lint 0, typecheck 0, 36/36 tests, build success.
All four must pass before a change is considered done.

## Reproducibility rule


Per doc 17 §6: do not claim a command works until it has been run successfully
in this environment. Record exact commands + outcomes in milestone notes.
