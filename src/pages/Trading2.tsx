import { useState } from "react";
import { Badge, Button, Card, EmptyState, PageHeader } from "../components/ui";
import { demoQuotes, initialWatchlist, type WatchlistEntry } from "../data/demo";

export function WatchlistPage() {
  const [items, setItems] = useState<WatchlistEntry[]>(initialWatchlist);
  const [symbol, setSymbol] = useState("DEMO Pharma");
  const [note, setNote] = useState("");

  const add = () => {
    const s = symbol.trim();
    if (!s) return;
    const match = demoQuotes.find((q) => q.symbol.toLowerCase() === s.toLowerCase());
    setItems((prev) => [
      ...prev,
      {
        id: `wl-${Date.now()}`,
        symbol: match ? match.symbol : s,
        exchange: match ? match.exchange : "NSE",
        note: note.trim() || "Added in demo session (not persisted)",
        addedAt: "2026-10-20",
      },
    ]);
    setNote("");
  };

  const remove = (id: string) => setItems((prev) => prev.filter((i) => i.id !== id));

  const move = (id: string, dir: -1 | 1) => {
    setItems((prev) => {
      const idx = prev.findIndex((i) => i.id === id);
      const next = idx + dir;
      if (idx < 0 || next < 0 || next >= prev.length) return prev;
      const copy = [...prev];
      const [row] = copy.splice(idx, 1);
      copy.splice(next, 0, row);
      return copy;
    });
  };

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title="Trading — Watchlist"
        description={<>Add, remove, and reorder sample symbols. Session-only; nothing persists. <Badge>DEMO</Badge></>}
      />
      <Card>
        <form className="flex flex-wrap items-end gap-3" onSubmit={(e) => { e.preventDefault(); add(); }} aria-label="Add watchlist symbol">
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-semibold">Symbol</span>
            <input value={symbol} onChange={(e) => setSymbol(e.target.value)} placeholder="DEMO symbol" className="h-10 rounded-xl border border-[var(--color-nes-line)] bg-transparent px-3 nes-dark:border-[var(--color-nes-d-line)]" />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-semibold">Note (optional)</span>
            <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Why watch it?" className="h-10 rounded-xl border border-[var(--color-nes-line)] bg-transparent px-3 nes-dark:border-[var(--color-nes-d-line)]" />
          </label>
          <Button type="submit">Add symbol</Button>
        </form>
      </Card>
      {items.length === 0 ? (
        <EmptyState title="Watchlist is empty" body="Add a demo symbol above. The list resets on reload — persistence arrives with the backend phase." />
      ) : (
        <Card>
          <ul className="divide-y divide-[var(--color-nes-line)] nes-dark:divide-[var(--color-nes-d-line)]">
            {items.map((i) => (
              <li key={i.id} className="flex flex-wrap items-center gap-2 py-2">
                <span className="min-w-0 flex-1 text-sm font-medium">
                  {i.symbol}{" "}
                  <span className="text-xs text-[var(--color-nes-ink-2)] nes-dark:text-[var(--color-nes-d-ink-2)]">
                    {i.exchange} · {i.note}
                  </span>
                </span>
                <span className="flex gap-1">
                  <Button variant="ghost" onClick={() => move(i.id, -1)} ariaLabel={`Move ${i.symbol} up`}>Up</Button>
                  <Button variant="ghost" onClick={() => move(i.id, 1)} ariaLabel={`Move ${i.symbol} down`}>Down</Button>
                  <Button variant="ghost" onClick={() => remove(i.id)} ariaLabel={`Remove ${i.symbol}`}>Remove</Button>
                </span>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  );
}

export function AnalysisPage() {
  const [symbol, setSymbol] = useState(demoQuotes[0].symbol);
  const quote = demoQuotes.find((q) => q.symbol === symbol) ?? demoQuotes[0];

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title="Trading — Stock analysis"
        description={<>Overview, metrics, and limitations for a demo symbol. <Badge>DEMO</Badge></>}
      />
      <Card>
        <label className="flex max-w-sm flex-col gap-1 text-sm">
          <span className="font-semibold">Demo symbol</span>
          <select value={quote.symbol} onChange={(e) => setSymbol(e.target.value)} className="h-10 rounded-xl border border-[var(--color-nes-line)] bg-transparent px-3 nes-dark:border-[var(--color-nes-d-line)]">
            {demoQuotes.map((q) => (
              <option key={q.symbol} value={q.symbol}>{q.symbol} ({q.exchange})</option>
            ))}
          </select>
        </label>
      </Card>
      <Card>
        <h2 className="text-base font-semibold">Limitations</h2>
        <ul className="mt-2 list-disc pl-5 text-sm text-[var(--color-nes-ink-2)] nes-dark:text-[var(--color-nes-d-ink-2)]">
          <li>Values are fixtures for layout; no provider is connected.</li>
          <li>Nothing here is investment advice or a recommendation.</li>
          <li>Source: DEMO_DATA · freshness: demo · is_live: false.</li>
        </ul>
      </Card>
    </div>
  );
}
