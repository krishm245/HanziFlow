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
  getOfflineDecks,
  getPendingReviewEvents,
  queuePendingReviewEvent,
  removeOfflineDeck,
  saveOfflineDeck,
  subscribeToOfflineStorage,
} from "@/lib/offline-storage";
import { syncPendingReviewEvents } from "@/lib/sync-pending-reviews";
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
  const syncInFlightRef = useRef(false);

  useEffect(
    () =>
      subscribeToOfflineStorage(() => {
        const nextSnapshot = readSnapshot();
        setSnapshot(nextSnapshot);

        if (nextSnapshot.pendingCount === 0) {
          setSyncState("idle");
          setSyncError("");
        }
      }),
    [],
  );

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
    if (!isOnline || !isSignedIn || syncInFlightRef.current) {
      return;
    }

    if (getPendingReviewEvents().length === 0) {
      return;
    }

    let cancelled = false;

    async function syncPendingReviews() {
      syncInFlightRef.current = true;
      setSyncState("syncing");
      setSyncError("");

      try {
        await syncPendingReviewEvents(recordReview);
        if (!cancelled) {
          setSyncState("idle");
        }
      } catch (caught) {
        if (!cancelled) {
          setSyncState("error");
          setSyncError(
            caught instanceof Error
              ? caught.message
              : "Could not sync offline reviews.",
          );
        }
      } finally {
        syncInFlightRef.current = false;
      }
    }

    void syncPendingReviews();

    return () => {
      cancelled = true;
    };
  }, [isOnline, isSignedIn, recordReview, snapshot.pendingCount]);

  const value = useMemo<OfflineDeckContextValue>(
    () => ({
      downloadedDeckIds: snapshot.downloadedDeckIds,
      downloadDeck: saveOfflineDeck,
      getDownloadedDeck: getOfflineDeck,
      getDownloadedDecks: getOfflineDecks,
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
