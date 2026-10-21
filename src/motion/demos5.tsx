import { useState } from "react";
import { DemoShell } from "./DemoShell";

/** A09 — Copilot answer reveal (sections expand 120ms apart). */
const ANSWERS = [
  { h: "Answer", b: "Nexus Alpha does not exist on today's feed (deduced from 2026-10-20 demo data)." },
  { h: "Evidence", b: "Feed id: demo-447 · source: synthetic quotes file · timestamp 2026-10-20." },
  { h: "Method & uncertainty", b: "Rule-based demo engine (not a model). Certainty: moderate. Next: review comparison page." },
];

export function DemoA09({ reduced }: { reduced: boolean }) {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <DemoShell
      id="A09"
      title="Copilot answer reveal"
      purpose="Present grounded answers, evidence, method and uncertainty, sections sequentially."
      trigger="Copilot response arrival (demo response; replay re-renders)."
      reduced={reduced}
      onReplay={() => setOpen((o) => (o === ANSWERS.length - 1 ? null : 0))}
    >
      <div className="space-y-2">
        {ANSWERS.map((a, i) => (
          <div
            key={a.h}
            className={`a09-section rounded-lg border p-3 ${open === i ? "a09-open" : ""}`}
            style={{
              borderColor: open === i ? "var(--color-nes-primary)" : "var(--color-nes-line)",
              backgroundColor: open === i ? "var(--color-nes-primary)/5" : undefined,
            }}
          >
            <div className="font-semibold text-[var(--color-nes-ink)] nes-dark:text-[var(--color-nes-d-ink)]">{a.h}</div>
            <div className="mt-1 text-sm text-[var(--color-nes-ink-2)] nes-dark:text-[var(--color-nes-d-ink-2)]">{a.b}</div>
          </div>
        ))}
      </div>
      <p className="mt-2 text-xs text-[var(--color-nes-ink-2)] nes-dark:text-[var(--color-nes-d-ink-2)]">
        {open === ANSWERS.length - 1 ? "All sections open when reduced motion." : "Replay advances sections 120ms apart; DEMO badge present in both modes."}
      </p>
    </DemoShell>
  );
}

/** A10 — Theme cross-fade (CSS transition, no GSAP). */
export function DemoA10({ reduced }: { reduced: boolean }) {
  const [dark, setDark] = useState(false);

  return (
    <DemoShell
      id="A10"
      title="Theme cross-fade"
      purpose="Smooth light/dashboard to dark/trading switch; instant when reduced motion."
      trigger="Theme toggle in Settings / shell (replay toggles the mode)."
      reduced={reduced}
      onReplay={() => setDark((d) => !d)}
    >
      <div className="flex flex-wrap gap-3">
        <div className="a10-swatch h-16 w-32 rounded-lg border border-[var(--color-nes-line)] nes-dark:border-[var(--color-nes-d-line)]" style={{ backgroundColor: dark ? "var(--color-nes-d-bg)" : "var(--color-nes-bg)" }}></div>
        <div className="a10-swatch h-16 w-32 rounded-lg border border-[var(--color-nes-line)] nes-dark:border-[var(--color-nes-d-line)]" style={{ backgroundColor: dark ? "var(--color-nes-d-ink)" : "var(--color-nes-ink)" }}></div>
      </div>
      <p className="mt-2 text-xs text-[var(--color-nes-ink-2)] nes-dark:text-[var(--color-nes-d-ink-2)]">
        {dark ? "Dark/trading + contrast-checked." : "Light dashboard."} {reduced ? "Fades disabled." : "Cross-fade 200ms."}
      </p>
    </DemoShell>
  );
}
