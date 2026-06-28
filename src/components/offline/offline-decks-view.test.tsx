// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { MemoryRouter } from "react-router";

import type { Doc, Id } from "../../../convex/_generated/dataModel";
import { saveOfflineDeck } from "@/lib/offline-storage";
import { OfflineDecksView } from "./offline-decks-view";

afterEach(() => {
  cleanup();
});

beforeEach(() => {
  window.localStorage.clear();
});

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

describe("OfflineDecksView", () => {
  it("lists downloaded decks with review links", () => {
    const deck = createDeck();
    saveOfflineDeck(deck, [createCard()]);

    render(
      <MemoryRouter>
        <OfflineDecksView />
      </MemoryRouter>,
    );

    expect(screen.getByText("Offline decks")).not.toBeNull();
    expect(screen.getByText("HSK 1 verbs")).not.toBeNull();
    expect(screen.getByText("1 card")).not.toBeNull();
    expect(screen.getByRole("link", { name: "Review" }).getAttribute("href")).toBe(
      `/decks/${deck._id}/review`,
    );
  });

  it("shows an empty state when no decks are downloaded", () => {
    render(
      <MemoryRouter>
        <OfflineDecksView />
      </MemoryRouter>,
    );

    expect(
      screen.getByText("No decks are available offline on this device."),
    ).not.toBeNull();
  });
});
