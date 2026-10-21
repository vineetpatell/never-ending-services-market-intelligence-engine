import { useEffect, useRef } from "react";
import type { Candle, ChartDataSet, IndicatorId, IndicatorSeries } from "./types";

import {
  ColorType,
  CrosshairMode,
  createChart,
  LineStyle,
  BarSeries,
  CandlestickSeries,
  IChartApi,
  ISeriesApi,
  LineSeries,
  MouseEventParams,
  type Time,
} from "lightweight-charts";

type CandlestickSeriesApi = ISeriesApi<"Candlestick">;
type BarSeriesApi = ISeriesApi<"Bar">;
type LineSeriesApi = ISeriesApi<"Line">;

/**
 * Minimal, dependency-free React wrapper around TradingView
 * Lightweight Charts (v5). Keeps all R3F/three code out of the main
 * bundle and isolates the canvas library so the rest of the app touches
 * only the typed chart contracts in `types.ts`.
 *
 * Rendering model (documented):
 *  - Candle + volume share the canvas; volume lives on the right price
 *    scale so bar granularity never crowds the candlestick axis.
 *  - Technical indicator series are thin overlay lines on the main price
 *    axis. RSI/MACD remain *prices* only for compact visual reference;
 *    the authoritative numeric values (0–100 RSI, line/histogram) are
 *    surfaced in the sibling `IndicatorValues` panel so no indicator is
 *    presented on a misleading axis.
 */

interface LightweightChartProps {
  data: ChartDataSet;
  indicators: IndicatorSeries[];
  height?: number;
  className?: string;
  onCrosshair?: (hit: { time: number; price: number; candle: Candle | null }) => void;
  /** Optional overlay (loading/error) rendered inside the chart frame. */
  overlay?: React.ReactNode;
}

export function LightweightChart({
  data,
  indicators = [],
  height = 420,
  className,
  onCrosshair,
  overlay,
}: LightweightChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const candlestickRef = useRef<CandlestickSeriesApi | null>(null);
  const volumeRef = useRef<BarSeriesApi | null>(null);
  const indicatorRefs = useRef<Map<string, LineSeriesApi>>(new Map());
  const candleMapRef = useRef<Map<number, Candle>>(new Map());

  // --- Mount: create chart + base series + crosshair subscription. ---
  useEffect(() => {
    const container = containerRef.current;
    if ( !container ) return;

    const chart = createChart(container, {
      autoSize: true,
      layout: {
        background: { type: ColorType.Solid, color: "#0D1218" },
        textColor: "#9DA6B2",
        fontFamily: "Inter, system-ui, -apple-system, sans-serif",
      },
      grid: {
        vertLines: { color: "rgba(43,43,45,0.07)" },
        horzLines: { color: "rgba(43,43,45,0.07)" },
      },
      crosshair: {
        mode: CrosshairMode.Normal,
        vertLine: { color: "rgba(162,162,163,0.4)", width: 1, style: LineStyle.Dashed },
        horzLine: { color: "rgba(162,162,163,0.4)", width: 1, style: LineStyle.Dashed },
      },
      timeScale: {
        borderColor: "rgba(43,43,45,0.14)",
        timeVisible: true,
      },
      rightPriceScale: {
        visible: true,
        autoScale: false,
        scaleMargins: { top: 0, bottom: 0.18 },
        borderColor: "rgba(43,43,45,0.14)",
        borderVisible: true,
        textColor: "#9DA6B2",
      },
      localization: { locale: "en-IN", dateFormat: "dd MMM yyyy" },
    });
    chartRef.current = chart;

    const candlestick = chart.addSeries(CandlestickSeries, {
      priceFormat: { type: "price", precision: 2 },
      upColor: "#2DDDBF",
      downColor: "#FF5200",
      wickUpColor: "#2DDDBF",
      wickDownColor: "#FF5200",
      borderColor: "rgba(43,43,45,0.24)",
      lastValueVisible: false,
      title: "Candles",
    });
    candlestickRef.current = candlestick;

    const volume = chart.addSeries(BarSeries, {
      priceScaleId: "right",
      priceFormat: { type: "volume" },
      title: "Volume",
    });
    volumeRef.current = volume;

    const crosshairHandler = (param: MouseEventParams<Time>) => {
      if ( param.point === undefined || param.time === undefined ) return;
      const timeMs = param.time as number;
      const candle = candleMapRef.current.get(timeMs) ?? null;
      const price = candle?.close ?? 0;
      onCrosshair?.({ time: timeMs, price, candle });
    };
    chart.subscribeCrosshairMove(crosshairHandler);

    // Chart is created when the module-level `applyData` is not yet in
    // scope, so we rely on the `[data.candles]` effect to populate data.
    // The effect below will run immediately after mount.
    return () => {
      chart.unsubscribeCrosshairMove(crosshairHandler);
      chart.remove();
      chartRef.current = null;
      candlestickRef.current = null;
      volumeRef.current = null;
      indicatorRefs.current.clear();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // --- Update displayed data (range change / symbol change / refresh). ---
  useEffect(() => {
    applyData(chartRef.current ?? undefined, {
      candles: data.candles,
      indicators,
      candleMap: candleMapRef,
      candlestick: candlestickRef,
      volume: volumeRef,
      indicatorRefs,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data.candles, data.symbol, indicators]);

  return (
    <div
      ref={containerRef}
      className={`relative w-full overflow-hidden rounded-xl bg-[var(--color-nes-surface)] nes-dark:bg-[var(--color-nes-d-surface)] ${className ?? ""}`}
      style={{ height }}
      role="region"
      aria-label="Stock price chart"
    >
      {overlay ? <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/50 text-white">{overlay}</div> : null}
    </div>
  );
}

/**
 * Apply/layout the current dataset and indicators onto an existing
 * Lightweight Charts instance (created at mount). Safe to call on every
 * range/symbol change.
 */
/** Map a Candle to lightweight-charts candlestick data. */
const candleData = (c: Candle) => ({ time: c.time as Time, open: c.open, high: c.high, low: c.low, close: c.close });
/** Map a Candle to lightweight-charts volume (bar) data. */
const volumeData = (c: Candle) => ({ time: c.time as Time, value: c.volume });

function applyData(
  chart: IChartApi | undefined,
  {
    candles,
    indicators,
    candleMap,
    candlestick,
    volume,
    indicatorRefs,
  }: {
    candles: Candle[];
    indicators: IndicatorSeries[];
    candleMap: React.MutableRefObject<Map<number, Candle>>;
    candlestick: React.MutableRefObject<CandlestickSeriesApi | null>;
    volume: React.MutableRefObject<BarSeriesApi | null>;
    indicatorRefs: React.MutableRefObject<Map<string, LineSeriesApi>>;
  },
) {
  if ( !chart ) return;

  const candlesSafe = candles ?? [];
  candleMap.current = new Map(candlesSafe.map((c) => [c.time, c]));

  const candleSeries = candlestick.current;
  const volumeSeries = volume.current;
  if ( candleSeries ) candleSeries.setData(candlesSafe.map(candleData));
  if ( volumeSeries ) volumeSeries.setData(candlesSafe.map(volumeData));

  const enabledIds = new Set(indicators.map((s) => s.id));
  const knownIds = new Set(indicatorRefs.current.keys());

  // Remove series that are no longer enabled.
  for ( const id of [...knownIds].filter((id) => !enabledIds.has(id as IndicatorId)) ) {
    const series = indicatorRefs.current.get(id);
    if ( series ) { chart.removeSeries(series); indicatorRefs.current.delete(id); }
  }

  // Add / update enabled series.
  for ( const series of indicators ) {
    if ( knownIds.has(series.id) ) {
      const ref = indicatorRefs.current.get(series.id)!;
      ref.setData(candlesSafe.map((_, i) => series.data[i] ?? null).filter((v): v is number => v !== null).map((v, i) => ({ time: candlesSafe[i].time as Time, value: v })));
      continue;
    }
    const line = chart.addSeries(LineSeries, {
      priceFormat: { type: "price", precision: 2 },
      color: series.color,
      lineWidth: 2,
      lastValueVisible: false,
      crosshairMarkerVisible: true,
      crosshairMarkerRadius: 3,
      title: series.label,
    });
    indicatorRefs.current.set(series.id, line);
    const dataItems = candlesSafe.map((_, i) => {
      const v = series.data[i];
      return v === null ? null : { time: candlesSafe[i].time as Time, value: v };
    }).filter((item): item is { time: Time; value: number } => item !== null);
    line.setData(dataItems);
  }

  chart.timeScale().fitContent();
}

