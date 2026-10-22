# Living documentation

This directory holds **living, version-controlled project documentation** created
during implementation. It is separate from the immutable baseline pack.

## Immutable baseline (source of truth)

The 22 original requirements PDFs live in:

```
NES_AI_Finance_Insurance_Project_Documentation_Pack/
```

They are the Phase 0–verified requirements baseline (see the Phase 0 audit report):

- `00_Document_Register_and_Reading_Order.pdf` (NES-DOC-000) — index + gated reading order.
- `01_Product_Requirements_Document_PRD.pdf` (NES-PRD-001) — goals, scope, workflows, acceptance.
- `02_UI_UX_Design_Specification.pdf` (NES-UX-002) — tokens, navigation, wireframes, responsive, accessibility.
- `03_Software_Requirements_Specification_SRS.pdf` (NES-SRS-003) — FR-001…FR-016, NFRs, AT-01…AT-06.
- `04_Software_Architecture_Design.pdf` (NES-ARCH-004) — layers, domains, data flow, decisions to record.
- `05_Implementation_Roadmap_and_Milestones.pdf` (NES-PLAN-005) — 8 phases, Definition of Done.
- `06_Cline_Project_Instructions.pdf` (NES-CLINE-006) — standing repo rules (transcribed to root `AGENTS.md`).
- `07_API_Contracts_and_OpenAPI_Plan.pdf` (NES-API-007) — draft-only API groups, not implemented routes.
- `08_Data_Model_and_ERD_Specification.pdf` (NES-DATA-008) — proposed logical model, not a final schema.
- `09_Test_Strategy_and_Acceptance_Checklist.pdf` (NES-TEST-009) — test levels, gates.
- `10_Security_Privacy_and_Threat_Model.pdf` (NES-SEC-010) — localhost-first, redaction, upload rules.
- `11_Market_Data_Source_Specification.pdf` (NES-MKT-011) — provider checklist, adapter contract, freshness states.
- `12_Backtesting_Methodology_Specification.pdf` (NES-BT-012) — inputs, bias controls, metrics, validation.
- `13_Insurance_Document_and_Comparison_Rules.pdf` (NES-INS-013) — extraction review, comparison, claims limits. **Out of current product scope** — the insurance module was removed (ADR-0008); the PDF remains the immutable baseline record.
- `14_AI_Behaviour_and_Evaluation_Plan.pdf` (NES-AI-014) — Copilot grounding, answer structure, eval cases.
- `15_Error_Handling_and_Diagnostics_Plan.pdf` (NES-OPS-015) — error categories, logging, diagnostics.
- `16_Backup_Restore_and_Data_Retention_Plan.pdf` (NES-DATAOPS-016) — backup scope, restore flow, deletion semantics.
- `17_Environment_Setup_and_Local_Runbook.pdf` (NES-DEV-017) — Windows setup, env vars, reproducibility.
- `18_User_Guide_and_Quick_Start.pdf` (NES-USER-018) — demo-first walkthroughs, limitations.
- `19_Release_Notes_Changelog_Template.pdf` (NES-REL-019) — release record format.
- `20_Future_Compliance_Review_Checklist.pdf` (NES-COMP-020) — gate before customer-facing regulated services.
- `21_Architecture_Decision_Record_ADR_Template.pdf` (NES-ADR-021) — ADR format used under `docs/adr/`.

**Rules:**

- Do **not** rename, move, rewrite, or regenerate the PDFs.
- Do **not** duplicate the PDFs into `docs/`.
- The PDFs are the baseline; anything that evolves during implementation is
  recorded **here** (ADRs, inventories, environment notes, changelog) with
  explicit references back to the baseline document IDs.
- If living docs and a baseline PDF ever disagree, the disagreement must be
  resolved by an explicit ADR — never by silent editing.

## What lives here

- `adr/` — Architecture Decision Records (see `adr/README.md`).
- `animation-inventory.md` — the 12-animation Motion Lab inventory, implemented in `src/motion/` (A07/A08 re-themed to finance scope in ADR-0008).
- `development-environment.md` — verified toolchain versions and setup guidance.
- Future: changelog entries, milestone status, ERD, contract notes — each added
  only when its phase work actually runs.

## Current product scope (living note)

The product is finance-only: market data, charts, historical coverage,
backtesting, paper trading, and the Copilot. The insurance module described in
the baseline was removed on 2026-10-21 — see
`adr/ADR-0008-finance-only-product-reorientation.md`. The baseline PDFs were
not modified; this note records the divergence so living docs and the baseline
never disagree silently.
