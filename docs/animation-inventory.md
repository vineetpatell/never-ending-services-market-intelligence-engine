# Animation inventory — Motion Lab proposals (NOT implemented)

Status: **proposed design decisions** for the Phase M3 Motion Lab. Each of the
12 concepts satisfies FR-013 (replayable, reduced-motion respected) and
AT-05/AT-06 from NES-SRS-003, plus the motion rules in NES-CLINE-006 (GSAP
cleanup on unmount, lazy optional Three.js). Nothing here is built; the
inventory closes Phase 0 gap G1 by naming the 12 required animations up front.
3D is concept A12 only, with a mandatory static fallback.

Conventions per concept: purpose, trigger, expected behaviour, reduced-motion
fallback, acceptance check. Implementable with GSAP + ScrollTrigger or CSS.

## A01 — Page transition wipe

- Purpose: orient the user during primary-destination navigation (Home, Trading,
  Insurance, Copilot, Library, Settings).
- Trigger: route change.
- Expected behaviour: 220 ms ease-out content fade + 8 px rise; sidebar active
  state updates synchronously.
- Reduced-motion fallback: instant swap, no fade/rise.
- Acceptance: navigate all six destinations with reduced motion on — content
  swaps instantly, focus lands on the page heading.

## A02 — Card stagger entrance

- Purpose: progressive disclosure on dashboard/market-overview grids.
- Trigger: page or tab mount with 3+ cards.
- Expected behaviour: cards fade/slide in with 40 ms stagger, max 480 ms total.
- Reduced-motion fallback: all cards render immediately, no stagger.
- Acceptance: total entrance completes under 500 ms on the target PC; with
  reduced motion, zero transform animation frames.

## A03 — Number count-up (labelled)

- Purpose: draw attention to portfolio totals and backtest headline metrics.
- Trigger: metric first enters viewport.
- Expected behaviour: tabular-numeral count-up over 600 ms, final value exactly
  equals the data value; never used to obscure negative performance (doc 12
  presentation rules).
- Reduced-motion fallback: final value rendered immediately.
- Acceptance: final figure matches the fixture to the paisa; negatives display
  without minimising styling games.

## A04 — Chart draw-on

- Purpose: reveal equity curves and price history as drawn paths.
- Trigger: Stock Analysis / backtest results chart mount.
- Expected behaviour: stroke-dash draw over 700 ms + axis fade; data points
  never animate independently of the axis scale.
- Reduced-motion fallback: full chart rendered statically.
- Acceptance: with animations disabled the chart is data-identical to the
  animated end state.

## A05 — Backtest progress timeline

- Purpose: communicate multi-step backtest wizard progress
  (strategy, universe, period, costs, validate, results).
- Trigger: wizard step advance.
- Expected behaviour: GSAP timeline moves the stepper; completed steps check
  in; validation errors nudge the offending field once, subtly.
- Reduced-motion fallback: stepper jumps without motion; errors shown with
  static highlight + text.
- Acceptance: keyboard-only run through all six steps shows correct stepper
- Purpose: confirm a *simulated* order without implying real execution.
- Trigger: paper order confirmation.
- Expected behaviour: single 300 ms accent pulse on the confirmation card,
  which keeps the persistent simulation-only banner visible throughout.
- Reduced-motion fallback: static confirmation card, banner unchanged.
- Acceptance: banner text present before, during, and after the pulse; no
  element resembles a live brokerage ticket.

## A07 — Policy field review highlight

- Purpose: guide extraction review (unreviewed, corrected, verified).
- Trigger: field status change in the vault review UI.
- Expected behaviour: changed row flashes a subtle status tint for 400 ms,
  then settles to the steady status colour + text label (never colour-alone,
  per doc 02).
- Reduced-motion fallback: status text/colour updates instantly, no flash.
- Acceptance: every status change is understandable with colour removed
  (grayscale check).

## A08 — Comparison column sync

- Purpose: keep side-by-side policy comparison readable on scroll.
- Trigger: horizontal scroll in Compare view.
- Expected behaviour: sticky header + first column; scroll-linked shadow hints
  at overflow edges.
- Reduced-motion fallback: sticky positioning only, no shadow animation.
- Acceptance: on a 360 px viewport, all columns reachable via scroll or card
  conversion with headers still identifiable.

## A09 — Copilot answer reveal

- Purpose: present grounded Copilot answers (answer, evidence, method,
  uncertainty, next step, per doc 14) without overwhelming.
- Trigger: Copilot response arrival (demo responses until M7).
- Expected behaviour: sections expand sequentially, 120 ms apart, with the
  DEMO badge visible from the first frame.
- Reduced-motion fallback: full answer rendered at once.
- Acceptance: DEMO badge and limitation section present in both modes.

## A10 — Theme cross-fade

- Purpose: smooth light/dashboard to dark/trading workspace switch.
- Trigger: theme toggle in Settings or shell.
- Expected behaviour: 200 ms surface/text colour transition; charts re-render
  with the dark palette in the same frame budget.
- Reduced-motion fallback: instant theme swap.
- Acceptance (AT-02): contrast and chart-label legibility pass in both themes
  in both motion modes.

## A11 — Skeleton shimmer (bounded)

- Purpose: loading state for screener, quotes, and document processing.
- Trigger: async fetch/process start.
- Expected behaviour: subtle shimmer on skeleton blocks, capped at 3 cycles
  before falling back to a static skeleton + status text.
- Reduced-motion fallback: static skeleton + status text immediately.
- Acceptance: every async component shows loading, content/empty/error within
  its documented timeout in both modes.

## A12 — 3D hero orbit (OPTIONAL, isolated)

- Purpose: decorative portfolio-overview hero; the only Three.js moment.
- Trigger: Home hero mount, only if WebGL available and motion allowed.
- Expected behaviour: lazy-loaded R3F canvas, slow orbit, paused off-screen,
  disposed on unmount; static summary card always rendered underneath.
- Reduced-motion or no-WebGL fallback: static summary card only; no canvas
  mounted, no error thrown (AT-06).
- Acceptance: disabling WebGL removes zero functional workflows; GPU memory
  returns to baseline after navigating away (verified in M3, not claimed here).

  state at each step with reduced motion on.

## A06 — Paper-order confirm pulse
