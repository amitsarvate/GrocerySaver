import { Button } from "./ui/Button";
import { Card } from "./ui/Card";

export default function Home() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-10">
      <h1 className="text-3xl font-semibold tracking-tight text-foreground">
        GrocerySaver
      </h1>
      <p className="mt-2 text-muted">
        Find the most cost-effective grocery plan across nearby stores.
      </p>

      <Card className="mt-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="text-sm font-medium text-foreground">
              Phase 0 in progress
            </div>
            <div className="mt-1 text-sm text-muted">
              Next: location capture, then store lookup.
            </div>
          </div>
          <div className="flex gap-2">
            <Button type="button">Get started</Button>
            <Button type="button" variant="ghost">
              View health
            </Button>
          </div>
        </div>
      </Card>
    </main>
  );
}
