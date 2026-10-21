import { useId, useState, type ReactNode } from "react";
import { Badge, Button, Card } from "../components/ui";

/**
 * DemoShell — consistent frame for each A01–A12 demonstration.
 * Every demo gets: named heading, purpose/trigger line, stage area,
 * replay control (keyboard-accessible), and reduced-motion static state.
 */
export function DemoShell({
  id,
  title,
  purpose,
  trigger,
  reduced,
  onReplay,
  replayLabel = "Replay demonstration",
  children,
}: {
  id: string;
  title: string;
  purpose: string;
  trigger: string;
  reduced: boolean;
  onReplay: () => void;
  replayLabel?: string;
  children: ReactNode;
}) {
  const headingId = useId();
  const [plays, setPlays] = useState(0);

  const replay = () => {
    setPlays((p) => p + 1);
    onReplay();
  };

  return (
    <Card>
      <div className="flex flex-wrap items-start justify-between gap-2">
        <h2 id={headingId} className="text-base font-semibold">
          {id} — {title}
        </h2>
        <span className="flex gap-1.5">
          <Badge>DEMO</Badge>
          {reduced && <Badge tone="muted">REDUCED MOTION · STATIC</Badge>}
        </span>
      </div>
      <p className="mt-1 text-sm text-[var(--color-nes-ink-2)] nes-dark:text-[var(--color-nes-d-ink-2)]">
        <span className="font-semibold text-[var(--color-nes-ink)] nes-dark:text-[var(--color-nes-d-ink)]">Purpose:</span> {purpose}{" "}
        <span className="font-semibold text-[var(--color-nes-ink)] nes-dark:text-[var(--color-nes-d-ink)]">Trigger:</span> {trigger}
      </p>
      <div aria-labelledby={headingId} className="mt-3 rounded-xl border border-[var(--color-nes-line)] p-4 nes-dark:border-[var(--color-nes-d-line)]">
        {children}
      </div>
      <div className="mt-3 flex items-center gap-3">
        <Button onClick={replay} ariaLabel={`${replayLabel}: ${title}`}>
          {replayLabel}
        </Button>
        <span className="text-xs text-[var(--color-nes-ink-2)] nes-dark:text-[var(--color-nes-d-ink-2)]" role="status">
          {reduced ? "Static end-state shown (reduced motion)." : plays === 0 ? "Plays on mount; replay anytime." : `Played ${plays + 1}× this visit.`}
        </span>
      </div>
    </Card>
  );
}
