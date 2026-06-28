import { CloudOff, RefreshCw } from "lucide-react";

import { useOfflineDecks } from "@/components/offline/offline-deck-context";
import { useOnlineStatus } from "@/lib/use-online-status";

function OfflineStatusBanner() {
  const isOnline = useOnlineStatus();
  const { pendingCount, syncError, syncState } = useOfflineDecks();

  if (isOnline && pendingCount === 0 && syncState !== "syncing" && !syncError) {
    return null;
  }

  const message = !isOnline
    ? pendingCount > 0
      ? `${pendingCount} review ${pendingCount === 1 ? "answer" : "answers"} will sync when you are back online.`
      : "You are offline. Downloaded decks are available for review."
    : syncState === "syncing"
      ? "Syncing offline review answers."
      : syncError
        ? "Offline review answers could not sync yet."
        : `${pendingCount} review ${pendingCount === 1 ? "answer is" : "answers are"} waiting to sync.`;

  return (
    <div
      className="flex items-center gap-3 rounded-lg border border-[#d8e7df] bg-[#f6fbf8] px-4 py-3 text-sm text-[#49675b]"
      role="status"
    >
      {syncState === "syncing" ? (
        <RefreshCw className="size-4 animate-spin text-[#183d32]" />
      ) : (
        <CloudOff className="size-4 text-[#183d32]" />
      )}
      <span>{message}</span>
    </div>
  );
}

export { OfflineStatusBanner };
