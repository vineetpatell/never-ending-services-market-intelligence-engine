import { useMemo, useState } from "react";
import {
  Badge,
  Button,
  Card,
  EmptyState,
  MetricCard,
  PageHeader,
} from "../components/ui";
import { demoQuotes, formatINR, type DemoQuote } from "../data/demo";
import { dayMoveValue } from "../domain/calculations";

export function QuoteRow({ q }: { q: DemoQuote }) {
  const move = dayMoveValue(q);
  return (
    <li className="flex items-center justify-between gap-2 py-2">
      <span className="text-sm font-medium">
        {q.symbol}{" "}
        <span className="text-xs text-[var(--color-nes-ink-2)] nes-dark:text-[var(--color-nes-d-ink-2)]">
          {q.exchange} · DEMO
        </span>
      </span>
      <span className="tnum text-right text-sm font-semibold">
        {formatINR(q.price)}
        <span className="block text-xs font-normal text-[var(--color-nes-ink-2)] nes-dark:text-[var(--color-nes-d-ink-2)]">
          {move >= 0 ? "+" : ""}{formatINR(move)} (illus.)
        </span>
      </span>
    </li>
  );
}

export function TradingOverviewPage() {
  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title="Trading — Market overview"
        description={
          <>Session placeholders and demo index summaries. <Badge>DEMO</Badge></>
        }
      />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <MetricCard label="Session status (demo)" value="CLOSED" sub="Illustrative label · not a market feed" badge={<Badge>DEMO</Badge>} />
        <MetricCard label="Index summary (demo)" value="DEMO 50 · 24,100" sub="Synthetic level · not tradable" badge={<Badge>DEMO</Badge>} />
        <MetricCard label="Data freshness" value="STALE" sub="Last demo refresh: fixture load · DEMO_DATA" badge={<Badge tone="muted">DEMO</Badge>} />
      </div>
      <Card>
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-base font-semibold">Movers (illustrative)</h2>
          <Badge>DEMO_DATA</Badge>
        </div>
        <ul className="divide-y divide-[var(--color-nes-line)] nes-dark:divide-[var(--color-nes-d-line)]">
          {demoQuotes.map((q) => (
            <QuoteRow key={q.symbol} q={q} />
          ))}
        </ul>
      </Card>
    </div>
  );
}

export function ScreenerPage() {
  const [query, setQuery] = useState("");
  const [exchange, setExchange] = useState<"ALL" | "NSE" | "BSE">("ALL");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    const filtered = demoQuotes.filter(
      (d) =>
        (exchange === "ALL" || d.exchange === exchange) &&
        (q === "" || d.symbol.toLowerCase().includes(q)),
    );
    return [...filtered].sort((a, b) =>
      sortDir === "asc" ? a.price - b.price : b.price - a.price,
    );
  }, [query, exchange, sortDir]);

  const clear = () => {
    setQuery("");
    setExchange("ALL");
    setSortDir("asc");
  };

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title="Trading — Screener"
        description={<>Search, filter, and sort demo results. <Badge>DEMO</Badge></>}
      />
      <Card>
        <form
          className="flex flex-wrap items-end gap-3"
          onSubmit={(e) => e.preventDefault()}
          aria-label="Demo screener filters"
        >
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-semibold">Search symbol</span>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="e.g. demo bank"
              className="h-10 rounded-xl border border-[var(--color-nes-line)] bg-transparent px-3 nes-dark:border-[var(--color-nes-d-line)]"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-semibold">Exchange</span>
            <select
              value={exchange}
              onChange={(e) => setExchange(e.target.value as "ALL" | "NSE" | "BSE")}
              className="h-10 rounded-xl border border-[var(--color-nes-line)] bg-transparent px-3 nes-dark:border-[var(--color-nes-d-line)]"
            >
              <option value="ALL">All</option>
              <option value="NSE">NSE</option>
              <option value="BSE">BSE</option>
            </select>
          </label>
          <Button variant="ghost" onClick={() => setSortDir((d) => (d === "asc" ? "desc" : "asc"))} ariaLabel="Toggle price sort direction">
            Price: {sortDir === "asc" ? "low to high" : "high to low"}
          </Button>
          <Button variant="ghost" onClick={clear}>Clear</Button>
        </form>
      </Card>
      {results.length === 0 ? (
        <EmptyState
          title="No demo matches"
          body="No synthetic symbols match these filters. Clear the search to see all demo fixtures."
          action={<Button variant="ghost" onClick={clear}>Clear filters</Button>}
        />
      ) : (
        <Card>
          <div className="mb-2 flex items-center justify-between">
            <h2 className="text-base font-semibold">{results.length} demo result{results.length === 1 ? "" : "s"}</h2>
            <Badge>DEMO_DATA</Badge>
          </div>
          <ul className="divide-y divide-[var(--color-nes-line)] nes-dark:divide-[var(--color-nes-d-line)]">
            {results.map((q) => (
              <QuoteRow key={q.symbol} q={q} />
            ))}
          </ul>
        </Card>
      )}
    </div>
  );
}
