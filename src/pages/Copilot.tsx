import { useState } from "react";
import { Badge, Button, Card, PageHeader } from "../components/ui";
import { copilotPresets } from "../data/demo";

export function CopilotPage() {
  const [activeId, setActiveId] = useState(copilotPresets[0].id);
  const active = copilotPresets.find((p) => p.id === activeId) ?? copilotPresets[0];

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title="AI Copilot"
        description={<>Preset demonstration prompts. No model is connected in this phase. <Badge>DEMO</Badge></>}
      />
      <Card>
        <h2 className="text-base font-semibold">Preset prompts</h2>
        <div className="mt-2 flex flex-wrap gap-2" role="group" aria-label="Demo prompts">
          {copilotPresets.map((p) => (
            <Button
              key={p.id}
              variant={p.id === activeId ? "primary" : "ghost"}
              onClick={() => setActiveId(p.id)}
              ariaLabel={`Ask: ${p.prompt}`}
            >
              {p.prompt}
            </Button>
          ))}
        </div>
      </Card>
      <Card>
        <h2 className="text-base font-semibold">Answer</h2>
        <p className="mt-1 text-sm">{active.answer}</p>
        <div className="mt-3 flex flex-col gap-2 text-sm">
          <p><span className="font-semibold">Evidence:</span> demo fixtures only (<span className="font-mono text-xs">src/data/</span>).</p>
          <p><span className="font-semibold">Limitation:</span> {active.limitation}</p>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          <Badge>DEMO response</Badge>
          <Badge tone="muted">No model connected</Badge>
        </div>
      </Card>
    </div>
  );
}
