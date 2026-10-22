import { ActionCard, Badge, Card, MetricCard, PageHeader } from "../components/ui";
import {
  PAPER_CASH_START,
  demoActivity,
  demoBacktests,
  demoQuotes,
  formatINR,
  initialPaperOrders,
  initialWatchlist,
} from "../data/demo";
import { dayMoveValue, valuePositions } from "../domain/calculations";

const KIND_LABEL: Record<string, string> = {
  research: "Research",
  backtest: "Backtest",
  paper: "Paper trade",
  copilot: "Copilot",
};

export function HomePage() {
  const positions = initialPaperOrders.map((o) => ({
    symbol: o.symbol,
    quantity: o.quantity,
    averagePrice: o.simulatedPrice,
  }));
  const prices: Record<string, number> = Object.fromEntries(
    demoQuotes.map((q) => [q.symbol, q.price]),
  );
  const valuation = valuePositions(positions, prices);
  const portfolioValue = PAPER_CASH_START + valuation.unrealised;
  const lastBacktest = demoBacktests[0];

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title="Dashboard"
        description={
          <>
            Goal-first workspace for market research, historical backtesting,
            and paper trading. All values below are synthetic fixtures.{" "}
            <Badge>DEMO</Badge>
          </>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          label="Watchlist symbols"
          value={String(initialWatchlist.length)}
          sub="Sample symbols · DEMO_DATA"
          badge={<Badge>DEMO</Badge>}
        />
        <MetricCard
          label="Paper portfolio (demo)"
          value={formatINR(portfolioValue)}
          sub={`Cash ${formatINR(PAPER_CASH_START)} · unrealised ${formatINR(valuation.unrealised)}`}
          badge={<Badge tone="muted">SIMULATED</Badge>}
        />
        <MetricCard
          label="Last backtest (demo)"
          value={`${lastBacktest.totalReturnPct >= 0 ? "+" : ""}${lastBacktest.totalReturnPct}%`}
          sub={`${lastBacktest.strategyName} ${lastBacktest.strategyVersion} · ${lastBacktest.tradeCount} trades`}
          badge={<Badge tone="info">HISTORICAL · NOT PREDICTIVE</Badge>}
        />
        <MetricCard
          label="Market snapshot (demo)"
          value={String(demoQuotes.length)}
          sub={`${demoQuotes.filter((q) => q.exchange === "NSE").length} NSE · ${demoQuotes.filter((q) => q.exchange === "BSE").length} BSE · DEMO_DATA`}
          badge={<Badge tone="muted">NOT LIVE</Badge>}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <ActionCard
          title="Analyse a stock"
          body="Open demo research with source and limitation labels."
          to="/trading/analysis"
          cta="Open analysis"
        />
        <ActionCard
          title="Paper trade"
          body="Place a simulated order. Nothing is routed anywhere."
          to="/trading/paper"
          cta="Open paper trading"
        />
        <ActionCard
          title="Run a backtest"
          body="Replay a strategy over demo bars with stated costs."
          to="/trading/backtesting"
          cta="Open backtesting"
        />
        <ActionCard
          title="Ask Copilot"
          body="Preset demo prompts with labelled responses."
          to="/copilot"
          cta="Open Copilot"
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-base font-semibold">Market snapshot</h2>
            <Badge>DEMO_DATA · not live</Badge>
          </div>
          <ul className="divide-y divide-[var(--color-nes-line)] nes-dark:divide-[var(--color-nes-d-line)]">
            {demoQuotes.slice(0, 4).map((q) => {
              const move = dayMoveValue(q);
              return (
                <li key={q.symbol} className="flex items-center justify-between py-2">
                  <span className="text-sm font-medium">
                    {q.symbol}{" "}
                    <span className="text-xs text-[var(--color-nes-ink-2)] nes-dark:text-[var(--color-nes-d-ink-2)]">
                      {q.exchange} · demo
                    </span>
                  </span>
                  <span className="tnum text-sm font-semibold">
                    {formatINR(q.price)}{" "}
                    <span className="text-xs font-normal">({move >= 0 ? "+" : ""}{formatINR(move)} illus.)</span>
                  </span>
                </li>
              );
            })}
          </ul>
          <p className="mt-2 text-xs text-[var(--color-nes-ink-2)] nes-dark:text-[var(--color-nes-d-ink-2)]">
            Illustrative values for layout only. Source: DEMO_DATA ·
            freshness: demo · not tradable.
          </p>
        </Card>

        <Card>
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-base font-semibold">Recent activity</h2>
            <Badge tone="muted">DEMO RECORDS</Badge>
          </div>
          <ul className="flex flex-col gap-2">
            {demoActivity.map((a) => (
              <li key={a.id} className="flex items-start gap-2 text-sm">
                <Badge tone="info">{KIND_LABEL[a.kind]}</Badge>
                <span>
                  <span className="text-xs text-[var(--color-nes-ink-2)] nes-dark:text-[var(--color-nes-d-ink-2)]">
                    {a.at} —{" "}
                  </span>
                  {a.summary}
                </span>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </div>
  );
}
