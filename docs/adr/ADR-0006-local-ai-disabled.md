# ADR-0006 — Local AI disabled until separately evaluated

- **Status:** Accepted
- **Date:** 2026-10-20
- **Decision owner:** Project owner
- **Baseline refs:** NES-AI-014 (local-model default direction; benchmark
  memory/latency/quality; quantisation only after evaluation; fallback
  required; 7 eval cases), NES-SEC-010 (disclose any external transfer; explicit
  approval), NES-CLINE-006 (no invented model outputs; document blockers),
  NES-PLAN-005 (AI is milestone 7, after base app works), NES-DEV-017 (AI
  runtime "only after the base application works").

## Context

The 6 GB VRAM budget fits roughly one small quantized model *or* heavy 3D, not
both comfortably, and document 14 requires measured memory/latency/quality plus
a non-AI fallback before any adoption. The Copilot in early milestones answers
from clearly labelled demonstration responses (FR-012), not from a model. No
model ID, quant level, embedding, or retrieval design has been evaluated
(Phase 0 gap G2).

## Options considered

- **Option A — AI disabled for Phases 1–6; preset demo responses in the UI;
  real local-model evaluation as a separately approved M7 activity (Ollama +
  one small Q4 chat model shortlisted by bench).**
  Benefits: zero VRAM/RAM contention during foundation and trading/insurance
  milestones; eval-case suite (missing source, conflicts, unsupported
  questions, backtest misreading, prompt injection, data minimisation, no fake
  confidence) gates adoption on evidence. Costs/risks: Copilot is non-functional
  demo until M7 — already the documented expectation.
- **Option B — Bundle a model now.** Rejected: unevaluated VRAM/latency/quality
  on this laptop; contradicts the涌 sequencing in NES-PLAN-005 and NES-DEV-017.
- **Option C — External AI API now.** Rejected: sends personal financial
  document content off-machine; requires explicit approval + disclosure per
  NES-SEC-010/NES-AI-014 §7, none granted.

## Decision

Adopt **Option A**. No model runtime, endpoint, embedding store, or API key
exists after this phase. M7 entry criteria: named model candidates, measured
idle/loaded VRAM, tokens/s, quality scores on the 7 doc-14 eval cases, fallback
behaviour proven, prompts/settings versioned — recorded in a superseding ADR
before any model is adopted.

## Consequences

- Positive: foundation phases stay light; privacy posture stays closed; no
  fake "AI connected" claims possible (FR-012 demo labels enforced).
- Trade-offs: document Q&A and grounded Copilot wait until M7; any earlier AI
  experiment is out-of-tree only.
- No benchmarks run and no model downloaded in this phase.

## Review trigger

Reconsider at M7 entry, or if a task demonstrably requires retrieval/summary
earlier — then via a scoped evaluation ADR, never by silent enablement.
