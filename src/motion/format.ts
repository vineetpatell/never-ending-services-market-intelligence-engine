/** Formatted demo display helpers (tabular numerals, no precision claims). */
export function formatCurrency(n: number): string {
  return `$${n.toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
}

export function formatPct(n: number): string {
  return n.toFixed(1) + "%";
}
