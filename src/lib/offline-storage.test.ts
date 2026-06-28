// @vitest-environment jsdom
import { beforeEach, describe, expect, it } from "vitest";

import type { Doc, Id } from "../../convex/_generated/dataModel";
import {
  OFFLINE_TTL_MS,
  getDownloadedDeckIds,
  getOfflineDeck,
  getOfflineDecks,
  getPendingReviewEvents,
  queuePendingReviewEvent,
  removeOfflineDeck,
  removePendingReviewEvents,
  saveOfflineDeck,
} from "./offline-storage";

function createDeck(overrides: Partial<Doc<"decks">> = {}): Doc<"decks"> {
  return {
    _creationTime: 1,
    _id: "deck_123" as Id<"decks">,
    cardCount: 1,
    createdAt: 1,
    name: "HSK 1 verbs",
    ownerId: "https://issuer.example|user_123",
    updatedAt: 1,
    ...overrides,
  };
}

function createCard(overrides: Partial<Doc<"cards">> = {}): Doc<"cards"> {
  return {
    _creationTime: 1,
    _id: "card_123" as Id<"cards">,
    createdAt: 1,
    deckId: "deck_123" as Id<"decks">,
    english: "study",
    knownCount: 0,
    needsPracticeCount: 0,
    ownerId: "https://issuer.example|user_123",
    pinyin: "xue",
    updatedAt: 1,
    ...overrides,
  };
}

beforeEach(() => {
  window.localStorage.clear();
});

describe("offline storage", () => {
  it("saves and reads a downloaded deck before it expires", () => {
    const deck = createDeck();
    const card = createCard();

    saveOfflineDeck(deck, [card], 1_000);

    expect(getDownloadedDeckIds(1_000).has(deck._id)).toBe(true);
    expect(getOfflineDeck(deck._id, 1_000)?.cards).toEqual([card]);
  });

  it("lists downloaded decks newest first", () => {
    const olderDeck = createDeck({
      _id: "deck_old" as Id<"decks">,
      name: "Older deck",
      updatedAt: 1,
    });
    const newerDeck = createDeck({
      _id: "deck_new" as Id<"decks">,
      name: "Newer deck",
      updatedAt: 2,
    });

    saveOfflineDeck(olderDeck, [createCard({ deckId: olderDeck._id })], 1_000);
    saveOfflineDeck(newerDeck, [createCard({ deckId: newerDeck._id })], 1_000);

    expect(getOfflineDecks(1_000).map(({ deck }) => deck.name)).toEqual([
      "Newer deck",
      "Older deck",
    ]);
  });

  it("expires downloaded decks after seven days", () => {
    const deck = createDeck();

    saveOfflineDeck(deck, [createCard()], 1_000);

    expect(getOfflineDeck(deck._id, 1_000 + OFFLINE_TTL_MS + 1)).toBeNull();
    expect(getDownloadedDeckIds(1_000 + OFFLINE_TTL_MS + 1).has(deck._id)).toBe(
      false,
    );
  });

  it("queues and clears pending review events", () => {
    const event = queuePendingReviewEvent(
      {
        cardId: "card_123" as Id<"cards">,
        deckId: "deck_123" as Id<"decks">,
        result: "needsPractice",
      },
      2_000,
    );

    expect(getPendingReviewEvents()).toEqual([event]);

    removePendingReviewEvents([event.id]);

    expect(getPendingReviewEvents()).toEqual([]);
  });

  it("removes downloaded deck data and pending reviews for that deck", () => {
    const deck = createDeck();
    saveOfflineDeck(deck, [createCard()], 1_000);
    queuePendingReviewEvent(
      {
        cardId: "card_123" as Id<"cards">,
        deckId: deck._id,
        result: "known",
      },
      2_000,
    );

    removeOfflineDeck(deck._id);

    expect(getOfflineDeck(deck._id)).toBeNull();
    expect(getPendingReviewEvents()).toEqual([]);
  });
});
