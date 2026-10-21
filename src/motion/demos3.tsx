import { useRef, useState } from "react";
import { DemoShell } from "./DemoShell";
import { gsap, useGsapDemo, useGsapPlugins } from "./gsapSetup";

/** A05 — Backtest progress timeline (stepper + field nudge). */
const STEPS = ["Strategy", "Universe", "Period", "Costs", "Validate", "Results"];

export function DemoA05({ reduced }: { reduced: boolean }) {
  useGsapPlugins();
  const scope = useRef<HTMLDivElement>(null);
  const [current, setCurrent] = useState(0);
  const [dirtyField, setDirtyField] = useState<string | null>(null);

  useGsapDemo(
    scope,
    () => {
      const boxes = scope.current!.querySelectorAll<HTMLDivElement>(".a05-step");
      boxes.forEach((b, i) => {
        const isDone = i < current + 1;
        gsap.to(b, {
          className: isDone ? "a05-done" : "",
          duration: 0.25,
          ease: "power2.out",
          onStart: () => (b.dataset.phase = String(i)),
        });
      });
      if (dirtyField) {
        gsap.to(`#a05-${dirtyField}`, { color: "#f87171", duration: 0.3, ease: "power2.out" });
        setDirtyField(() => null);
      }
    },
    [current, dirtyField],
    reduced,
  );

  return (
    <DemoShell
      id="A05"
      title="Backtest progress timeline"
      purpose="Communicate multi-step backtest wizard progress without gating validation on motion."
      trigger="Wizard step advance (replay simulates 6 steps)."
      reduced={reduced}
      onReplay={() => setCurrent((c) => (c + 1) % STEPS.length)}
    >
      <div ref={scope} className="a05-stepper flex flex-wrap gap-2">
        {STEPS.map((s, i) => (
          <div
            key={s}
            id={`a05-${s}`}
            className={`a05-step rounded-full px-3 py-1 text-xs font-medium ${i <= current ? "a05-done" : ""}`}
          >
            {s}
            {i < current && <span aria-hidden="true">✓</span>}
          </div>
        ))}
      </div>
      <p className="mt-2 text-xs text-[var(--color-nes-ink-2)] nes-dark:text-[var(--color-nes-d-ink-2)]">
        {dirtyField ? "Validation error nudged (demo) — reduce motion still shows static highlight + text." : "Replay cycles through all six steps; errors nudge the field once."}
      </p>
    </DemoShell>
  );
}

/** A06 — Paper-order confirm pulse (300ms accent). */
export function DemoA06({ reduced }: { reduced: boolean }) {
  return (
    <DemoShell
      id="A06"
      title="Paper-order confirm pulse"
      purpose="Confirm a simulated order without implying real execution."
      trigger="Paper order confirmation (replay fires the confirm)."
      reduced={reduced}
      onReplay={() => undefined}
    >
      <div className="flex items-start gap-3 rounded-xl border border-[var(--color-nes-line)] p-4">
        <div
          className="mt-1.5 h-3 w-3 rounded-full animate-pulse"
          style={{ animationDuration: reduced ? "0ms" : "300ms" }}
          aria-hidden="true"
        ></div>
        <div className="flex-1 text-sm">
          <div className="font-semibold text-[var(--color-nes-ink)] nes-dark:text-[var(--color-nes-d-ink)]">SIMULATED CONFIRMATION (DEMO)</div>
          <div className="mt-1 text-xs">Order simulated for 1 100-share lot · {reduced ? "no pulse" : "accent pulse shown"} · no brokerage ticket.</div>
          <div className="text-xs text-[var(--color-nes-ink-2)] nes-dark:text-[var(--color-nes-d-ink-2)]">Source: POS-2041 · last updated 2026-10-20 · simulated only.</div>
        </div>
      </div>
    </DemoShell>
  );
}
