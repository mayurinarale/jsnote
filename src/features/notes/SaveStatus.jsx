import { Check, CloudOff, Loader2 } from "lucide-react";

import { useUiStore } from "@/app/stores/useUiStore";

const STATES = {
  saved: { Icon: Check, label: "Saved on this device" },
  saving: { Icon: Loader2, label: "Saving…" },
  pending: { Icon: CloudOff, label: "Waiting to save" },
};

/**
 * Save indicator. Text always accompanies the icon — colour and glyph are
 * never the only signal.
 * @param {{status: "saved"|"saving"|"pending"}} props
 */
export function SaveStatus({ status }) {
  const online = useUiStore((state) => state.online);
  const { Icon, label } = STATES[status] ?? STATES.saved;

  return (
    <span aria-live="polite" className="inline-flex items-center gap-1.5">
      <Icon
        className={status === "saving" ? "size-3.5 animate-spin" : "size-3.5"}
        aria-hidden="true"
      />
      {online ? label : "Offline — saved locally"}
    </span>
  );
}