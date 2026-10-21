import { useState } from "react";
import { DemoShell } from "./DemoShell";

/** A07 — Policy field review highlight (400ms status flash). */
const FIELDS = ["Source verified", "Extraction confidence", "Policyholder name", "Sum insured", "Coverage type", "Beneficiary"];

export function DemoA07({ reduced }: { reduced: boolean }) {
  const [flash, setFlash] = useState<string | null>(null);

  return (
    <DemoShell
      id="A07"
      title="Policy field review highlight"
      purpose="Guide extraction review with flash + text (never colour alone)."
      trigger="Field status change in vault review (replay picks next)."
      reduced={reduced}
      onReplay={() => setFlash((f) => (f === "Beneficiary" ? null : "Beneficiary"))}
    >
      <div className="space-y-2">
        {FIELDS.map((f) => (
          <div
            key={f}
            id={`a07-${f.replace(/\s+/g, "-")}`}
            className={`a07-row flex items-center justify-between rounded-lg border px-3 py-2 text-sm ${flash === f ? (reduced ? "border-[var(--color-nes-warn)] bg-[var(--color-nes-warn)]/5" : "border-[var(--color-nes-warn)] bg-[var(--color-nes-warn)]/10") : "border-[var(--color-nes-line)]"} nes-dark:border-[var(--color-nes-d-line)]`}
          >
            <span className="font-medium text-[var(--color-nes-ink)] nes-dark:text-[var(--color-nes-d-ink)]">{f}</span>
            <span className="text-xs">{f === "Beneficiary" ? "REVIEW" : "SUPERVISORY"}</span>
          </div>
        ))}
      </div>
      <p className="mt-2 text-xs text-[var(--color-nes-ink-2)] nes-dark:text-[var(--color-nes-d-ink-2)]">
        {flash === "Beneficiary" ? "Review row always labelled — no colour-only." : "Replay alternates rows; reduced motion updates instantly, no flash."}
      </p>
    </DemoShell>
  );
}

/** A08 — Comparison column sync (sticky first col + scroll shadow). */
const COLS = ["Policy", "Premium", "Coverage", "Term", "Provider", "Renewal"];
type PolicyRow = { p: string; prem: string; cov: string; term: string; prov: string; ren: string };
const ROWS: PolicyRow[] = [
  { p: "Demo Policy A", prem: "$12,450", cov: "Full", term: "12m", prov: "Nexus", ren: "2026-11-14" },
  { p: "Demo Policy B", prem: "$18,700", cov: "Premium", term: "12m", prov: "Aegis", ren: "2026-11-28" },
  { p: "Demo Policy C", prem: "$22,350", cov: "Full", term: "24m", prov: "Katalyst", ren: "2026-12-02" },
];

export function DemoA08({ reduced }: { reduced: boolean }) {
  return (
    <DemoShell
      id="A08"
      title="Comparison column sync"
      purpose="Keep side-by-side policy comparison readable on scroll."
      trigger="Horizontal scroll in Compare view (sticky header + first column)."
      reduced={reduced}
      onReplay={() => undefined}
    >
      <div className="a08-compare overflow-x-auto">
        <table className="a08-table w-full text-sm">
          <thead>
            <tr className="border-b border-[var(--color-nes-line)] nes-dark:border-[var(--color-nes-d-line)]">
              {COLS.map((c) => (
                <th key={c} className="px-2 py-2 text-left font-medium text-[var(--color-nes-ink-2)] nes-dark:text-[var(--color-nes-d-ink-2)]">{c}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {ROWS.map((r) => (
              <tr key={r.p} className="border-b border-[var(--color-nes-line)] nes-dark:border-[var(--color-nes-d-line)]">
                <td className="px-2 py-2 font-medium text-[var(--color-nes-ink)] nes-dark:text-[var(--color-nes-d-ink)]">{r.p}</td>
                {COLS.slice(1).map((c) => (
                  <td key={c} className="px-2 py-2 text-[var(--color-nes-ink-2)] nes-dark:text-[var(--color-nes-d-ink-2)]">{r[c.toLowerCase() as keyof PolicyRow] || ""}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-2 text-xs text-[var(--color-nes-ink-2)] nes-dark:text-[var(--color-nes-d-ink-2)]">
        Sticky header + first column; scroll-shadow hints at overflow edges.
      </p>
    </DemoShell>
  );
}
