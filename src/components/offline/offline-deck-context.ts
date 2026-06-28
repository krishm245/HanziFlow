import { createContext, useContext } from "react";

import type { Doc, Id } from "../../../convex/_generated/dataModel";
import {
  getDownloadedDeckIds,
  getOfflineDeck,
  getOfflineDecks,
  getPendingReviewEvents,
  queuePendingReviewEvent,
  removeOfflineDeck,
  saveOfflineDeck,
  type PendingReviewResult,
} from "@/lib/offline-storage";

type OfflineSyncState = "idle" | "syncing" | "error";

type OfflineDeckContextValue = {
  downloadedDeckIds: Set<string>;
  downloadDeck: (deck: Doc<"decks">, cards: Array<Doc<"cards">>) => void;
  getDownloadedDeck: (deckId: Id<"decks">) => ReturnType<typeof getOfflineDeck>;
  getDownloadedDecks: () => ReturnType<typeof getOfflineDecks>;
  pendingCount: number;
  queueReview: (args: {
    cardId: Id<"cards">;
    deckId: Id<"decks">;
    result: PendingReviewResult;
  }) => Promise<void>;
  removeDownloadedDeck: (deckId: Id<"decks">) => void;
  syncError: string;
  syncState: OfflineSyncState;
};

const OfflineDeckContext = createContext<OfflineDeckContextValue | null>(null);

function useOfflineDecks() {
  const context = useContext(OfflineDeckContext);

  if (!context) {
    return {
      downloadedDeckIds: getDownloadedDeckIds(),
      downloadDeck: saveOfflineDeck,
      getDownloadedDeck: getOfflineDeck,
      getDownloadedDecks: getOfflineDecks,
      pendingCount: getPendingReviewEvents().length,
      queueReview: async (args: {
        cardId: Id<"cards">;
        deckId: Id<"decks">;
        result: PendingReviewResult;
      }) => {
        queuePendingReviewEvent(args);
      },
      removeDownloadedDeck: removeOfflineDeck,
      syncError: "",
      syncState: "idle" as const,
    };
  }

  return context;
}

export { OfflineDeckContext, useOfflineDecks };
export type { OfflineDeckContextValue, OfflineSyncState };
