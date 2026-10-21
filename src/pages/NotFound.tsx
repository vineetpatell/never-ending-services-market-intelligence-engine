import { Link } from "react-router-dom";
import { Button } from "../components/ui";

export function NotFoundPage() {
  return (
    <div className="flex flex-col gap-3">
      <h1 className="text-3xl font-bold">Page not found</h1>
      <p className="text-sm text-[var(--color-nes-ink-2)] nes-dark:text-[var(--color-nes-d-ink-2)]">
        That route does not exist. Use primary navigation — every link leads
        somewhere.
      </p>
      <div>
        <Link to="/">
          <Button>Back to Dashboard</Button>
        </Link>
      </div>
    </div>
  );
}
