import { Link } from "react-router-dom";
import type { ReactNode } from "react";

/** Small shadcn/ui-style primitives (copy-in, no component dependency). */

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <section
      className={`rounded-2xl border border-[var(--color-nes-line)] bg-[var(--color-nes-surface)] p-5 shadow-[0_1px_2px_rgba(23,33,29,0.06)] nes-dark:border-[var(--color-nes-d-line)] nes-dark:bg-[var(--color-nes-d-surface)] nes-dark:shadow-none ${className}`}
    >
      {children}
    </section>
  );
}

export type BadgeTone = "demo" | "ok" | "muted" | "warn" | "info";

export function Badge({ children, tone = "demo" }: { children: ReactNode; tone?: BadgeTone }) {
  const tones: Record<BadgeTone, string> = {
    demo: "bg-[var(--color-nes-accent)]/15 text-[var(--color-nes-accent)] border-[var(--color-nes-accent)]/40 nes-dark:text-[var(--color-nes-d-accent)] nes-dark:border-[var(--color-nes-d-accent)]/40 nes-dark:bg-[var(--color-nes-d-accent)]/15",
    ok: "bg-[var(--color-nes-up)]/10 text-[var(--color-nes-up)] border-[var(--color-nes-up)]/30 nes-dark:text-[var(--color-nes-d-up)] nes-dark:border-[var(--color-nes-d-up)]/30 nes-dark:bg-[var(--color-nes-d-up)]/10",
    muted:
      "bg-transparent text-[var(--color-nes-ink-2)] border-[var(--color-nes-line)] nes-dark:text-[var(--color-nes-d-ink-2)] nes-dark:border-[var(--color-nes-d-line)]",
    warn: "bg-[var(--color-nes-down)]/10 text-[var(--color-nes-down)] border-[var(--color-nes-down)]/30 nes-dark:text-[var(--color-nes-d-down)] nes-dark:border-[var(--color-nes-d-down)]/30 nes-dark:bg-[var(--color-nes-d-down)]/10",
    info: "bg-[var(--color-nes-primary)]/10 text-[var(--color-nes-primary)] border-[var(--color-nes-primary)]/30 nes-dark:text-[var(--color-nes-d-primary)] nes-dark:border-[var(--color-nes-d-primary)]/30 nes-dark:bg-[var(--color-nes-d-primary)]/10",
  };
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold tracking-wide ${tones[tone]}`}
    >
      {children}
    </span>
  );
}

export function PageHeader({
  title,
  description,
  actions,
}: {
  title: string;
  description: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div>
        <h1 className="text-3xl font-bold">{title}</h1>
        <p className="mt-1 text-sm text-[var(--color-nes-ink-2)] nes-dark:text-[var(--color-nes-d-ink-2)]">
          {description}
        </p>
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}

export function MetricCard({
  label,
  value,
  sub,
  badge,
}: {
  label: string;
  value: string;
  sub?: string;
  badge?: ReactNode;
}) {
  return (
    <Card>
      <p className="text-xs font-semibold uppercase tracking-wide text-[var(--color-nes-ink-2)] nes-dark:text-[var(--color-nes-d-ink-2)]">
        {label}
      </p>
      <p className="tnum mt-1 text-2xl font-bold">{value}</p>
      {sub && (
        <p className="mt-1 text-xs text-[var(--color-nes-ink-2)] nes-dark:text-[var(--color-nes-d-ink-2)]">
          {sub}
        </p>
      )}
      {badge && <div className="mt-2">{badge}</div>}
    </Card>
  );
}

export function EmptyState({
  title,
  body,
  action,
}: {
  title: string;
  body: string;
  action?: ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-dashed border-[var(--color-nes-line)] p-6 text-center nes-dark:border-[var(--color-nes-d-line)]">
      <p className="text-sm font-semibold">{title}</p>
      <p className="mx-auto mt-1 max-w-md text-sm text-[var(--color-nes-ink-2)] nes-dark:text-[var(--color-nes-d-ink-2)]">
        {body}
      </p>
      {action && <div className="mt-3 flex justify-center">{action}</div>}
    </div>
  );
}

export function ActionCard({
  title,
  body,
  to,
  cta,
}: {
  title: string;
  body: string;
  to: string;
  cta: string;
}) {
  return (
    <Card>
      <h2 className="text-base font-semibold">{title}</h2>
      <p className="mt-1 text-sm text-[var(--color-nes-ink-2)] nes-dark:text-[var(--color-nes-d-ink-2)]">
        {body}
      </p>
      <div className="mt-3">
        <Link to={to}>
          <Button>{cta}</Button>
        </Link>
      </div>
    </Card>
  );
}

export function Button({
  children,
  onClick,
  variant = "primary",
  type = "button",
  disabled = false,
  ariaLabel,
  active = false,
}: {
  children: ReactNode;
  onClick?: () => void;
  variant?: "primary" | "ghost";
  type?: "button" | "submit";
  disabled?: boolean;
  ariaLabel?: string;
  active?: boolean;
}) {
  const styles =
    variant === "primary"
      ? "bg-[var(--color-nes-primary)] text-white hover:brightness-110 nes-dark:bg-[var(--color-nes-d-primary)] nes-dark:text-[#0d1218]"
      : "bg-transparent border border-[var(--color-nes-line)] hover:bg-black/5 nes-dark:border-[var(--color-nes-d-line)] nes-dark:hover:bg-white/5";
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      aria-pressed={active}
      title={disabled ? "Not available in this prototype phase" : undefined}
      className={`inline-flex h-10 items-center justify-center rounded-xl px-4 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${styles}`}
    >
      {children}
    </button>
  );
}
