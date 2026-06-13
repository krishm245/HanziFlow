/// <reference types="vite/client" />
import { convexTest } from "convex-test";
import { describe, expect, it } from "vitest";

import { api, internal } from "./_generated/api";
import schema from "./schema";

const modules = import.meta.glob("./**/*.ts");
const ownerId = "https://issuer.example|user_123";
const otherOwnerId = "https://issuer.example|user_456";

describe("decks.create", () => {
  it("creates a deck for the authenticated user", async () => {
    const t = convexTest(schema, modules);
    const authed = t.withIdentity({ tokenIdentifier: ownerId });

    const deckId = await authed.mutation(api.decks.create, {
      name: "  HSK 1 verbs  ",
    });

    const deck = await t.run(async (ctx) => await ctx.db.get(deckId));

    expect(deck).toMatchObject({
      ownerId,
      name: "HSK 1 verbs",
      cardCount: 0,
    });
    expect(deck?.createdAt).toEqual(expect.any(Number));
    expect(deck?.updatedAt).toEqual(expect.any(Number));
  });

  it("rejects unauthenticated deck creation", async () => {
    const t = convexTest(schema, modules);

    await expect(
      t.mutation(api.decks.create, { name: "HSK 1 verbs" }),
    ).rejects.toThrow("You must be signed in.");
  });

  it("rejects blank deck names", async () => {
    const t = convexTest(schema, modules);
    const authed = t.withIdentity({ tokenIdentifier: ownerId });

    await expect(
      authed.mutation(api.decks.create, { name: "   " }),
    ).rejects.toThrow("Deck name is required.");
  });

  it("rejects duplicate deck names for the same owner", async () => {
    const t = convexTest(schema, modules);
    const authed = t.withIdentity({ tokenIdentifier: ownerId });

    await authed.mutation(api.decks.create, { name: "HSK 1 verbs" });

    await expect(
      authed.mutation(api.decks.create, { name: "  HSK 1 verbs  " }),
    ).rejects.toThrow("A deck with this name already exists.");
  });

  it("allows duplicate deck names across different owners", async () => {
    const t = convexTest(schema, modules);

    await t
      .withIdentity({ tokenIdentifier: ownerId })
      .mutation(api.decks.create, { name: "HSK 1 verbs" });

    const otherDeckId = await t
      .withIdentity({ tokenIdentifier: otherOwnerId })
      .mutation(api.decks.create, { name: "HSK 1 verbs" });

    const otherDeck = await t.run(async (ctx) => await ctx.db.get(otherDeckId));
    expect(otherDeck?.ownerId).toBe(otherOwnerId);
  });
});

describe("decks.rename", () => {
  it("renames a deck owned by the authenticated user", async () => {
    const t = convexTest(schema, modules);
    const authed = t.withIdentity({ tokenIdentifier: ownerId });
    const deckId = await authed.mutation(api.decks.create, {
      name: "HSK 1 verbs",
    });

    await authed.mutation(api.decks.rename, {
      deckId,
      name: "  HSK 1 nouns  ",
    });

    const deck = await t.run(async (ctx) => await ctx.db.get(deckId));
    expect(deck?.name).toBe("HSK 1 nouns");
    expect(deck?.updatedAt).toEqual(expect.any(Number));
  });

  it("rejects unauthenticated deck renames", async () => {
    const t = convexTest(schema, modules);
    const deckId = await t
      .withIdentity({ tokenIdentifier: ownerId })
      .mutation(api.decks.create, { name: "HSK 1 verbs" });

    await expect(
      t.mutation(api.decks.rename, { deckId, name: "HSK 1 nouns" }),
    ).rejects.toThrow("You must be signed in.");
  });

  it("rejects deck renames from another owner", async () => {
    const t = convexTest(schema, modules);
    const deckId = await t
      .withIdentity({ tokenIdentifier: ownerId })
      .mutation(api.decks.create, { name: "HSK 1 verbs" });

    await expect(
      t
        .withIdentity({ tokenIdentifier: otherOwnerId })
        .mutation(api.decks.rename, { deckId, name: "HSK 1 nouns" }),
    ).rejects.toThrow("Deck not found.");
  });

  it("rejects blank deck names", async () => {
    const t = convexTest(schema, modules);
    const authed = t.withIdentity({ tokenIdentifier: ownerId });
    const deckId = await authed.mutation(api.decks.create, {
      name: "HSK 1 verbs",
    });

    await expect(
      authed.mutation(api.decks.rename, { deckId, name: "   " }),
    ).rejects.toThrow("Deck name is required.");
  });

  it("rejects duplicate deck names for the same owner", async () => {
    const t = convexTest(schema, modules);
    const authed = t.withIdentity({ tokenIdentifier: ownerId });
    await authed.mutation(api.decks.create, { name: "HSK 1 verbs" });
    const deckId = await authed.mutation(api.decks.create, {
      name: "HSK 1 nouns",
    });

    await expect(
      authed.mutation(api.decks.rename, { deckId, name: "HSK 1 verbs" }),
    ).rejects.toThrow("A deck with this name already exists.");
  });
});

describe("decks.remove", () => {
  it("deletes a deck owned by the authenticated user and its cards", async () => {
    const t = convexTest(schema, modules);
    const authed = t.withIdentity({ tokenIdentifier: ownerId });
    const deckId = await authed.mutation(api.decks.create, {
      name: "HSK 1 verbs",
    });
    const cardId = await authed.mutation(api.cards.create, {
      deckId,
      pinyin: "xue",
      english: "study",
    });

    await authed.mutation(api.decks.remove, { deckId });

    const records = await t.run(async (ctx) => ({
      card: await ctx.db.get(cardId),
      deck: await ctx.db.get(deckId),
    }));
    expect(records.deck).toBeNull();
    expect(records.card).toBeNull();
  });

  it("rejects unauthenticated deck deletes", async () => {
    const t = convexTest(schema, modules);
    const deckId = await t
      .withIdentity({ tokenIdentifier: ownerId })
      .mutation(api.decks.create, { name: "HSK 1 verbs" });

    await expect(t.mutation(api.decks.remove, { deckId })).rejects.toThrow(
      "You must be signed in.",
    );
  });

  it("rejects deck deletes from another owner", async () => {
    const t = convexTest(schema, modules);
    const deckId = await t
      .withIdentity({ tokenIdentifier: ownerId })
      .mutation(api.decks.create, { name: "HSK 1 verbs" });

    await expect(
      t
        .withIdentity({ tokenIdentifier: otherOwnerId })
        .mutation(api.decks.remove, { deckId }),
    ).rejects.toThrow("Deck not found.");
  });

  it("hides large decks immediately and finishes deletion in batches", async () => {
    const t = convexTest(schema, modules);
    const authed = t.withIdentity({ tokenIdentifier: ownerId });
    const deckId = await authed.mutation(api.decks.create, {
      name: "Large review deck",
    });

    await t.run(async (ctx) => {
      const now = Date.now();

      for (let index = 0; index < 101; index += 1) {
        await ctx.db.insert("cards", {
          ownerId,
          deckId,
          pinyin: `ci${index}`,
          english: `word ${index}`,
          knownCount: 0,
          needsPracticeCount: 0,
          createdAt: now,
          updatedAt: now,
        });
      }

      await ctx.db.patch(deckId, {
        cardCount: 101,
        updatedAt: now,
      });
    });

    await authed.mutation(api.decks.remove, { deckId });

    const visibleDecks = await authed.query(api.decks.list);
    const afterFirstBatch = await t.run(async (ctx) => {
      const deck = await ctx.db.get(deckId);
      const remainingCards = await ctx.db
        .query("cards")
        .withIndex("by_ownerId_and_deckId", (q) =>
          q.eq("ownerId", ownerId).eq("deckId", deckId),
        )
        .take(101);

      return {
        deck,
        remainingCardCount: remainingCards.length,
      };
    });

    expect(visibleDecks).toHaveLength(0);
    expect(afterFirstBatch.deck?.deletingAt).toEqual(expect.any(Number));
    expect(afterFirstBatch.remainingCardCount).toBe(1);

    await t.mutation(internal.decks.deleteDeckBatch, { ownerId, deckId });

    const afterFinalBatch = await t.run(async (ctx) => {
      const deck = await ctx.db.get(deckId);
      const remainingCards = await ctx.db
        .query("cards")
        .withIndex("by_ownerId_and_deckId", (q) =>
          q.eq("ownerId", ownerId).eq("deckId", deckId),
        )
        .take(1);

      return {
        deck,
        remainingCardCount: remainingCards.length,
      };
    });

    expect(afterFinalBatch.deck).toBeNull();
    expect(afterFinalBatch.remainingCardCount).toBe(0);
  });
});
