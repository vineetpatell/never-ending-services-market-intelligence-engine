import { useEffect, useState } from "react";
import { PageHeader, Card, Badge, Button } from "../components/ui";
import { useSystemReducedMotion, type MotionPreference, resolveReducedMotion } from "./useReducedMotion";
import { DemoA01, DemoA02, DemoA03, DemoA04, DemoA05, DemoA06, DemoA07, DemoA08, DemoA09, DemoA10, DemoA11, DemoA12 } from "./demos";

const DEMOS: { id: string; reduced: boolean; Component: React.ComponentType<{ reduced: boolean }>; title: string }[] = [
  { id: "A01", reduced: false, Component: DemoA01, title: "Page transition wipe" },
  { id: "A02", reduced: false, Component: DemoA02, title: "Card stagger entrance" },
  { id: "A03", reduced: false, Component: DemoA03, title: "Number count-up (labelled)" },
  { id: "A04", reduced: false, Component: DemoA04, title: "Chart draw-on" },
  { id: "A05", reduced: false, Component: DemoA05, title: "Backtest progress timeline" },
  { id: "A06", reduced: false, Component: DemoA06, title: "Paper-order confirm pulse" },
  { id: "A07", reduced: false, Component: DemoA07, title: "Indicator status change highlight" },
  { id: "A08", reduced: false, Component: DemoA08, title: "Watchlist column sync" },
  { id: "A09", reduced: false, Component: DemoA09, title: "Copilot answer reveal" },
  { id: "A10", reduced: false, Component: DemoA10, title: "Theme cross-fade" },
  { id: "A11", reduced: false, Component: DemoA11, title: "Skeleton shimmer (bounded)" },
  { id: "A12", reduced: false, Component: DemoA12, title: "3D hero orbit (optional)" },
];

export function MotionLabPage() {
  const systemReduced = useSystemReducedMotion();
  const [mode, setMode] = useState<MotionPreference>("system");
  const reduced = resolveReducedMotion(mode, systemReduced);

  useEffect(() => {
    const onChange = (e: MediaQueryListEvent) => {
      // keep internal mode in sync with OS preference (mode="system" preserved)
      if (mode === "system") setMode(() => (e.matches ? "reduce" : "full"));
    };
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, [mode]);

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title="Trading — Motion Lab"
        description={
          <>
            12 replayable demonstrations · <Badge>DEMO</Badge> · all data synthetic
          </>
        }
      />

      <Card>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-base font-semibold">Motion switch (FR-014 / AT-02)</h2>
          <div className="flex gap-1.5">
            {(["system", "reduce", "full"] as MotionPreference[]).map((m) => (
              <Button
                key={m}
                active={mode === m}
                onClick={() => setMode(m)}
                ariaLabel={`Motion preference: ${m === "system" ? "system (OS)" : m === "reduce" ? "reduced" : "full"}`}
              >
                {m === "system" ? "OS default" : m === "reduce" ? "Reduced (static)" : "Full (animations)"}
              </Button>
            ))}
          </div>
        </div>
        <p className="mt-1 text-sm text-[var(--color-nes-ink-2)] nes-dark:text-[var(--color-nes-d-ink-2)]">
          {reduced
            ? "All non-essential motion disabled. Everything adapts to a static, accessible end-state."
            : "Motion is progressive and non-blocking. GSAP timelines, ScrollTriggers and 3D are lazy, cancel cleanly on unmount, and never gate a user action."}
        </p>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        {DEMOS.map(({ id, Component }) => (
          <Component key={id} reduced={reduced} />
        ))}
      </div>

      <Card className="mt-2">
        <h2 className="text-base font-semibold">All 12 — reduced motion (static)</h2>
        <p className="mt-1 text-sm text-[var(--color-nes-ink-2)] nes-dark:text-[var(--color-nes-d-ink-2)]">
          Different slide to reduce motion: every demo below shows its static, accessible end-state with no motion.
        </p>
        <div className="mt-2 grid gap-3 sm:grid-cols-2">
          {DEMOS.map(({ id, Component }) => (
            <Component key={id} reduced={true} />
          ))}
        </div>
      </Card>
    </div>
  );
}
