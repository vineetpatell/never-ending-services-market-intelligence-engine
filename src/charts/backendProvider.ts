import type {
  Candle,
  ChartDataQuery,
  ChartDataSet,
  Exchange,
  MarketDataProvider,
  SymbolRecord,
} from "./types";
import { API_BASE_URL } from "./apiConfig";
import { makeChartDataSet } from "./validation";

interface BackendCandle {
  exchange: string;
  symbol: string;
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  status: string;
  source: string;
  ingested_at: string | null;
}

interface BackendInstrument {
  id: number;
  exchange: string;
  symbol: string;
  name: string;
  currency: string;
}

interface CandlesResponse {
  exchange: string;
  symbol: string;
  source: string;
  status: string;
  is_live: boolean;
  count: number;
  candles: BackendCandle[];
}

interface DataStatusResponse {
  exchange: string;
  symbol: string;
  source: string;
  status: string;
  is_live: boolean;
  count: number;
  first_ts: number | null;
  last_ts: number | null;
  last_imported_at: string | null;
}

export function createBackendProvider(): MarketDataProvider {
  async function getSymbols(): Promise<SymbolRecord[]> {
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/instruments`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = (await res.json()) as BackendInstrument[];
      return data.map((i) => ({
        symbol: i.symbol,
        exchange: i.exchange as Exchange,
        name: i.name,
        currency: "INR" as const,
      }));
    } catch (err) {
      throw new Error(
        `Backend unavailable: ${err instanceof Error ? err.message : String(err)}`,
        { cause: err },
      );
    }
  }

  async function getHistory(query: ChartDataQuery): Promise<ChartDataSet> {
    const params = new URLSearchParams();
    params.set("exchange", query.exchange);
    params.set("symbol", query.symbol);
    if (query.fromMs !== null) params.set("from", String(query.fromMs));
    if (query.toMs !== null) params.set("to", String(query.toMs));
    params.set("limit", "20000");
    const res = await fetch(`${API_BASE_URL}/api/v1/candles?${params.toString()}`);
    if (!res.ok) {
      throw new Error(`Backend candles request failed: HTTP ${res.status}`);
    }
    const data = (await res.json()) as CandlesResponse;
    const candles: Candle[] = data.candles.map((c) => ({
      time: c.time,
      open: c.open,
      high: c.high,
      low: c.low,
      close: c.close,
      volume: c.volume,
    }));
    const status =
      data.status === "DEMO" || data.status === "IMPORTED" || data.status === "DELAYED" || data.status === "LIVE"
        ? (data.status as "DEMO" | "IMPORTED" | "DELAYED" | "LIVE")
        : "IMPORTED";
    const ds = makeChartDataSet(query.symbol, query.exchange, candles, status);
    // carry source/isLive from backend
    return {
      ...ds,
      source: (data.source as "DEMO_DATA" | "IMPORTED_CSV" | "BACKEND_API") ?? "IMPORTED_CSV",
      isLive: data.is_live,
      lastUpdatedAt: Date.now(),
      note:
        status === "IMPORTED"
          ? "Imported historical data (not live)."
          : "Backend-provided data.",
    };
  }

  function getAvailableRange(_symbol: string, _exchange: Exchange): { from: number; to: number } | null {
    void _symbol;
    void _exchange;
    return null;
  }

  return {
    getSymbols,
    getHistory,
    getAvailableRange,
    isDemo: () => false,
  };
}

// Helper to fetch data-status (used by store for available range).
export async function fetchBackendDataStatus(symbol: string, exchange: Exchange): Promise<DataStatusResponse | null> {
  try {
    const params = new URLSearchParams({ exchange, symbol });
    const res = await fetch(`${API_BASE_URL}/api/v1/data-status?${params.toString()}`);
    if (!res.ok) return null;
    return (await res.json()) as DataStatusResponse;
  } catch {
    return null;
  }
}
