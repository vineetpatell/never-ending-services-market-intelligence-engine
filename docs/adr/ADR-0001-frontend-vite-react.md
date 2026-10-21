# ADR-0001 — Frontend stack: Vite + React vs Next.js

- **Status:** Accepted
- **Date:** 2026-10-20
- **Decision owner:** Project owner
- **Baseline refs:** NES-ARCH-004 (suggested Next.js, "use the existing stack if
  project already created"), NES-UX-002 (hybrid theme, responsive, a11y),
  NES-CLINE-006 (small changes, justify dependencies), NES-SRS-003 (FR-013/FR-014,
  NFR-006 performance).

## Context

The Phase 0 audit verified the repository contains **no application code and no
existing stack** — only the 22 baseline PDFs and a one-line README. Document 04
suggests Next.js + TypeScript + Tailwind + shadcn/ui but explicitly defers to
whatever already exists; nothing exists, so the choice is genuinely open.
Constraints: 16 GB RAM development machine, local-first single-user Windows app,
no SSR/SEO need, TypeScript types plus runtime validation at boundaries
(NES-CLINE-006), GSAP + lazy Three.js motion requirements (FR-013/FR-014).

## Options considered

- **Option A — Vite + React + TypeScript + Tailwind + shadcn/ui primitives.**
  Benefits: fastest HMR, lightest dev-server memory footprint of the shortlist,
  no framework server runtime to operate, large ecosystem for GSAP/R3F, plain
  static output servable from localhost. Costs/risks: no built-in routing or API
  routes (routing via React Router; API arrives later as FastAPI) — both
  manageable and already planned.
- **Option B — Next.js + TypeScript + Tailwind + shadcn/ui (doc 04 suggestion).**
  Benefits: file routing, SSR/SSG, API routes for a future BFF. Costs/risks:
  heavier dev runtime (~0.7–1 GB+), framework server redundant beside the
  planned FastAPI backend, SSR complexity unneeded for a localhost personal app.
- **Option C — Create React App / plain webpack.** Rejected: CRA is
  unmaintained; hand-rolled webpack adds config burden with no benefit over Vite.

## Decision

Adopt **Option A: Vite + React + TypeScript + Tailwind + shadcn/ui primitives**
(copy-in, not a heavy component dependency), Inter typography per NES-UX-002,
GSAP + ScrollTrigger for complex timelines, CSS for simple interactions,
Three.js + React Three Fiber lazy-loaded per route with a static fallback.

## Consequences

- Positive: minimal dev RAM, fast feedback loop, clean separation from the later
  FastAPI backend, docs-compliant motion/3D posture.
- Trade-offs: routing and data-fetching conventions must be chosen at scaffold
  time (React Router + typed fetch wrappers proposed); no SSR if ever wanted.
- Security/privacy: static frontend has no server secret surface; provider
  secrets stay backend-only per NES-SEC-010.
- No performance benchmarks have been run; memory figures above are planning
  estimates, not measurements.

## Review trigger

Reconsider if a future phase requires SEO/SSR, a shareable hosted build, or if
measured Vite dev memory on this machine proves worse than Next.js in practice.
