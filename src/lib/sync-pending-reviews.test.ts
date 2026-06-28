// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { Id } from "../../convex/_generated/dataModel";
import {
  getPendingReviewEvents,
  queuePendingReviewEvent,
} from "@/lib/offline-storage";
import { syncPendingReviewEvents } from "./sync-pending-reviews";

beforeEach(() => {
  window.localStorage.clear();
});

describe("syncPendingReviewEvents", () => {
  it("replays every queued review and clears the queue", async () => {
    queuePendingReviewEvent(
      {
        cardId: "card_1" as Id<"cards">,
        deckId: "deck_1" as Id<"decks">,
        result: "known",
      },
      1_000,
    );
    queuePendingReviewEvent(
      {
        cardId: "card_2" as Id<"cards">,
        deckId: "deck_1" as Id<"decks">,
        result: "needsPractice",
      },
      2_000,
    );
    const recordReview = vi.fn(async () => {});

    const syncedCount = await syncPendingReviewEvents(recordReview);

    expect(syncedCount).toBe(2);
    expect(recordReview).toHaveBeenNthCalledWith(1, {
      cardId: "card_1",
      result: "known",
    });
    expect(recordReview).toHaveBeenNthCalledWith(2, {
      cardId: "card_2",
      result: "needsPractice",
    });
    expect(getPendingReviewEvents()).toEqual([]);
  });

  it("keeps unsynced events when replay fails", async () => {
    queuePendingReviewEvent(
      {
        cardId: "card_1" as Id<"cards">,
        deckId: "deck_1" as Id<"decks">,
        result: "known",
      },
      1_000,
    );
    const recordReview = vi.fn(async () => {
      throw new Error("Network failed");
    });

    await expect(syncPendingReviewEvents(recordReview)).rejects.toThrow(
      "Network failed",
    );
    expect(getPendingReviewEvents()).toHaveLength(1);
  });
});
