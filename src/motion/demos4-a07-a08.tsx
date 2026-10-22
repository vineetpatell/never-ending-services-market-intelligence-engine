import { useState } from "react";
import { DemoShell } from "./DemoShell";

/** A07 — Indicator status change highlight (400ms status flash). */
const FIELDS = ["Close", "SMA 20", "RSI 14", "MACD", "Volume", "Signal"];

export function DemoA07({ reduced }: { reduced: boolean }) {
  const [flash, setFlash] = useState<string | null>(null);

  return (
    <DemoShell
      id="A07"
      title="Indicator status change highlight"
      purpose="Guide indicator review with flash + text (never colour alone)."
      trigger="Indicator status change on a quote row (replay picks next)."
      reduced={reduced}
      onReplay={() => setFlash((f) => (f === "Signal" ? null : "Signal"))}
    >
      <div className="space-y-2">
        {FIELDS.map((f) => (
          <div
            key={f}
            id={`a07-${f.replace(/\s+/g, "-")}`}
            className={`a07-row flex items-center justify-between rounded-lg border px-3 py-2 text-sm ${flash === f ? (reduced ? "border-[var(--color-nes-warn)] bg-[var(--color-nes-warn)]/5" : "border-[var(--color-nes-warn)] bg-[var(--color-nes-warn)]/10") : "border-[var(--color-nes-line)]"} nes-dark:border-[var(--color-nes-d-line)]`}
          >
            <span className="font-medium text-[var(--color-nes-ink)] nes-dark:text-[var(--color-nes-d-ink)]">{f}</span>
            <span className="text-xs">{f === "Signal" ? "REVIEW" : "SUPERVISORY"}</span>
          </div>
        ))}
      </div>
      <p className="mt-2 text-xs text-[var(--color-nes-ink-2)] nes-dark:text-[var(--color-nes-d-ink-2)]">
        {flash === "Signal" ? "Review row always labelled — no colour-only." : "Replay alternates rows; reduced motion updates instantly, no flash."}
      </p>
    </DemoShell>
  );
}

/** A08 — Watchlist column sync (sticky first col + scroll shadow). */
const COLS = ["Symbol", "LTP", "Change", "SMA 20", "Signal", "Volume"];
type QuoteRow = { sym: string; ltp: string; chg: string; sma: string; sig: string; vol: string };
const ROWS: QuoteRow[] = [
  { sym: "DEMO Bank", ltp: "₹123.45", chg: "+0.80%", sma: "₹121.10", sig: "Above SMA", vol: "1.24M" },
  { sym: "DEMO Motors", ltp: "₹2,345.60", chg: "+1.20%", sma: "₹2,310.00", sig: "Above SMA", vol: "0.42M" },
  { sym: "DEMO Infra", ltp: "₹89.10", chg: "-1.10%", sma: "₹92.40", sig: "Below SMA", vol: "0.91M" },
];

export function DemoA08({ reduced }: { reduced: boolean }) {
  return (
    <DemoShell
      id="A08"
      title="Watchlist column sync"
      purpose="Keep side-by-side quote comparison readable on scroll."
      trigger="Horizontal scroll in the watchlist table (sticky header + first column)."
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
              <tr key={r.sym} className="border-b border-[var(--color-nes-line)] nes-dark:border-[var(--color-nes-d-line)]">
                <td className="px-2 py-2 font-medium text-[var(--color-nes-ink)] nes-dark:text-[var(--color-nes-d-ink)]">{r.sym}</td>
                {COLS.slice(1).map((c) => (
                  <td key={c} className="tnum px-2 py-2 text-[var(--color-nes-ink-2)] nes-dark:text-[var(--color-nes-d-ink-2)]">{r[c.toLowerCase() as keyof QuoteRow] || ""}</td>
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
