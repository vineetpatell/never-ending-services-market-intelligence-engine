import { useState } from "react";
import { Badge, Button, Card, MetricCard, PageHeader } from "../components/ui";
import {
  PAPER_CASH_START,
  demoQuotes,
  formatINR,
  initialPaperOrders,
  type PaperOrder,
} from "../data/demo";
import { valuePositions } from "../domain/calculations";

export function PaperPage() {
  const [orders, setOrders] = useState<PaperOrder[]>(initialPaperOrders);
  const [symbol, setSymbol] = useState(demoQuotes[0].symbol);
  const [side, setSide] = useState<"BUY" | "SELL">("BUY");
  const [qty, setQty] = useState("5");
  const [error, setError] = useState("");

  const quote = demoQuotes.find((q) => q.symbol === symbol) ?? demoQuotes[0];
  const quantity = Number.parseInt(qty, 10);

  const place = () => {
    if (!Number.isInteger(quantity) || quantity <= 0) {
      setError("Enter a whole quantity of 1 or more (demo validation).");
      return;
    }
    setError("");
    setOrders((prev) => [
      ...prev,
      {
        id: `po-${Date.now()}`,
        symbol: quote.symbol,
        side,
        quantity,
        simulatedPrice: quote.price,
        status: "Simulated (demo)",
        timestamp: "2026-10-20 (demo session)",
      },
    ]);
  };

  const positions = orders.map((o) => ({
    symbol: o.symbol,
    quantity: o.side === "BUY" ? o.quantity : -o.quantity,
    averagePrice: o.simulatedPrice,
  }));
  const prices: Record<string, number> = Object.fromEntries(
    demoQuotes.map((q) => [q.symbol, q.price]),
  );
  const valuation = valuePositions(positions, prices);

  return (
    <div className="flex flex-col gap-5">
      <PageHeader title="Trading — Paper trading" description={<>Simulated orders only. Nothing is routed to any broker. <Badge>DEMO</Badge></>} />
      <Card>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-base font-semibold">Simulation boundary</h2>
          <Badge tone="muted">SIMULATION ONLY · NO REAL ORDERS</Badge>
        </div>
        <div className="mt-3 grid gap-4 sm:grid-cols-3">
          <MetricCard label="Cash (demo)" value={formatINR(PAPER_CASH_START)} badge={<Badge tone="muted">DEMO</Badge>} />
          <MetricCard label="Unrealised (demo)" value={formatINR(valuation.unrealised)} badge={<Badge tone="muted">DEMO</Badge>} />
          <MetricCard label="Orders (demo)" value={String(orders.length)} badge={<Badge tone="muted">DEMO</Badge>} />
        </div>
      </Card>
      <Card>
        <h2 className="text-base font-semibold">Place simulated order</h2>
        <form className="mt-3 flex flex-wrap items-end gap-3" onSubmit={(e) => { e.preventDefault(); place(); }} aria-label="Simulated order form">
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-semibold">Symbol</span>
            <select value={symbol} onChange={(e) => setSymbol(e.target.value)} className="h-10 rounded-xl border border-[var(--color-nes-line)] bg-transparent px-3 nes-dark:border-[var(--color-nes-d-line)]">
              {demoQuotes.map((q) => (<option key={q.symbol} value={q.symbol}>{q.symbol}</option>))}
            </select>
          </label>
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-semibold">Side</span>
            <select value={side} onChange={(e) => setSide(e.target.value as "BUY" | "SELL")} className="h-10 rounded-xl border border-[var(--color-nes-line)] bg-transparent px-3 nes-dark:border-[var(--color-nes-d-line)]">
              <option value="BUY">BUY (simulated)</option>
              <option value="SELL">SELL (simulated)</option>
            </select>
          </label>
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-semibold">Quantity</span>
            <input value={qty} onChange={(e) => setQty(e.target.value)} inputMode="numeric" className="h-10 w-28 rounded-xl border border-[var(--color-nes-line)] bg-transparent px-3 nes-dark:border-[var(--color-nes-d-line)]" aria-describedby={error ? "qty-error" : undefined} />
          </label>
          <Button type="submit">Simulate {side}</Button>
        </form>
        {error && (<p id="qty-error" role="alert" className="mt-2 text-sm font-medium text-[var(--color-nes-down)] nes-dark:text-[var(--color-nes-d-down)]">{error}</p>)}
        <p className="mt-2 text-xs text-[var(--color-nes-ink-2)] nes-dark:text-[var(--color-nes-d-ink-2)]">Filled instantly at the demo price for illustration. This is not a market order.</p>
      </Card>
      <Card>
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-base font-semibold">Order ledger (demo)</h2>
          <Badge>DEMO_DATA</Badge>
        </div>
        <ul className="divide-y divide-[var(--color-nes-line)] nes-dark:divide-[var(--color-nes-d-line)]">
          {orders.map((o) => (
            <li key={o.id} className="flex flex-wrap items-center justify-between gap-2 py-2 text-sm">
              <span className="font-medium">{o.side} {o.quantity} × {o.symbol} <span className="tnum font-normal">@ {formatINR(o.simulatedPrice)}</span></span>
              <span className="flex items-center gap-2">
                <Badge tone="muted">{o.status}</Badge>
                <span className="text-xs text-[var(--color-nes-ink-2)] nes-dark:text-[var(--color-nes-d-ink-2)]">{o.timestamp}</span>
              </span>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
