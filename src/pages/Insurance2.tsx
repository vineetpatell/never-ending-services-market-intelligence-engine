import { useState } from "react";
import { Badge, Button, Card, EmptyState, PageHeader } from "../components/ui";
import { demoPolicies, demoRenewals, formatINR } from "../data/demo";

const COMPARE_ROWS: { label: string; get: (p: (typeof demoPolicies)[number]) => string; missing?: boolean }[] = [
  { label: "Provider", get: (p) => p.provider },
  { label: "Category", get: (p) => p.category },
  { label: "Annual premium (demo)", get: (p) => formatINR(p.premiumAnnual) },
  { label: "Renewal date", get: (p) => `${p.renewalDate}${p.renewalCertain ? "" : " (uncertain)"}` },
  { label: "Review status", get: (p) => p.reviewStatus },
  { label: "Co-pay / deductible", get: (p) => (p.id === "POL-DEMO-002" ? "10% co-pay (demo)" : "Unknown — not extracted"), missing: true },
];

export function ComparisonPage() {
  const [selected, setSelected] = useState<string[]>(["POL-DEMO-001", "POL-DEMO-002"]);

  const toggle = (id: string) => {
    setSelected((prev) => (prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id].slice(-3)));
  };

  const policies = demoPolicies.filter((p) => selected.includes(p.id));

  return (
    <div className="flex flex-col gap-5">
      <PageHeader title="Insurance — Comparison" description={<>Like-for-like fields only. Non-comparable terms are labelled, never scored. <Badge>DEMO</Badge></>} />
      <Card>
        <h2 className="text-base font-semibold">Select up to 3 demo policies</h2>
        <div className="mt-2 flex flex-wrap gap-2">
          {demoPolicies.map((p) => (
            <Button key={p.id} variant={selected.includes(p.id) ? "primary" : "ghost"} onClick={() => toggle(p.id)} ariaLabel={`Toggle ${p.id}`}>
              {p.id} {selected.includes(p.id) ? "✓" : ""}
            </Button>
          ))}
        </div>
      </Card>
      {policies.length < 2 ? (
        <EmptyState title="Select at least 2 policies" body="Comparison needs two or more policies. Use the buttons above — no suitability score is ever computed." />
      ) : (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[520px] text-sm">
              <thead>
                <tr className="border-b border-[var(--color-nes-line)] nes-dark:border-[var(--color-nes-d-line)]">
                  <th className="py-2 pr-3 text-left font-semibold">Field</th>
                  {policies.map((p) => (
                    <th key={p.id} className="px-3 py-2 text-left font-semibold">{p.id}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {COMPARE_ROWS.map((row) => (
                  <tr key={row.label} className="border-b border-[var(--color-nes-line)]/60 nes-dark:border-[var(--color-nes-d-line)]/60">
                    <th className="py-2 pr-3 text-left font-normal text-[var(--color-nes-ink-2)] nes-dark:text-[var(--color-nes-d-ink-2)]">{row.label}</th>
                    {policies.map((p) => (
                      <td key={p.id} className="tnum px-3 py-2">
                        {row.get(p)}
                        {row.missing && p.id !== "POL-DEMO-002" && <Badge tone="muted">MISSING</Badge>}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-xs text-[var(--color-nes-ink-2)] nes-dark:text-[var(--color-nes-d-ink-2)]">
            Sources: demo vault records · dates as shown. No insurer quotes,
            no suitability score, no claim predictions.
          </p>
        </Card>
      )}
    </div>
  );
}

export function ClaimsPage() {
  const steps = [
    "Locate the policy in the vault and confirm its review status.",
    "Check coverage, exclusions, waiting periods, and sub-limits in the source document.",
    "Collect bills, discharge summary, and ID proofs (insurer requirements vary).",
    "File within the stated deadline — verify with the insurer, not this demo.",
    "Track the claim reference outside this prototype.",
  ];
  return (
    <div className="flex flex-col gap-5">
      <PageHeader title="Insurance — Claims checklist" description={<>A checklist organiser. Not a guarantee of approval, not insurer process. <Badge>DEMO</Badge></>} />
      <Card>
        <ol className="list-decimal pl-5 text-sm">
          {steps.map((s) => (
            <li key={s} className="py-1">{s}</li>
          ))}
        </ol>
        <div className="mt-3"><Badge tone="warn">CHECKLIST ONLY · VERIFY WITH INSURER</Badge></div>
      </Card>
    </div>
  );
}

export function RenewalsPage() {
  return (
    <div className="flex flex-col gap-5">
      <PageHeader title="Insurance — Renewals" description={<>Verified dates and reminder controls. Uncertain dates stay marked. <Badge>DEMO</Badge></>} />
      <Card>
        <ul className="divide-y divide-[var(--color-nes-line)] nes-dark:divide-[var(--color-nes-d-line)]">
          {demoRenewals.map((r) => (
            <li key={r.id} className="flex flex-wrap items-center justify-between gap-2 py-2 text-sm">
              <span className="font-medium">{r.policyId} <span className="font-normal text-[var(--color-nes-ink-2)] nes-dark:text-[var(--color-nes-d-ink-2)]">· remind {r.reminderDate} — {r.note}</span></span>
              <Badge tone={r.certain ? "ok" : "warn"}>{r.certain ? "Date verified (demo)" : "Date uncertain"}</Badge>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
