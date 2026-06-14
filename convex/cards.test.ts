/// <reference types="vite/client" />
import { convexTest } from "convex-test";
import { describe, expect, it } from "vitest";

import { api } from "./_generated/api";
import schema from "./schema";

const modules = import.meta.glob("./**/*.ts");
const ownerId = "https://issuer.example|user_123";
const otherOwnerId = "https://issuer.example|user_456";

async function createOwnedDeck() {
  const t = convexTest(schema, modules);
  const authed = t.withIdentity({ tokenIdentifier: ownerId });
  const deckId = await authed.mutation(api.decks.create, {
    name: "HSK 1 verbs",
  });

  return { authed, deckId, t };
}

describe("cards.create", () => {
  it("trims text, creates a card, and updates deck count", async () => {
    const { authed, deckId, t } = await createOwnedDeck();

    const cardId = await authed.mutation(api.cards.create, {
      deckId,
      pinyin: "  xue  ",
      english: "  study  ",
    });

    const records = await t.run(async (ctx) => ({
      card: await ctx.db.get(cardId),
      deck: await ctx.db.get(deckId),
    }));

    expect(records.card).toMatchObject({
      deckId,
      english: "study",
      knownCount: 0,
      needsPracticeCount: 0,
      ownerId,
      pinyin: "xue",
    });
    expect(records.deck?.cardCount).toBe(1);
    expect(records.deck?.updatedAt).toEqual(expect.any(Number));
  });

  it("rejects blank pinyin and English meaning", async () => {
    const { authed, deckId } = await createOwnedDeck();

    await expect(
      authed.mutation(api.cards.create, {
        deckId,
        pinyin: "   ",
        english: "study",
      }),
    ).rejects.toThrow("Pinyin is required.");

    await expect(
      authed.mutation(api.cards.create, {
        deckId,
        pinyin: "xue",
        english: "   ",
      }),
    ).rejects.toThrow("English meaning is required.");
  });

  it("allows duplicate pinyin values in the same deck", async () => {
    const { authed, deckId } = await createOwnedDeck();

    await authed.mutation(api.cards.create, {
      deckId,
      pinyin: "shi",
      english: "be",
    });
    await authed.mutation(api.cards.create, {
      deckId,
      pinyin: "shi",
      english: "ten",
    });

    const cards = await authed.query(api.cards.listByDeck, { deckId });
    expect(cards.map((card) => card.pinyin)).toEqual(["shi", "shi"]);
  });
});

describe("cards.update", () => {
  it("trims values and blocks cross-user updates", async () => {
    const { authed, deckId, t } = await createOwnedDeck();
    const cardId = await authed.mutation(api.cards.create, {
      deckId,
      pinyin: "xue",
      english: "study",
    });

    await authed.mutation(api.cards.update, {
      cardId,
      pinyin: "  kan  ",
      english: "  look  ",
    });

    await expect(
      t
        .withIdentity({ tokenIdentifier: otherOwnerId })
        .mutation(api.cards.update, {
          cardId,
          pinyin: "du",
          english: "read",
        }),
    ).rejects.toThrow("Card not found.");

    const card = await t.run(async (ctx) => await ctx.db.get(cardId));
    expect(card?.pinyin).toBe("kan");
    expect(card?.english).toBe("look");
  });

  it("rejects blank values", async () => {
    const { authed, deckId } = await createOwnedDeck();
    const cardId = await authed.mutation(api.cards.create, {
      deckId,
      pinyin: "xue",
      english: "study",
    });

    await expect(
      authed.mutation(api.cards.update, {
        cardId,
        pinyin: "",
        english: "study",
      }),
    ).rejects.toThrow("Pinyin is required.");
  });
});

describe("cards.remove", () => {
  it("deletes an owned card and decrements deck count", async () => {
    const { authed, deckId, t } = await createOwnedDeck();
    const cardId = await authed.mutation(api.cards.create, {
      deckId,
      pinyin: "xue",
      english: "study",
    });

    await authed.mutation(api.cards.remove, { cardId });

    const records = await t.run(async (ctx) => ({
      card: await ctx.db.get(cardId),
      deck: await ctx.db.get(deckId),
    }));

    expect(records.card).toBeNull();
    expect(records.deck?.cardCount).toBe(0);
  });

  it("blocks cross-user deletes", async () => {
    const { authed, deckId, t } = await createOwnedDeck();
    const cardId = await authed.mutation(api.cards.create, {
      deckId,
      pinyin: "xue",
      english: "study",
    });

    await expect(
      t
        .withIdentity({ tokenIdentifier: otherOwnerId })
        .mutation(api.cards.remove, { cardId }),
    ).rejects.toThrow("Card not found.");
  });
});
