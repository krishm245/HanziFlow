import { describe, expect, it } from "vitest";

import {
  createReviewSession,
  getReviewSummary,
  isReviewComplete,
  markCurrentCorrect,
  markCurrentNeedsReview,
  revealCurrentCard,
  shuffleCards,
} from "./review-session";

const cards = [
  { _id: "card_1", english: "study", pinyin: "xue" },
  { _id: "card_2", english: "look", pinyin: "kan" },
  { _id: "card_3", english: "read", pinyin: "du" },
];

describe("review session helpers", () => {
  it("shuffles cards without dropping any", () => {
    const shuffled = shuffleCards(cards, () => 0);

    expect(shuffled).toHaveLength(cards.length);
    expect(shuffled.map((card) => card._id).sort()).toEqual([
      "card_1",
      "card_2",
      "card_3",
    ]);
  });

  it("creates a session with a current card", () => {
    const session = createReviewSession(cards, () => 0);

    expect(session.currentCard?._id).toBe("card_2");
    expect(session.queue).toHaveLength(2);
    expect(session.isRevealed).toBe(false);
  });

  it("reveals the current card", () => {
    const session = createReviewSession(cards, () => 0);

    expect(revealCurrentCard(session).isRevealed).toBe(true);
  });

  it("marks a card correct and removes it from the queue", () => {
    const session = createReviewSession([cards[0]], () => 0);
    const nextSession = markCurrentCorrect(session);

    expect(nextSession.correctCardIds).toEqual(["card_1"]);
    expect(nextSession.currentCard).toBeNull();
    expect(isReviewComplete(nextSession)).toBe(true);
  });

  it("marks a card needs review and requeues it later", () => {
    const session = createReviewSession(cards, () => 0);
    const nextSession = markCurrentNeedsReview(session, () => 1);

    expect(nextSession.missedCardIds).toEqual(["card_2"]);
    expect(nextSession.currentCard?._id).toBe("card_3");
    expect(nextSession.queue.map((card) => card._id)).toContain("card_2");
  });

  it("keeps missed-then-correct cards in the needs-review summary only", () => {
    const session = createReviewSession([cards[0]], () => 0);
    const missedSession = markCurrentNeedsReview(session, () => 0);
    const completedSession = markCurrentCorrect(missedSession);
    const summary = getReviewSummary(completedSession);

    expect(summary.correctCards).toEqual([]);
    expect(summary.needsReviewCards.map((card) => card._id)).toEqual(["card_1"]);
  });
});
