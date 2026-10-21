import { Link } from "react-router-dom";
import { ActionCard, Badge, Button, Card, EmptyState, PageHeader } from "../components/ui";
import { demoActivity, demoBacktests, demoPolicies } from "../data/demo";

export function LibraryPage() {
  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title="Library"
        description={<>Saved research, policies, reports, and exports with source metadata. <Badge>DEMO</Badge></>}
      />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold">Saved research</h2>
            <Badge tone="muted">{demoActivity.length} DEMO</Badge>
          </div>
          <ul className="mt-2 flex flex-col gap-1 text-sm">
            {demoActivity.slice(0, 3).map((a) => (
              <li key={a.id}>{a.at} — {a.summary}</li>
            ))}
          </ul>
        </Card>
        <Card>
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold">Saved policies</h2>
            <Badge tone="muted">{demoPolicies.length} DEMO</Badge>
          </div>
          <ul className="mt-2 flex flex-col gap-1 text-sm">
            {demoPolicies.map((p) => (
              <li key={p.id}>{p.id} · {p.category} · {p.reviewStatus}</li>
            ))}
          </ul>
        </Card>
        <Card>
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold">Reports & exports</h2>
            <Badge tone="muted">{demoBacktests.length} DEMO</Badge>
          </div>
          <ul className="mt-2 flex flex-col gap-1 text-sm">
            {demoBacktests.map((b) => (
              <li key={b.id}>{b.strategyName} {b.strategyVersion} — {b.period}</li>
            ))}
          </ul>
        </Card>
      </div>
      <EmptyState
        title="Exports stay local"
        body="Report generation will write files to the local machine only. No export runs in this phase; these cards reflect the demo fixtures above."
        action={<Link to="/settings"><Button variant="ghost">Review backup settings</Button></Link>}
      />
    </div>
  );
}

export function SettingsPage() {
  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title="Settings"
        description={<>Theme, motion, data sources, local AI, backups, privacy, and diagnostics. <Badge>DEMO</Badge></>}
      />
      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <h2 className="text-base font-semibold">Appearance</h2>
          <p className="mt-1 text-sm text-[var(--color-nes-ink-2)] nes-dark:text-[var(--color-nes-d-ink-2)]">
            Use the theme button in the header to switch between the light
            dashboard and the dark trading workspace. Your choice is stored in
            this browser only (localStorage) and never leaves the machine.
          </p>
          <div className="mt-3"><Badge tone="info">THEME PERSISTED LOCALLY</Badge></div>
        </Card>
        <Card>
          <h2 className="text-base font-semibold">Motion</h2>
          <p className="mt-1 text-sm text-[var(--color-nes-ink-2)] nes-dark:text-[var(--color-nes-d-ink-2)]">
            This phase has no scripted animation by design. The Motion Lab
            placeholder previews the 12 proposed concepts, and the app honours
            your OS reduced-motion setting globally.
          </p>
          <div className="mt-3">
            <Link to="/trading/motion-lab"><Button variant="ghost">Open Motion Lab placeholder</Button></Link>
          </div>
        </Card>
        <Card>
          <h2 className="text-base font-semibold">Data sources</h2>
          <p className="mt-1 text-sm text-[var(--color-nes-ink-2)] nes-dark:text-[var(--color-nes-d-ink-2)]">
            Provider: synthetic demo fixtures. A real provider requires a
            documented evaluation and approval first.
          </p>
          <div className="mt-3"><Badge>MARKET_PROVIDER=demo</Badge></div>
        </Card>
        <Card>
          <h2 className="text-base font-semibold">Local AI</h2>
          <p className="mt-1 text-sm text-[var(--color-nes-ink-2)] nes-dark:text-[var(--color-nes-d-ink-2)]">
            Disabled until the separately approved evaluation phase. Copilot
            shows preset demo responses only.
          </p>
          <div className="mt-3"><Badge tone="muted">NO MODEL CONNECTED</Badge></div>
        </Card>
        <Card>
          <h2 className="text-base font-semibold">Backups & privacy</h2>
          <p className="mt-1 text-sm text-[var(--color-nes-ink-2)] nes-dark:text-[var(--color-nes-d-ink-2)]">
            Placeholders. Backup scope, encryption, retention, and deletion
            semantics will be implemented per doc 16 before real documents are
            stored.
          </p>
          <div className="mt-3"><Badge tone="muted">NOT IMPLEMENTED YET</Badge></div>
        </Card>
        <Card>
          <h2 className="text-base font-semibold">Diagnostics</h2>
          <p className="mt-1 text-sm text-[var(--color-nes-ink-2)] nes-dark:text-[var(--color-nes-d-ink-2)]">
            App: frontend prototype v0.1.0 · provider: DEMO_DATA · model: none ·
            storage: session-only. No errors recorded by this placeholder.
          </p>
          <div className="mt-3"><Badge tone="ok">ALL SYSTEMS DEMO-NOMINAL</Badge></div>
        </Card>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <ActionCard title="Review Copilot" body="Preset demo prompts and limitations." to="/copilot" cta="Open Copilot" />
        <ActionCard title="Browse library" body="Saved demo research and policies." to="/library" cta="Open Library" />
      </div>
    </div>
  );
}
