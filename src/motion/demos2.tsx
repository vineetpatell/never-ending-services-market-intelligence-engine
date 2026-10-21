import { useEffect, useRef, useState } from "react";
import { DemoShell } from "./DemoShell";
import { gsap, useGsapDemo, useGsapPlugins } from "./gsapSetup";
import { formatPct } from "./format";

/** A03 — Number count-up (rebuilt end-state each replay). */
const METRICS = [
  { label: "Watchlist value", value: 142800, fmt: (n: number) => `$${n.toLocaleString()}` },
  { label: "Active watchlist", value: 24, fmt: (n: number) => String(n) },
  { label: "Pending reviews", value: 13, fmt: (n: number) => String(n) },
  { label: "This month (demo)", value: 6.8, fmt: formatPct },
];

export function DemoA03({ reduced }: { reduced: boolean }) {
  useGsapPlugins();
  const scope = useRef<HTMLDivElement>(null);
  const [nonce, setNonce] = useState(0);

  useEffect(() => {
    if (reduced) return;
    const host = scope.current;
    if (!host) return;
    const list = host.querySelector<HTMLDivElement>(".a03-list");
    if (!list) return;
    list.replaceChildren(...METRICS.map((m) => renderMetric(m, reduced) as unknown as Node));
    const nums = host.querySelectorAll<HTMLDivElement>(".a03-num");
    let frameId = 0;
    const start = performance.now();
    const duration = 600;
    function tick(now: number) {
      const t = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      nums.forEach((el, i) => {
        const metric = METRICS[i];
        if (!metric) return;
        const val = Math.round(metric.value * eased);
        el.textContent = metric.fmt(val);
      });
      if (t < 1) frameId = requestAnimationFrame(tick);
    }
    frameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameId);
  }, [reduced, nonce]);

  return (
    <DemoShell
      id="A03"
      title="Number count-up (labelled)"
      purpose="Draw attention to portfolio totals without obscuring negative performance."
      trigger="Metric first enters viewport / replay."
      reduced={reduced}
      onReplay={() => setNonce((n) => n + 1)}
    >
      <div ref={scope} className="a03-list grid gap-3 sm:grid-cols-2"></div>
    </DemoShell>
  );
}

function renderMetric(m: (typeof METRICS)[0], reduced: boolean) {
  const v = m.fmt(m.value);
  return (
    <div key={m.label} className="a03-row rounded-lg border border-[var(--color-nes-line)] p-3">
      <div className="text-xs font-medium text-[var(--color-nes-ink-2)] nes-dark:text-[var(--color-nes-d-ink-2)]">{m.label}</div>
      <div
        aria-live="polite"
        className="a03-num text-lg font-semibold tabular-nums text-[var(--color-nes-ink)] nes-dark:text-[var(--color-nes-d-ink)]"
        data-value={String(m.value)}
      >
        {reduced ? v : "0"}
      </div>
      <div className="mt-0.5 text-xs text-[var(--color-nes-ink-2)] nes-dark:text-[var(--color-nes-d-ink-2)]">{typeof m.value === "number" && !Number.isInteger(m.value) ? m.value.toFixed(1) + "% (demo)" : "demo"}</div>
    </div>
  );
}

/** A04 — Chart draw-on (statically identical final state). */
const LABELS = ["M1", "M2", "M3", "M4", "M5", "M6", "M7", "M8", "M9", "M10"];
const VALUES = [40, 48, 42, 55, 51, 62, 58, 71, 66, 84];
const CURVE_D = "M 60 200 L 150 165 L 240 180 L 330 135 L 420 150 L 510 90 L 540 120 L 540 100";

export function DemoA04({ reduced }: { reduced: boolean }) {
  useGsapPlugins();
  const scope = useRef<HTMLDivElement>(null);
  const [nonce, setNonce] = useState(0);

  useGsapDemo(
    scope,
    () => {
      const host = scope.current!;
      const plot = host.querySelector<SVGGElement>(".a04-plot");
      const path = host.querySelector<SVGPathElement>("path.a04-curve");
      const axis = host.querySelector<SVGElement>(".a04-axis");
      if (!path) return;
      const rect = plot?.querySelector<SVGRectElement>("rect");
      const w = rect ? rect.width.baseVal.value : 580;
      path.setAttribute("stroke-dasharray", `${w} ${w}`);
      gsap.fromTo(path, { strokeDashoffset: w }, { strokeDashoffset: 0, duration: 0.7, ease: "power2.out" });
      gsap.fromTo(axis!, { opacity: 0 }, { opacity: 1, duration: 0.5, ease: "power2.out" });
    },
    [nonce],
    reduced,
  );

  return (
    <DemoShell
      id="A04"
      title="Chart draw-on"
      purpose="Reveal equity curves and price history as drawn paths."
      trigger="Analysis / backtest chart mount (replay resets the draw)."
      reduced={reduced}
      onReplay={() => setNonce((n) => n + 1)}
    >
      <div ref={scope} className="a04-chart overflow-hidden rounded-lg border border-[var(--color-nes-line)]">
        <svg preserveAspectRatio="none" className="h-full w-full" viewBox="0 0 600 240" role="img" aria-label="Demo equity curve">
          <rect className="a04-plot" x="10" y="10" width="580" height="200" fill="none" rx="2" />
          <g className="a04-axis">
            {LABELS.map((l) => (
              <text key={l} x={(parseFloat(l.slice(1)) / 10) * 600} y="234" textAnchor="middle" fontSize="8" fill="var(--color-nes-ink-2)">{l}</text>
            ))}
          </g>
          <path
            className="a04-curve"
            d={CURVE_D}
            fill="none"
            stroke="url(#a04grad)"
            strokeWidth="3"
            strokeLinecap="round"
          />
          <defs>
            <linearGradient id="a04grad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#6366f1" />
              <stop offset="100%" stopColor="#a5b4fc" />
            </linearGradient>
          </defs>
          {VALUES.map((v, i) => (
            <g key={i} className="a04-tick">
              <circle cx={60 + i * 53.33} cy={210 - (v / 100) * 180} r="4" fill="#6366f1" />
              <text x={60 + i * 53.33} y={210 - (v / 100) * 180 - 8} textAnchor="middle" fontSize="8" fill="var(--color-nes-ink-2)">{v}%</text>
            </g>
          ))}
        </svg>
      </div>
      <p className="mt-2 text-xs text-[var(--color-nes-ink-2)] nes-dark:text-[var(--color-nes-d-ink-2)]">
        Data: {VALUES.join(", ")} (demo curve). Revealed when motion allowed; static identical state when reduced.
      </p>
    </DemoShell>
  );
}
