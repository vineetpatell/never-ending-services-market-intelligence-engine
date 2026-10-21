import { create } from "zustand";
import { FIXED_TODAY_IST } from "./demo";
import { istMidnight } from "./date";
import { createDemoProvider } from "./provider";
import { createBackendProvider, fetchBackendDataStatus } from "./backendProvider";
import { toTimeframeRange } from "./timeframes";
import type {
  Candle,
  ChartDataQuery,
  DataStatus,
  DataSource,
  Exchange,
  IndicatorConfig,
  TimeframeId,
} from "./types";

/** Chart context object used by the explorer page and future backend/AI. */
export interface ChartState {
  symbol: string;
  exchange: Exchange;
  timeframe: "custom" | TimeframeId;
  fromMs: number | null;
  toMs: number | null;
  candles: Candle[];
  availableFrom: number;
  availableTo: number;
  status: DataStatus;
  source: DataSource;
  isLive: boolean;
  providerKind: "demo" | "backend";
  backendError: string | null;
  indicators: IndicatorConfig[];
  volumeVisible: boolean;
  loading: boolean;
  error: string | null;
}

/** Actions layered on top of `ChartState`. */
export interface ChartActions {
  setSymbol: (symbol: string, exchange: Exchange) => void;
  setTimeframe: (timeframe: "custom" | TimeframeId) => void;
  setCustomRange: (fromMs: number | null, toMs: number | null) => void;
  setIndicators: (indicators: IndicatorConfig[]) => void;
  toggleVolume: () => void;
  resetRange: () => void;
  setProviderKind: (kind: "demo" | "backend") => void;
  useDemoData: () => void;
  createChartQuery: () => ChartDataQuery;
  refresh: () => Promise<void>;
}

type ChartStore = ChartState & ChartActions;

export const useChartStore = create<ChartStore>((set, get) => ({
  symbol: "DEMO Bank",
  exchange: "NSE",
  timeframe: "1Y",
  fromMs: null,
  toMs: null,
  candles: [],
  availableFrom: istMidnight(2014, 0, 1),
  availableTo: FIXED_TODAY_IST,
  status: "DEMO",
  source: "DEMO_DATA",
  isLive: false,
  providerKind: "demo",
  backendError: null,
  indicators: [
    { id: "sma", label: "SMA 20", enabled: false, period: 20 },
    { id: "ema", label: "EMA 20", enabled: false, period: 20 },
    { id: "rsi", label: "RSI 14", enabled: false, period: 14 },
    { id: "macd", label: "MACD", enabled: false, fast: 12, slow: 26, signal: 9 },
    { id: "bb", label: "Bollinger 20", enabled: false, period: 20, k: 2 },
  ],
  volumeVisible: true,
  loading: false,
  error: null,

  setSymbol: (symbol, exchange) =>
    set({ symbol, exchange, candles: [], loading: false, error: null }),

  setTimeframe: (timeframe) =>
    set({ timeframe, fromMs: null, toMs: null }),

  setCustomRange: (fromMs, toMs) =>
    set({ timeframe: "custom", fromMs, toMs }),

  setIndicators: (indicators) => set({ indicators }),

  toggleVolume: () => set((state) => ({ volumeVisible: !state.volumeVisible })),

  resetRange: () => set({ timeframe: "1Y", fromMs: null, toMs: null }),

  setProviderKind: (providerKind) =>
    set({ providerKind, backendError: null, candles: [], loading: false, error: null }),

  useDemoData: () =>
    set({ providerKind: "demo", backendError: null, error: null }),

  createChartQuery: () => {
    const { symbol, exchange, timeframe, fromMs, toMs, availableTo } = get();
    if ( timeframe === "custom" ) {
      return { symbol, exchange, fromMs: fromMs ?? 0, toMs: toMs ?? availableTo };
    }
    const { fromMs: f } = toTimeframeRange(timeframe, availableTo);
    return { symbol, exchange, fromMs: f, toMs: availableTo };
  },

  refresh: async () => {
    const st = get();
    if ( st.loading ) return;
    set({ loading: true, error: null, backendError: null });
    try {
      if ( st.providerKind === "backend" ) {
        const provider = createBackendProvider();
        const range = await fetchBackendDataStatus(st.symbol, st.exchange);
        const query = st.createChartQuery();
        const ds = await provider.getHistory(query);
        set({
          candles: ds.candles,
          availableFrom: range?.first_ts ?? ds.availableStart,
          availableTo: range?.last_ts ?? ds.availableEnd,
          status: ds.status,
          source: ds.source,
          isLive: ds.isLive,
          error: null,
          backendError: null,
          loading: false,
        });
      } else {
        const provider = createDemoProvider();
        const range = provider.getAvailableRange(st.symbol, st.exchange);
        const query = st.createChartQuery();
        const ds = await provider.getHistory(query);
        set({
          candles: ds.candles,
          availableFrom: range ? range.from : ds.availableStart,
          availableTo: range ? range.to : ds.availableEnd,
          status: ds.status,
          source: ds.source,
          isLive: ds.isLive,
          error: null,
          loading: false,
        });
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Unable to load chart data.";
      if ( st.providerKind === "backend" ) {
        set({ backendError: msg, loading: false });
      } else {
        set({ error: "Unable to load demo chart data. Retry.", loading: false });
      }
    }
  },
}));
