// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { MemoryRouter } from "react-router";

import type { Doc, Id } from "../../../convex/_generated/dataModel";
import { ReviewSessionView } from "./review-session-view";

afterEach(() => {
  cleanup();
});

function createDeck(overrides: Partial<Doc<"decks">> = {}): Doc<"decks"> {
  return {
    _creationTime: 1,
    _id: "deck_123" as Id<"decks">,
    cardCount: 2,
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

function renderReviewSession({
  cards = [createCard()],
  onRecordReview = vi.fn(async () => {}),
  random = () => 0,
}: {
  cards?: Array<Doc<"cards">>;
  onRecordReview?: (args: {
    cardId: Id<"cards">;
    result: "known" | "needsPractice";
  }) => Promise<unknown>;
  random?: () => number;
} = {}) {
  render(
    <MemoryRouter>
      <ReviewSessionView
        cards={cards}
        deck={createDeck({ cardCount: cards.length })}
        onRecordReview={onRecordReview}
        random={random}
      />
    </MemoryRouter>,
  );
}

describe("ReviewSessionView", () => {
  it("shows pinyin first and reveals English on card click", async () => {
    const user = userEvent.setup();

    renderReviewSession();

    expect(screen.getByText("xue")).not.toBeNull();
    expect(screen.queryByText("study")).toBeNull();

    await user.click(screen.getByRole("button", { name: "Pinyin: xue" }));

    expect(screen.getByText("study")).not.toBeNull();
    expect(screen.getByRole("button", { name: "Correct" })).not.toBeNull();
    expect(screen.getByRole("button", { name: "Needs review" })).not.toBeNull();
  });

  it("records correct answers and shows a summary", async () => {
    const user = userEvent.setup();
    const onRecordReview = vi.fn(async () => {});

    renderReviewSession({ onRecordReview });

    await user.click(screen.getByRole("button", { name: "Pinyin: xue" }));
    await user.click(screen.getByRole("button", { name: "Correct" }));

    expect(onRecordReview).toHaveBeenCalledWith({
      cardId: "card_123",
      result: "known",
    });
    expect(screen.getByText("Review complete")).not.toBeNull();
    expect(screen.getByText("1 correct, 0 need review.")).not.toBeNull();
  });

  it("requeues needs-review cards and keeps them in the needs-review summary", async () => {
    const user = userEvent.setup();
    const onRecordReview = vi.fn(async () => {});

    renderReviewSession({ onRecordReview });

    await user.click(screen.getByRole("button", { name: "Pinyin: xue" }));
    await user.click(screen.getByRole("button", { name: "Needs review" }));

    expect(onRecordReview).toHaveBeenCalledWith({
      cardId: "card_123",
      result: "needsPractice",
    });
    expect(screen.getByText("xue")).not.toBeNull();
    expect(screen.queryByText("study")).toBeNull();

    await user.click(screen.getByRole("button", { name: "Pinyin: xue" }));
    await user.click(screen.getByRole("button", { name: "Correct" }));

    expect(screen.getByText("Review complete")).not.toBeNull();
    expect(screen.getByText("0 correct, 1 need review.")).not.toBeNull();
  });
});
