import { useEffect, useRef } from "react";
import type { MutableRefObject } from "react";
import type { Candle, ChartDataSet, IndicatorPane, IndicatorSeries } from "./types";
import { formatISODate } from "./date";

import {
  ColorType,
  CrosshairMode,
  createChart,
  LineStyle,
  BarSeries,
  CandlestickSeries,
  HistogramSeries,
  IChartApi,
  ISeriesApi,
  LineSeries,
  MouseEventParams,
  type Time,
} from "lightweight-charts";

type CandlestickSeriesApi = ISeriesApi<"Candlestick">;
type BarSeriesApi = ISeriesApi<"Bar">;
type IndicatorApi = ISeriesApi<"Line" | "Histogram", Time>;

interface LightweightChartProps {
  data: ChartDataSet;
  indicators: IndicatorSeries[];
  height?: number;
  className?: string;
  volumeVisible?: boolean;
  onCrosshair?: (hit: { time: number; price: number; candle: Candle | null }) => void;
  overlay?: React.ReactNode;
}

const toChartTime = (ms: number): Time => Math.floor(ms / 1000) as Time;

export function LightweightChart({
  data,
  indicators = [],
  height = 420,
  className,
  volumeVisible = true,
  onCrosshair,
  overlay,
}: LightweightChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const candlestickRef = useRef<CandlestickSeriesApi | null>(null);
  const volumeRef = useRef<BarSeriesApi | null>(null);
  const indicatorRefs = useRef<Map<string, IndicatorApi>>(new Map());
  const candleMapRef = useRef<Map<number, Candle>>(new Map());

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

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
        tickMarkFormatter: (time: Time) => formatISODate((time as number) * 1000),
      },
      rightPriceScale: {
        visible: true,
        autoScale: true,
        scaleMargins: { top: 0.08, bottom: 0.22 },
        borderColor: "rgba(43,43,45,0.14)",
        borderVisible: true,
        textColor: "#9DA6B2",
      },
      localization: {
        locale: "en-IN",
        timeFormatter: (time: Time) => formatISODate((time as number) * 1000),
      },
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
      priceScaleId: "volume",
      priceFormat: { type: "volume" },
      title: "Volume",
    });
    volumeRef.current = volume;
    chart.priceScale("volume", 0).applyOptions({
      scaleMargins: { top: 0.8, bottom: 0 },
      visible: false,
    });

    const crosshairHandler = (param: MouseEventParams<Time>) => {
      if (param.point === undefined || param.time === undefined) return;
      const timeMs = (param.time as number) * 1000;
      const candle = candleMapRef.current.get(timeMs) ?? null;
      const price = candle?.close ?? 0;
      onCrosshair?.({ time: timeMs, price, candle });
    };
    chart.subscribeCrosshairMove(crosshairHandler);

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

  useEffect(() => {
    applyData(chartRef.current ?? undefined, {
      candles: data.candles,
      indicators,
      volumeVisible,
      height,
      candleMap: candleMapRef,
      candlestick: candlestickRef,
      volume: volumeRef,
      indicatorRefs,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data.candles, data.symbol, indicators, volumeVisible, height]);

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

const candleData = (c: Candle) => ({ time: toChartTime(c.time), open: c.open, high: c.high, low: c.low, close: c.close });
const volumeData = (c: Candle) => ({ time: toChartTime(c.time), value: c.volume, color: c.close >= c.open ? "#2DDDBF" : "#FF5200" });

function applyData(
  chart: IChartApi | undefined,
  {
    candles,
    indicators,
    volumeVisible,
    height,
    candleMap,
    candlestick,
    volume,
    indicatorRefs,
  }: {
    candles: Candle[];
    indicators: IndicatorSeries[];
    volumeVisible: boolean;
    height: number;
    candleMap: MutableRefObject<Map<number, Candle>>;
    candlestick: MutableRefObject<CandlestickSeriesApi | null>;
    volume: MutableRefObject<BarSeriesApi | null>;
    indicatorRefs: MutableRefObject<Map<string, IndicatorApi>>;
  },
) {
  if (!chart) return;

  const candlesSafe = candles ?? [];
  candleMap.current = new Map(candlesSafe.map((c) => [c.time, c]));

  const candleSeries = candlestick.current;
  const volumeSeries = volume.current;
  if (candleSeries) candleSeries.setData(candlesSafe.map(candleData));
  if (volumeSeries) {
    if (volumeVisible) volumeSeries.setData(candlesSafe.map(volumeData));
    else volumeSeries.setData([]);
  }

  const rsiNeeded = indicators.some((s) => s.pane === "rsi");
  const macdNeeded = indicators.some((s) => s.pane === "macd");

  for (const api of indicatorRefs.current.values()) {
    chart.removeSeries(api as ISeriesApi<"Line", Time>);
  }
  indicatorRefs.current.clear();

  while (chart.panes().length > 1) {
    chart.removePane(chart.panes().length - 1);
  }

  const paneIndexFor: Record<IndicatorPane, number> = { price: 0, rsi: 0, macd: 0 };
  if (rsiNeeded) {
    chart.addPane();
    paneIndexFor.rsi = chart.panes().length - 1;
    const rsiScale = chart.priceScale("right", paneIndexFor.rsi);
    rsiScale.applyOptions({ autoScale: false, scaleMargins: { top: 0.1, bottom: 0.1 } });
    rsiScale.setAutoScale(false);
    rsiScale.setVisibleRange({ from: 0, to: 100 });
  }
  if (macdNeeded) {
    chart.addPane();
    paneIndexFor.macd = chart.panes().length - 1;
  }

  const pricePane = chart.panes()[0];
  const extraCount = (rsiNeeded ? 1 : 0) + (macdNeeded ? 1 : 0);
  if (extraCount === 0) {
    pricePane.setHeight(height);
  } else if (extraCount === 1) {
    pricePane.setHeight(Math.round(height * 0.7));
    chart.panes()[1].setHeight(Math.round(height * 0.3));
  } else {
    pricePane.setHeight(Math.round(height * 0.6));
    chart.panes()[1].setHeight(Math.round(height * 0.2));
    chart.panes()[2].setHeight(Math.round(height * 0.2));
  }

  for (const series of indicators) {
    const paneIndex = paneIndexFor[series.pane] ?? 0;
    const precision = series.precision ?? 2;
    const opts =
      series.render === "histogram"
        ? {
            color: series.color,
            priceFormat: { type: "price" as const, precision },
            base: 0,
            title: series.label,
            lastValueVisible: false,
          }
        : {
            color: series.color,
            lineWidth: 2,
            priceFormat: { type: "price" as const, precision },
            lastValueVisible: false,
            crosshairMarkerVisible: true,
            crosshairMarkerRadius: 3,
            title: series.label,
          };
    const def = series.render === "histogram" ? HistogramSeries : LineSeries;
    const api = chart.addSeries(def, opts, paneIndex);
    indicatorRefs.current.set(series.id, api as IndicatorApi);

    const items = candlesSafe
      .map((c, i) => {
        const v = series.data[i];
        if (v === null || v === undefined || !Number.isFinite(v)) return null;
        return { time: toChartTime(c.time), value: v };
      })
      .filter((x): x is { time: Time; value: number } => x !== null);
    (api as { setData: (d: { time: Time; value: number }[]) => void }).setData(items);
  }

  chart.timeScale().fitContent();
}