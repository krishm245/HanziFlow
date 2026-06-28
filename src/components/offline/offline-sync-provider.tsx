import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { useAuth } from "@clerk/react";
import { useMutation } from "convex/react";

import { OfflineDeckContext } from "@/components/offline/offline-deck-context";
import type {
  OfflineDeckContextValue,
  OfflineSyncState,
} from "@/components/offline/offline-deck-context";
import { api } from "../../../convex/_generated/api";
import {
  clearOfflineStorage,
  getDownloadedDeckIds,
  getOfflineDeck,
  getPendingReviewEvents,
  queuePendingReviewEvent,
  removeOfflineDeck,
  removePendingReviewEvents,
  saveOfflineDeck,
  subscribeToOfflineStorage,
} from "@/lib/offline-storage";
import { useOnlineStatus } from "@/lib/use-online-status";

function readSnapshot() {
  return {
    downloadedDeckIds: getDownloadedDeckIds(),
    pendingCount: getPendingReviewEvents().length,
  };
}

function OfflineSyncProvider({ children }: { children: ReactNode }) {
  const isOnline = useOnlineStatus();
  const recordReview = useMutation(api.cards.recordReview);
  const { isLoaded, isSignedIn } = useAuth();
  const [snapshot, setSnapshot] = useState(readSnapshot);
  const [syncState, setSyncState] = useState<OfflineSyncState>("idle");
  const [syncError, setSyncError] = useState("");
  const hasHadSessionRef = useRef(false);

  useEffect(() => subscribeToOfflineStorage(() => setSnapshot(readSnapshot)), []);

  useEffect(() => {
    if (isSignedIn) {
      hasHadSessionRef.current = true;
      return;
    }

    if (isLoaded && hasHadSessionRef.current) {
      clearOfflineStorage();
      hasHadSessionRef.current = false;
    }
  }, [isLoaded, isSignedIn]);

  useEffect(() => {
    if (!isOnline || !isSignedIn || syncState === "syncing") {
      return;
    }

    const pendingEvents = getPendingReviewEvents();
    if (pendingEvents.length === 0) {
      return;
    }

    let cancelled = false;

    async function syncPendingReviews() {
      setSyncState("syncing");
      setSyncError("");

      const syncedIds: string[] = [];

      try {
        for (const event of pendingEvents) {
          if (cancelled) {
            return;
          }

          await recordReview({
            cardId: event.cardId,
            result: event.result,
          });
          syncedIds.push(event.id);
        }

        removePendingReviewEvents(syncedIds);
        setSyncState("idle");
      } catch (caught) {
        setSyncState("error");
        setSyncError(
          caught instanceof Error
            ? caught.message
            : "Could not sync offline reviews.",
        );
      }
    }

    void syncPendingReviews();

    return () => {
      cancelled = true;
    };
  }, [isOnline, isSignedIn, recordReview, snapshot.pendingCount, syncState]);

  const value = useMemo<OfflineDeckContextValue>(
    () => ({
      downloadedDeckIds: snapshot.downloadedDeckIds,
      downloadDeck: saveOfflineDeck,
      getDownloadedDeck: getOfflineDeck,
      pendingCount: snapshot.pendingCount,
      queueReview: async (args) => {
        queuePendingReviewEvent(args);
      },
      removeDownloadedDeck: removeOfflineDeck,
      syncError,
      syncState,
    }),
    [snapshot.downloadedDeckIds, snapshot.pendingCount, syncError, syncState],
  );

  return (
    <OfflineDeckContext.Provider value={value}>
      {children}
    </OfflineDeckContext.Provider>
  );
}

export { OfflineSyncProvider };
