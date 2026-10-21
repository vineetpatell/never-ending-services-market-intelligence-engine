import { useRef, useState } from "react";
import { DemoShell } from "./DemoShell";
import { gsap, useGsapDemo, useGsapPlugins } from "./gsapSetup";

/** A01 — Page transition wipe: content fade + 8px rise, 220ms. */
export function DemoA01({ reduced }: { reduced: boolean }) {
  useGsapPlugins();
  const scope = useRef<HTMLDivElement>(null);
  const [nonce, setNonce] = useState(0);

  useGsapDemo(
    scope,
    () => {
      gsap.fromTo(
        ".a01-box",
        { opacity: 0, y: 8 },
        { opacity: 1, y: 0, duration: 0.22, ease: "power2.out" },
      );
    },
    [nonce],
    reduced,
  );

  return (
    <DemoShell
      id="A01"
      title="Page transition wipe"
      purpose="Orient the user during primary-destination navigation."
      trigger="Route change (simulated here by replay)."
      reduced={reduced}
      onReplay={() => setNonce((n) => n + 1)}
    >
      <div ref={scope}>
        <div className="a01-box rounded-lg bg-[var(--color-nes-primary)]/10 p-4 text-sm font-medium">
          Destination content arrives with a 220ms ease-out fade + 8px rise.
          Sidebar state updates synchronously — never gated on this motion.
        </div>
      </div>
    </DemoShell>
  );
}

/** A02 — Card stagger entrance: 40ms stagger, 480ms budget. */
const STAGGER_CARDS = ["Watchlist", "Snapshot", "Policies", "Activity", "Copilot"];

export function DemoA02({ reduced }: { reduced: boolean }) {
  useGsapPlugins();
  const scope = useRef<HTMLDivElement>(null);
  const [nonce, setNonce] = useState(0);

  useGsapDemo(
    scope,
    () => {
      gsap.fromTo(
        ".a02-card",
        { opacity: 0, y: 12 },
        { opacity: 1, y: 0, duration: 0.28, ease: "power2.out", stagger: 0.04 },
      );
    },
    [nonce],
    reduced,
  );

  return (
    <DemoShell
      id="A02"
      title="Card stagger entrance"
      purpose="Progressive disclosure on dashboard grids."
      trigger="Page mount with 3+ cards (replay re-mounts the stagger)."
      reduced={reduced}
      onReplay={() => setNonce((n) => n + 1)}
    >
      <div ref={scope} className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {STAGGER_CARDS.map((c) => (
          <div key={c} className="a02-card rounded-lg border border-[var(--color-nes-line)] p-3 text-sm font-medium nes-dark:border-[var(--color-nes-d-line)]">
            {c} (demo)
          </div>
        ))}
      </div>
    </DemoShell>
  );
}
