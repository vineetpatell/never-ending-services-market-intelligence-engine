import { useRef, useState, Suspense, lazy, Component, type ReactNode } from "react";
import { DemoShell } from "./DemoShell";
import { gsap, useGsapDemo, useGsapPlugins } from "./gsapSetup";

/** A11 — Skeleton shimmer (bounded: ≤3 cycles, then static + status). */
const SKELETONS = ["Quote", "Document", "Profile"];

export function DemoA11({ reduced }: { reduced: boolean }) {
  const [phase, setPhase] = useState<"loading" | "static">("loading");
  useGsapPlugins();
  const hostRef = useRef<HTMLDivElement>(null);

  useGsapDemo(
    hostRef,
    () => {
      if (reduced) return;
      gsap.to(".a11-shimmer", {
        opacity: 0.45,
        duration: 1.2,
        repeat: 2,
        yoyo: true,
        ease: "none",
        onComplete: () => {
          setPhase("static");
        },
      });
    },
    [phase, reduced],
    phase === "static",
  );

  return (
    <DemoShell
      id="A11"
      title="Skeleton shimmer (bounded)"
      purpose="Loading state for screener, quotes and document processing."
      trigger="Async fetch/process start (replay restarts the shimmer)."
      reduced={reduced}
      onReplay={() => setPhase("loading")}
    >
      <div className="space-y-2">
        {SKELETONS.map((s) => (
          <div key={s} className="a11-row flex items-center gap-3">
            <div className="h-4 w-16 rounded bg-[var(--color-nes-line)] nes-dark:bg-[var(--color-nes-d-line)] a11-shimmer"></div>
            <div className="h-3 w-24 rounded bg-[var(--color-nes-line)] nes-dark:bg-[var(--color-nes-d-line)] a11-shimmer" style={{ width: reduced ? "4rem" : "6rem" }}></div>
          </div>
        ))}
      </div>
      <p className="mt-2 text-xs text-[var(--color-nes-ink-2)] nes-dark:text-[var(--color-nes-d-ink-2)]">
        {phase === "static"
          ? "Shimmer pulses 3×, then static skeleton + status."
          : reduced
            ? "Static skeleton + status visible immediately."
            : "Shimmer pulses 3×, then static."}
      </p>
    </DemoShell>
  );
}

/** A12 — 3D hero orbit (lazy R3F, static fallback always). */
const ThreeScene = lazy(() => import("./threeHero"));

function FallbackCard({ reduced }: { reduced?: boolean }) {
  const label = reduced
    ? "Static summary card (reduced motion)."
    : "Three.js lazy-loaded; orbit demo is then rendered.";
  return (
    <div className="a12-fallback flex aspect-video items-center justify-center rounded-lg border border-[var(--color-nes-line)] nes-dark:border-[var(--color-nes-d-line)]">
      <span className="text-sm font-medium text-[var(--color-nes-ink-2)] nes-dark:text-[var(--color-nes-d-ink-2)]">
        {label}
      </span>
    </div>
  );
}

class ThreeSceneErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean }> {
  state = { hasError: false };

  static getDerivedStateFromError(): { hasError: boolean } {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) return <FallbackCard />;
    return this.props.children;
  }
}

export function DemoA12({ reduced }: { reduced: boolean }) {
  return (
    <DemoShell
      id="A12"
      title="3D hero orbit (optional)"
      purpose="Decorative portfolio hero; lazy-loaded, never blocks core UI."
      trigger="Home hero mount, only when WebGL available and motion allowed."
      reduced={reduced}
      onReplay={() => undefined}
    >
      {reduced ? (
        <FallbackCard reduced />
      ) : (
        <ThreeSceneErrorBoundary>
          <Suspense fallback={<FallbackCard />}>
            <ThreeScene />
          </Suspense>
        </ThreeSceneErrorBoundary>
      )}
      <p className="mt-1 text-xs text-[var(--color-nes-ink-2)] nes-dark:text-[var(--color-nes-d-ink-2)]">
        {reduced
          ? "Static summary card shown (reduced motion)."
          : "Three.js is only loaded when the user enables motion; static summary card is always available."}
      </p>
    </DemoShell>
  );
}

