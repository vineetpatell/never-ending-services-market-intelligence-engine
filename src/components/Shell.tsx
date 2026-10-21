import { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";

const NAV = [
  { to: "/", label: "Home", end: true },
  {
    to: "/trading",
    label: "Trading",
    children: [
      { to: "/trading", label: "Market overview", end: true },
      { to: "/trading/screener", label: "Screener" },
      { to: "/trading/watchlist", label: "Watchlist" },
      { to: "/trading/analysis", label: "Stock analysis" },
{ to: "/trading/chart", label: "Chart explorer" },
      { to: "/trading/strategies", label: "Strategies" },
      { to: "/trading/backtesting", label: "Backtesting" },
      { to: "/trading/paper", label: "Paper trading" },
      { to: "/trading/risk", label: "Portfolio & risk" },
      { to: "/trading/motion-lab", label: "Motion Lab" },
    ],
  },
  {
    to: "/insurance",
    label: "Insurance",
    children: [
      { to: "/insurance", label: "Overview", end: true },
      { to: "/insurance/vault", label: "Policy vault" },
      { to: "/insurance/review", label: "Document review" },
      { to: "/insurance/comparison", label: "Comparison" },
      { to: "/insurance/claims", label: "Claims checklist" },
      { to: "/insurance/renewals", label: "Renewals" },
    ],
  },
  { to: "/copilot", label: "Copilot" },
  { to: "/library", label: "Library" },
  { to: "/settings", label: "Settings" },
] as const;

const THEME_KEY = "nes-theme";

export function Shell({ children }: { children: React.ReactNode }) {
  const [dark, setDark] = useState<boolean>(() => {
    try {
      return localStorage.getItem(THEME_KEY) === "dark";
    } catch {
      return false;
    }
  });
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    document.documentElement.classList.toggle("nes-dark", dark);
    try {
      localStorage.setItem(THEME_KEY, dark ? "dark" : "light");
    } catch {
      /* private mode — theme simply won't persist */
    }
  }, [dark]);

  return (
    <div className="min-h-screen bg-[var(--color-nes-bg)] text-[var(--color-nes-ink)] nes-dark:bg-[var(--color-nes-d-bg)] nes-dark:text-[var(--color-nes-d-ink)]">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-[var(--color-nes-surface)] focus:px-4 focus:py-2 focus:text-sm focus:font-semibold"
      >
        Skip to content
      </a>

      <div className="mx-auto flex min-h-screen max-w-7xl">
        {/* Sidebar */}
        <aside
          className={`${
            menuOpen ? "fixed inset-y-0 left-0 z-40 flex" : "hidden"
          } w-64 shrink-0 flex-col border-r border-[var(--color-nes-line)] bg-[var(--color-nes-surface)] p-4 nes-dark:border-[var(--color-nes-d-line)] nes-dark:bg-[var(--color-nes-d-surface)] md:static md:flex`}
          aria-label="Primary"
        >
          <div className="mb-6 flex items-center gap-2 px-2">
            <span
              aria-hidden="true"
              className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--color-nes-primary)] text-lg font-bold text-white"
            >
              N
            </span>
            <div className="leading-tight">
              <p className="text-sm font-bold">NES Intelligence</p>
              <p className="text-xs text-[var(--color-nes-ink-2)]">
                Personal workspace
              </p>
            </div>
          </div>
          <nav className="flex flex-col gap-1" aria-label="Primary navigation">
            {NAV.map((item) => (
              <div key={item.to}>
                <NavLink
                  to={item.to}
                  end={"end" in item && item.end}
                  onClick={() => setMenuOpen(false)}
                  className={({ isActive }) =>
                    `block rounded-xl px-3 py-2 text-sm font-medium transition ${
                      isActive
                        ? "bg-[var(--color-nes-primary)]/10 text-[var(--color-nes-primary)] nes-dark:bg-[var(--color-nes-d-primary)]/15 nes-dark:text-[var(--color-nes-d-primary)]"
                        : "text-[var(--color-nes-ink-2)] hover:bg-black/5 nes-dark:text-[var(--color-nes-d-ink-2)] nes-dark:hover:bg-white/5"
                    }`
                  }
                >
                  {item.label}
                </NavLink>
                {"children" in item && (
                  <ul className="ml-3 mt-1 flex flex-col gap-0.5 border-l border-[var(--color-nes-line)] pl-3 nes-dark:border-[var(--color-nes-d-line)]" aria-label={`${item.label} subpages`}>
                    {item.children.map((child) => (
                      <li key={child.to}>
                        <NavLink
                          to={child.to}
                          end={"end" in child && child.end}
                          onClick={() => setMenuOpen(false)}
                          className={({ isActive }) =>
                            `block rounded-lg px-2 py-1 text-[13px] transition ${
                              isActive
                                ? "font-semibold text-[var(--color-nes-primary)] nes-dark:text-[var(--color-nes-d-primary)]"
                                : "text-[var(--color-nes-ink-2)] hover:bg-black/5 nes-dark:text-[var(--color-nes-d-ink-2)] nes-dark:hover:bg-white/5"
                            }`
                          }
                        >
                          {child.label}
                        </NavLink>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </nav>
          <p className="mt-auto px-2 pt-6 text-xs text-[var(--color-nes-ink-2)]">
            Local-first · Demo data only
          </p>
        </aside>

        {menuOpen && (
          <button
            aria-label="Close navigation"
            className="fixed inset-0 z-30 bg-black/30 md:hidden"
            onClick={() => setMenuOpen(false)}
          />
        )}

        {/* Main column */}
        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-20 border-b border-[var(--color-nes-line)] bg-[var(--color-nes-surface)]/95 backdrop-blur nes-dark:border-[var(--color-nes-d-line)] nes-dark:bg-[var(--color-nes-d-surface)]/95">
            <div className="flex h-16 items-center gap-3 px-4 md:px-6">
              <button
                className="rounded-lg border border-[var(--color-nes-line)] px-3 py-2 text-sm font-semibold nes-dark:border-[var(--color-nes-d-line)] md:hidden"
                onClick={() => setMenuOpen((v) => !v)}
                aria-expanded={menuOpen}
                aria-controls="primary-nav"
              >
                Menu
              </button>
              <span
                role="status"
                aria-label="Data status: demo data only"
                className="inline-flex items-center gap-1.5 rounded-full border border-[var(--color-nes-accent)]/40 bg-[var(--color-nes-accent)]/15 px-3 py-1 text-xs font-bold tracking-wide text-[var(--color-nes-accent)]"
              >
                <span aria-hidden="true" className="h-2 w-2 rounded-full bg-current" />
                DEMO
              </span>
              <span className="hidden text-xs text-[var(--color-nes-ink-2)] sm:inline">
                Synthetic fixtures · nothing is live
              </span>
              <div className="ml-auto flex items-center gap-2">
                <button
                  onClick={() => setDark((v) => !v)}
                  aria-pressed={dark}
                  aria-label={dark ? "Switch to light dashboard theme" : "Switch to dark trading theme"}
                  className="h-10 rounded-xl border border-[var(--color-nes-line)] px-3 text-sm font-semibold nes-dark:border-[var(--color-nes-d-line)]"
                >
                  {dark ? "Light" : "Dark trading"}
                </button>
              </div>
            </div>
          </header>

          <main id="main" className="flex-1 px-4 py-6 md:px-6" tabIndex={-1}>
            {children}
          </main>

          <footer className="border-t border-[var(--color-nes-line)] px-4 py-4 text-xs text-[var(--color-nes-ink-2)] nes-dark:border-[var(--color-nes-d-line)] nes-dark:text-[var(--color-nes-d-ink-2)] md:px-6">
            NES personal prototype · paper trading only · no live orders · no
            insurance purchases · demo content is illustrative, not advice.
          </footer>
        </div>
      </div>
    </div>
  );
}
