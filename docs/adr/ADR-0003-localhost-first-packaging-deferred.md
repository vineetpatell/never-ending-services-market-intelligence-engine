# ADR-0003 — Localhost-first operation; deferred desktop packaging

- **Status:** Accepted
- **Date:** 2026-10-20
- **Decision owner:** Project owner
- **Baseline refs:** NES-SEC-010 (bind to loopback by default; document any LAN
  exposure), NES-DEV-017 (localhost runbook, no external exposure by default),
  NES-PLAN-005 (runnable builds per phase), NES-SRS-003 (NFR-006).

## Context

All baseline docs describe a personal-use Windows application bound to the
local machine, with no multi-user, LAN, or customer-facing requirement in the
initial release. The baseline specifies no installer, packaging format, or
auto-update mechanism (Phase 0 gap G2). Premature packaging would add signing,
installer, and updater work before any application exists.

## Options considered

- **Option A — Localhost-first web app now; desktop packaging deferred.**
  Benefits: zero installer/signing burden, smallest debug surface, matches every
  baseline runbook expectation (`http://127.0.0.1` origins). Costs/risks: no
  desktop icon/file-association polish until later — acceptable for a personal
  prototype.
- **Option B — Electron shell early.** Benefits: native window, easy Node
  bundling. Costs/risks: ~150–300 MB per window, second Chromium to feed on
  16 GB RAM, premature for a UI that doesn't exist yet.
- **Option C — Tauri shell early.** Benefits: lighter than Electron (system
  webview). Costs/risks: Rust toolchain + Windows WebView2 variance, still
  premature; kept as the leading *future* candidate, not a now-decision.

## Decision

Adopt **Option A**: develop and validate all Phase 1–7 milestones as a
localhost application (frontend dev server, later + local FastAPI, both
loopback-bound). Revisit desktop packaging only after M8 hardening, preferring
Tauri, via a superseding ADR with measured installer size, RAM, and update
story.

## Consequences

- Positive: fastest path to testable milestones, no signing/updater tax, LAN
  exposure questions stay closed by default.
- Trade-offs: distribution = `git pull` + local run until packaging lands;
  any future LAN/mobile access needs a new threat review per NES-SEC-010.
- Nothing packaged or bound to a port in this phase.

## Review trigger

Reconsider after M8, or earlier if single-click launch/offline distribution
becomes a hard requirement. Any network exposure beyond loopback triggers a
security review first.
