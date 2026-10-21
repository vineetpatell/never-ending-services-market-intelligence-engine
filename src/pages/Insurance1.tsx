import { Link } from "react-router-dom";
import { ActionCard, Badge, Card, MetricCard, PageHeader } from "../components/ui";
import { demoExtractedFields, demoPolicies, demoRenewals, formatINR } from "../data/demo";

export function InsuranceOverviewPage() {
  const unreviewed = demoPolicies.filter((p) => p.reviewStatus === "Unreviewed").length;
  const uncertain = demoRenewals.filter((r) => !r.certain).length;
  return (
    <div className="flex flex-col gap-5">
      <PageHeader title="Insurance — Overview" description={<>Policies, renewals, and missing information at a glance. <Badge>DEMO</Badge></>} />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <MetricCard label="Policies (demo)" value={String(demoPolicies.length)} sub="Term life · Health · Vehicle" badge={<Badge>DEMO</Badge>} />
        <MetricCard label="Fields unreviewed" value={String(unreviewed)} sub="Extraction is never verified until reviewed" badge={<Badge tone="muted">REVIEW REQUIRED</Badge>} />
        <MetricCard label="Uncertain renewals" value={String(uncertain)} sub="Dates marked uncertain until confirmed" badge={<Badge tone="warn">VERIFY</Badge>} />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <ActionCard title="Policy vault" body="Upload flow placeholder and stored demo policies." to="/insurance/vault" cta="Open vault" />
        <ActionCard title="Compare policies" body="Like-for-like fields with missing-data markers." to="/insurance/comparison" cta="Open comparison" />
        <ActionCard title="Renewals" body="Verified dates and reminder controls." to="/insurance/renewals" cta="Open renewals" />
      </div>
    </div>
  );
}

export function VaultPage() {
  return (
    <div className="flex flex-col gap-5">
      <PageHeader title="Insurance — Policy vault" description={<>Upload, process status, verification, search, and archive placeholders. <Badge>DEMO</Badge></>} />
      <Card>
        <h2 className="text-base font-semibold">Upload (demo placeholder)</h2>
        <p className="mt-1 text-sm text-[var(--color-nes-ink-2)] nes-dark:text-[var(--color-nes-d-ink-2)]">
          File handling is not wired in this phase. When enabled, uploads will
          show type/size validation and processing state without implying
          verified extraction.
        </p>
        <div className="mt-3">
          <Badge tone="muted">UPLOAD DISABLED IN PROTOTYPE</Badge>
        </div>
      </Card>
      <Card>
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-base font-semibold">Stored demo policies</h2>
          <Badge>DEMO_DATA</Badge>
        </div>
        <ul className="divide-y divide-[var(--color-nes-line)] nes-dark:divide-[var(--color-nes-d-line)]">
          {demoPolicies.map((p) => (
            <li key={p.id} className="flex flex-wrap items-center justify-between gap-2 py-2 text-sm">
              <span className="font-medium">{p.provider} <span className="text-xs font-normal text-[var(--color-nes-ink-2)] nes-dark:text-[var(--color-nes-d-ink-2)]">{p.category} · {p.id} · {formatINR(p.premiumAnnual)}/yr</span></span>
              <Link to="/insurance/review"><Badge tone={p.reviewStatus.startsWith("Verified") ? "ok" : "muted"}>{p.reviewStatus}</Badge></Link>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}

export function ReviewPage() {
  return (
    <div className="flex flex-col gap-5">
      <PageHeader title="Insurance — Document review" description={<>Extracted fields with provenance. Correct before verifying — OCR text is never a fact until reviewed. <Badge>DEMO</Badge></>} />
      <Card>
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-base font-semibold">Extracted fields (demo)</h2>
          <Badge>DEMO_DATA · UNVERIFIED</Badge>
        </div>
        <ul className="divide-y divide-[var(--color-nes-line)] nes-dark:divide-[var(--color-nes-d-line)]">
          {demoExtractedFields.map((f) => (
            <li key={f.id} className="py-3 text-sm">
              <span className="flex flex-wrap items-center justify-between gap-2">
                <span className="font-semibold">{f.fieldName} <span className="font-normal text-[var(--color-nes-ink-2)] nes-dark:text-[var(--color-nes-d-ink-2)]">({f.policyId})</span></span>
                <Badge tone={f.reviewStatus.startsWith("Verified") ? "ok" : f.reviewStatus.startsWith("Corrected") ? "info" : "warn"}>{f.reviewStatus}</Badge>
              </span>
              <span className="mt-1 block">Raw: <span className="font-mono text-xs">{f.rawValue}</span></span>
              <span className="block">Normalized: <span className="tnum">{f.normalizedValue}</span></span>
              <span className="block text-xs text-[var(--color-nes-ink-2)] nes-dark:text-[var(--color-nes-d-ink-2)]">Provenance: {f.provenance}</span>
            </li>
          ))}
        </ul>
        <p className="mt-3 text-xs text-[var(--color-nes-ink-2)] nes-dark:text-[var(--color-nes-d-ink-2)]">
          Interactive correction controls arrive with the insurance milestone;
          this phase demonstrates the review data model and provenance display.
        </p>
      </Card>
    </div>
  );
}
