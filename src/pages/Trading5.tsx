import { Badge, Card, MetricCard, PageHeader } from "../components/ui";
import { demoQuotes, formatINR, initialPaperOrders } from "../data/demo";
import { valuePositions } from "../domain/calculations";

export function RiskPage() {
  const positions = initialPaperOrders.map((o) => ({ symbol: o.symbol, quantity: o.quantity, averagePrice: o.simulatedPrice }));
  const prices: Record<string, number> = Object.fromEntries(demoQuotes.map((q) => [q.symbol, q.price]));
  const valuation = valuePositions(positions, prices);
  const topValue = positions.length > 0 ? positions[0].quantity * (prices[positions[0].symbol] ?? 0) : 0;
  const concentration = valuation.marketValue > 0 ? topValue / valuation.marketValue : 0;

  return (
    <div className="flex flex-col gap-5">
      <PageHeader title="Trading — Portfolio & risk" description={<>Exposure placeholders with explained demo metrics. <Badge>DEMO</Badge></>} />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <MetricCard label="Invested (demo)" value={formatINR(valuation.invested)} badge={<Badge tone="muted">DEMO</Badge>} />
        <MetricCard label="Market value (demo)" value={formatINR(valuation.marketValue)} badge={<Badge tone="muted">DEMO</Badge>} />
        <MetricCard label="Concentration (demo)" value={`${Math.round(concentration * 100)}%`} sub="Single-symbol demo portfolio — illustrative concentration warning" badge={<Badge tone="warn">ILLUSTRATIVE</Badge>} />
      </div>
      <Card>
        <h2 className="text-base font-semibold">How these are computed</h2>
        <p className="mt-1 text-sm text-[var(--color-nes-ink-2)] nes-dark:text-[var(--color-nes-d-ink-2)]">
          Positions are marked at demo fixture prices (see <span className="font-mono text-xs">src/domain/calculations.ts</span>).
          No risk metric here limits, hedges, or prevents anything — risk limits arrive with the backtest/paper milestone.
        </p>
      </Card>
    </div>
  );
}
