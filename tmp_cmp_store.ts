import { create } from "zustand";
import { FIXED_TODAY_IST } from "./demo";
import { istMidnight } from "./date";
import { createDemoProvider } from "./provider";
import { toTimeframeRange } from "./timeframes";
import type {
  Candle,
  ChartDataQuery,
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
  status: "DEMO";
  source: "DEMO_DATA";
  isLive: false;
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
    set({ loading: true, error: null });
    try {
      const ds = await createDemoProvider().getHistory(st.createChartQuery());
      set({
        candles: ds.candles,
        availableFrom: ds.availableStart,
        availableTo: ds.availableEnd,
        status: ds.status as "DEMO",
        isLive: ds.isLive as false,
        error: null,
        loading: false,
      });
    } catch {
      set({ error: "Unable to load demo chart data. Retry.", loading: false });
    }
  },
}));
