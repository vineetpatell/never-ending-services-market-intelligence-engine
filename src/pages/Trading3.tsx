import { Link } from "react-router-dom";
import { Badge, Button, Card, EmptyState, MetricCard, PageHeader } from "../components/ui";
import { demoBacktests } from "../data/demo";
import { maxDrawdown } from "../domain/calculations";

export function StrategiesPage() {
  return (
    <div className="flex flex-col gap-5">
      <PageHeader title="Trading — Strategies" description={<>Versioned strategy placeholders. <Badge>DEMO</Badge></>} />
      <Card>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-base font-semibold">SMA cross (demo) · v1</h2>
          <Badge tone="info">VERSIONED</Badge>
        </div>
        <p className="mt-1 text-sm text-[var(--color-nes-ink-2)] nes-dark:text-[var(--color-nes-d-ink-2)]">
          Rules (illustrative): buy when 20-bar SMA crosses above 50-bar SMA on
          demo daily bars; exit on reverse cross. Parameters are placeholders.
        </p>
        <div className="mt-3">
          <Link to="/trading/backtesting"><Button>Open in backtesting</Button></Link>
        </div>
      </Card>
      <EmptyState title="No more strategies yet" body="Strategy authoring arrives in a later phase. This placeholder lists the single demo strategy used by the backtest fixture." />
    </div>
  );
}

const DEMO_EQUITY = [100000, 101200, 100400, 102800, 101900, 103500, 102100, 104300, 103800, 106400];

export function BacktestingPage() {
  const bt = demoBacktests[0];
  const dd = maxDrawdown(DEMO_EQUITY);
  return (
    <div className="flex flex-col gap-5">
      <PageHeader title="Trading — Backtesting" description={<>Reproducible historical demo runs with visible assumptions. <Badge>DEMO</Badge></>} />
      <Card>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-base font-semibold">{bt.strategyName} {bt.strategyVersion} · {bt.symbol}</h2>
          <Badge tone="info">HISTORICAL · NOT PREDICTIVE</Badge>
        </div>
        <p className="mt-1 text-sm text-[var(--color-nes-ink-2)] nes-dark:text-[var(--color-nes-d-ink-2)]">Period: {bt.period}</p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <MetricCard label="Total return (demo)" value={`+${bt.totalReturnPct}%`} sub="Fees included per assumptions" badge={<Badge>DEMO</Badge>} />
          <MetricCard label="Max drawdown" value={`${bt.maxDrawdownPct}%`} sub={`Recomputed here: ${dd.toFixed(1)}% (demo curve)`} badge={<Badge>DEMO</Badge>} />
          <MetricCard label="Trades" value={String(bt.tradeCount)} sub="Opened/closed per fixture" badge={<Badge tone="muted">DEMO</Badge>} />
          <MetricCard label="Win rate (demo)" value="57%" sub="Winning = closed profit after fees" badge={<Badge tone="muted">DEMO</Badge>} />
        </div>
        <p className="mt-4 text-xs text-[var(--color-nes-ink-2)] nes-dark:text-[var(--color-nes-d-ink-2)]">
          Assumptions: {bt.assumptions}. Source: {bt.source}. Backtest results
          are simulations — not proof of future performance.
        </p>
      </Card>
    </div>
  );
}

export function MotionLabPage() {
  return (
    <div className="flex flex-col gap-5">
      <PageHeader title="Trading — Motion Lab" description={<>Structured placeholder. The 12 replayable animations arrive in the dedicated motion phase (no GSAP/Three.js in this phase). <Badge>DEMO</Badge></>} />
      <Card>
        <h2 className="text-base font-semibold">Inventory preview (proposed, not implemented)</h2>
        <ol className="mt-2 list-decimal pl-5 text-sm text-[var(--color-nes-ink-2)] nes-dark:text-[var(--color-nes-d-ink-2)]">
          {["Page transition wipe", "Card stagger entrance", "Number count-up", "Chart draw-on", "Backtest progress timeline", "Paper-order confirm pulse", "Policy field review highlight", "Comparison column sync", "Copilot answer reveal", "Theme cross-fade", "Skeleton shimmer", "3D hero orbit (optional)"].map((n) => (
            <li key={n}>{n} — see <span className="font-mono text-xs">docs/animation-inventory.md</span></li>
          ))}
        </ol>
      </Card>
      <EmptyState title="No animations yet" body="This page will host the 12 replayable GSAP/CSS demonstrations with reduced-motion fallbacks. Nothing animates here by design in Phase 2." />
    </div>
  );
}
