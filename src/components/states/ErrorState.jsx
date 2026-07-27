import { AlertTriangle } from "lucide-react";

import { Button } from "@/components/ui/Button";
import { EmptyState } from "./EmptyState";

/**
 * Recoverable error surface. Always offers an action — never a dead end.
 * @param {{title?: string, description?: string, onRetry?: () => void}} props
 */
export function ErrorState({
  title = "Something didn't load",
  description = "Your notes are safe on this device. Try again.",
  onRetry,
}) {
  return (
    <div role="alert">
      <EmptyState
        icon={AlertTriangle}
        title={title}
        description={description}
        action={onRetry ? <Button onClick={onRetry}>Try again</Button> : null}
      />
    </div>
  );
}