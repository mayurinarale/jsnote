import { Skeleton } from "@/components/ui/Skeleton";

/**
 * Skeleton list used while IndexedDB hydrates. Mirrors the note list geometry
 * so nothing shifts when real content arrives.
 * @param {{rows?: number, label?: string}} props
 */
export function LoadingState({ rows = 5, label = "Loading notes" }) {
  return (
    <div aria-busy="true" aria-label={label} className="flex flex-col gap-1 p-2">
      {Array.from({ length: rows }).map((_, index) => (
        <div key={index} className="rounded-lg px-3 py-3">
          <Skeleton className="h-4 w-2/3" />
          <Skeleton className="mt-2 h-3 w-full" />
        </div>
      ))}
    </div>
  );
}