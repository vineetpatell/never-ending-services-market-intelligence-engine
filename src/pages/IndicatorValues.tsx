import type { IndicatorValueRow } from "../charts/types";

/**
 * Numeric indicator-values panel. It shows the authoritative value for
 * each enabled indicator (period, latest, colour) so RSI/MACD are never
 * implied on a price axis. Rendered under the chart.
 */

export function IndicatorValues({ rows }: { rows: IndicatorValueRow[] }) {
  if ( rows.length === 0 ) {
    return (
      <div className="rounded-xl border border-[var(--color-nes-line)] bg-[var(--color-nes-surface)] p-4 nes-dark:border-[var(--color-nes-d-line)] nes-dark:bg-[var(--color-nes-d-surface)]">
        <p className="text-xs font-semibold uppercase tracking-wide text-[var(--color-nes-ink-2)] nes-dark:text-[var(--color-nes-d-ink-2)]">Indicator values</p>
        <p className="mt-1 text-sm text-[var(--color-nes-ink-2)] nes-dark:text-[var(--color-nes-d-ink-2)]">
          No indicators enabled. Enable one below to see its latest value.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-[var(--color-nes-line)] nes-dark:border-[var(--color-nes-d-line)]">
            <th className="text-left font-semibold text-[var(--color-nes-ink-2)] nes-dark:text-[var(--color-nes-d-ink-2)] py-2 pr-3">Indicator</th>
            <th className="text-left font-semibold text-[var(--color-nes-ink-2)] nes-dark:text-[var(--color-nes-d-ink-2)] py-2 pr-3">Params</th>
            <th className="text-right font-semibold text-[var(--color-nes-ink-2)] nes-dark:text-[var(--color-nes-d-ink-2)] py-2 pr-3">Latest</th>
            <th className="w-8"></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[var(--color-nes-line)] nes-dark:divide-[var(--color-nes-d-line)]">
          {rows.map((row) => (
            <tr key={row.id}>
              <td className="py-2 pr-3 font-medium text-[var(--color-nes-ink)] nes-dark:text-[var(--color-nes-d-ink)]">
                <span className="inline-flex items-center gap-2">
                  {row.label}
                  <span className="inline-flex items-center rounded-full bg-black/5 px-1.5 py-0.5 text-[10px] font-semibold text-white nes-dark:bg-white/10" style={{ backgroundColor: row.color }}>
                    {row.color}
                  </span>
                </span>
              </td>
              <td className="py-2 pr-3 text-[var(--color-nes-ink-2)] nes-dark:text-[var(--color-nes-d-ink-2)]">{row.params}</td>
              <td className="text-right tnum py-2 pr-3 font-semibold">{row.latest}</td>
              <td />
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
