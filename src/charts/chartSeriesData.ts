import type { Candle } from "./types";
import type { Time } from "lightweight-charts";

/** Convert millisecond timestamp to Lightweight Charts seconds time. */
export const toChartTime = (ms: number): Time => Math.floor(ms / 1000) as Time;

/** Candlestick series item shape required by Lightweight Charts. */
export interface CandlestickSeriesItem {
  time: Time;
  open: number;
  high: number;
  low: number;
  close: number;
}

/** Volume histogram series item shape required by Lightweight Charts. */
export interface VolumeSeriesItem {
  time: Time;
  value: number;
  color?: string;
}

export const candleSeriesData = (c: Candle): CandlestickSeriesItem => ({
  time: toChartTime(c.time),
  open: c.open,
  high: c.high,
  low: c.low,
  close: c.close,
});

export const volumeSeriesData = (c: Candle): VolumeSeriesItem => ({
  time: toChartTime(c.time),
  value: c.volume,
  color: c.close >= c.open ? "#2DDDBF" : "#FF5200",
});