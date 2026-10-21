# AGENTS.md — Standing instructions for AI coding agents

Derived from baseline document 06 (`06_Cline_Project_Instructions.pdf`,
NES-CLINE-006). These rules apply to every implementation task in this
repository. The 22 PDFs under
`NES_AI_Finance_Insurance_Project_Documentation_Pack/` are the immutable
requirements baseline — guidance here never overrides them.

## 1. Product boundaries (hard stops)

- Personal-use, local-first app. Historical NSE/BSE research + paper trading
  only. Insurance = document assistance, comparison, renewals.
- NEVER implement live broker order routing, auto-trading, insurance
  purchases/issuance, claims guarantees, or customer-facing regulated flows.
- NEVER label demo/synthetic data as live. Every market/policy value carries
  source, timestamp/freshness, and demo status (`is_live: false` where typed).
- NEVER present simulated results as real, AI demo responses as model output,
  or unverified OCR text as verified policy fact (review step required).
- NEVER send personal documents or queries to external services without explicit
  user approval and clear disclosure of what leaves the machine.

## 2. Before modifying anything

- Inspect the repository and the relevant baseline docs/ADRs first; follow the
  gated reading order in `docs/README.md`.
- State the smallest scope and the likely files to change before editing.
- Do not overwrite working configuration without inspecting it; do not rename,
  move, or regenerate the baseline PDFs.
- Do not invent API endpoints, provider capabilities, credentials, benchmark
  numbers, or "live" integrations. If blocked, create the typed adapter
  interface and document the blocker instead of fabricating connectivity.

## 3. Engineering discipline

- Small, focused, runnable changes. Preserve existing working behaviour.
- TypeScript types + runtime validation at system boundaries; reusable shared
  components + central design tokens; domain logic outside presentation
  components; no giant single-file components.
- Justify every new dependency; explain large additions. Prefer the approved
  stack (see `docs/adr/`); anything else needs an ADR first.
- Follow the hybrid theme (light dashboard/insurance, dark trading), Inter,
  tabular numerals for money, and the tokens in doc 02.
- Motion: CSS for simple, GSAP (+ScrollTrigger, with cleanup on unmount) for
  complex timelines; respect reduced-motion with static fallbacks; Three.js
  lazy-loaded and optional — core UI must work without WebGL.

## 4. Data, money, and error safety

- Financial calculations live in testable domain modules with documented
  assumptions; decimal-safe money, tz-aware timestamps; bias controls per
  doc 12 (no look-ahead, explicit fills/fees/slippage).
- Safe error handling: user-actionable messages, no stack traces or secrets in
  UI/logs; every async flow has loading/empty/error/retry states; retry never
  duplicates financial operations.
- Never commit secrets, real credentials, personal documents, model weights,
  local DBs, or backups. Respect `.gitignore`; keep `.env.example`
  placeholder-only.

## 5. Definition of done (per task)

- Behaviour implemented and actually run — not merely described.
- `lint`, type-check, affected tests, and build pass (or failures reported
  precisely); regressions fixed.
- No dead navigation, no inert primary controls, demo labels intact,
  paper-trading-only banner intact, review-before-verified intact.
- Changelog/living docs updated when behaviour or setup changes; major choices
  recorded as ADRs under `docs/adr/`.
- Summarise: files changed, tests run + outcomes, known limitations, manual
  verification needed.
