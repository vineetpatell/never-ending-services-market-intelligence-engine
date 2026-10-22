# ADR-0008 — Finance-only product reorientation; insurance module removed

- **Status:** Accepted
- **Date:** 2026-10-21
- **Decision owner:** Project owner
- **Baseline refs:** NES-PRD-001 (product goals/scope), NES-SRS-003
  (FR-001…FR-016), NES-UX-002 (navigation and tokens), NES-INS-013
  (insurance extraction/comparison rules — **not implemented, not modified**),
  NES-CLINE-006 (record major choices as ADRs; preserve working behaviour).

## Context

The baseline (docs 00–22) describes a "Finance & Insurance Intelligence
Platform": an equity-research workspace **plus** a personal insurance
document-assistance module (policy vault, OCR extraction review, comparison,
claims checklist, renewal reminders).

During implementation it became clear that the insurance module existed
**only in the frontend** as static demo screens. There is no insurance router,
model, schema, migration, or persistence in the backend. It carried:

- six routes (`/insurance`, `/insurance/vault`, `/insurance/review`,
  `/insurance/comparison`, `/insurance/claims`, `/insurance/renewals`) and a
  six-item navigation group;
- two page files (`src/pages/Insurance1.tsx`, `src/pages/Insurance2.tsx`);
- demo fixtures (`DemoPolicy`, `demoPolicies`, `demoExtractedFields`,
  `demoRenewals`) and an insurance Copilot preset plus a `policy` activity kind;
- two of the twelve Motion Lab demos (A07 policy field review highlight,
  A08 comparison column sync).

The finance side is real and substantial: market data, charts, historical
coverage reporting, a backtesting engine, paper trading, and the Copilot.
Maintaining a non-functional insurance surface also created real product risk:
it implied document handling, renewal obligations, and claims assistance that
the prototype cannot deliver.

## Options considered

- **Option A — Remove the insurance module entirely; reorient the product,
  navigation, demos, and living documentation around finance and
  stock-market intelligence.** Benefits: no dead or misleading surfaces; every
  shipped screen is backed by real (demo-labelled) finance behaviour; the
  smallest honest scope; the immutable baseline PDFs are untouched, so the
  removal is recorded here rather than by editing baseline documents.
- **Option B — Keep the insurance screens as clearly-labelled static
  demos.** Rejected: it preserves a module with no backend, no data model,
  and no upload path — exactly the "demo that reads as a feature" pattern the
  baseline forbids elsewhere (FR-003 demo labelling). It also keeps the
  review-before-verified / OCR-verification rules in scope for content that
  will not be built.
- **Option C — Keep the insurance module and build the missing backend
  (documents, OCR, comparison persistence).** Rejected for now: this would
  add document-upload and personal-data handling (NES-SEC-010) with no
  requirement from the product owner, and it competes for the 16 GB RAM /
  6 GB VRAM budget with the finance work that is actually in flight.

## Decision

Adopt **Option A**.

- Delete the six insurance routes and their navigation group; delete
  `src/pages/Insurance1.tsx` and `src/pages/Insurance2.tsx`.
- Delete the insurance demo fixtures (`DemoPolicy`, `demoPolicies`,
  `demoExtractedFields`, `demoRenewals`), the insurance Copilot preset, and the
  `policy` activity kind. No backend, model, schema, or migration changes
  were needed — the insurance module was frontend-only.
- Re-theme Motion Lab demos **A07** and **A08** as finance demos (indicator
  status change highlight; watchlist column sync). All **twelve** demos are
  retained; only the A07/A08 subject matter changed.
- Update product copy and living documentation (`index.html`, `package.json`,
  root `README.md`, `AGENTS.md`, `docs/README.md`,
  `docs/animation-inventory.md`, `docs/development-environment.md`).
- The immutable baseline pack, including `13_Insurance_Document_and_Comparison_Rules.pdf`
  (NES-INS-013), is **not** modified. Any future reinstatement of insurance
  work requires a superseding ADR.

## Consequences

- Positive: every route in the app is live and finance-scoped; no dead
  navigation; the product statement matches what the code does; the demo
  surface is smaller and easier to keep correctly labelled.
- Trade-offs: the insurance capability described in the baseline is not
  delivered in this prototype; FR/AT items in NES-INS-013 are not met.
  Earlier accepted ADRs (ADR-0004, ADR-0006) mention insurance in passing —
  they are left immutable per ADR convention and are superseded in this
  respect by ADR-0008.
- No new dependency, no API change, no data migration, and no change to the
  demo-data labelling policy (`DEMO_DATA` / `is_live: false`) was introduced.

## Review trigger

Reconsider if the product owner reinstates insurance document assistance, or
if a real provider/OCR path is evaluated and approved — then via a superseding
ADR that specifies the backend model, upload/privacy rules (NES-SEC-010), and
the review-before-verified flow.