import { v } from "convex/values";
import { mutation, query, type MutationCtx, type QueryCtx } from "./_generated/server";
import type { Id } from "./_generated/dataModel";

async function requireOwnerId(ctx: QueryCtx | MutationCtx) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    throw new Error("You must be signed in.");
  }
  return identity.tokenIdentifier;
}

async function getOwnedDeck(
  ctx: QueryCtx | MutationCtx,
  ownerId: string,
  deckId: Id<"decks">,
) {
  const deck = await ctx.db.get(deckId);
  if (!deck || deck.ownerId !== ownerId) {
    throw new Error("Deck not found.");
  }
  return deck;
}

async function getOwnedCard(
  ctx: QueryCtx | MutationCtx,
  ownerId: string,
  cardId: Id<"cards">,
) {
  const card = await ctx.db.get(cardId);
  if (!card || card.ownerId !== ownerId) {
    throw new Error("Card not found.");
  }
  return card;
}

function cleanText(value: string, fieldName: string) {
  const trimmed = value.trim();
  if (!trimmed) {
    throw new Error(`${fieldName} is required.`);
  }
  return trimmed;
}

export const listByDeck = query({
  args: {
    deckId: v.id("decks"),
  },
  handler: async (ctx, args) => {
    const ownerId = await requireOwnerId(ctx);
    await getOwnedDeck(ctx, ownerId, args.deckId);
    return await ctx.db
      .query("cards")
      .withIndex("by_ownerId_and_deckId", (q) =>
        q.eq("ownerId", ownerId).eq("deckId", args.deckId),
      )
      .order("desc")
      .take(300);
  },
});

export const create = mutation({
  args: {
    deckId: v.id("decks"),
    pinyin: v.string(),
    english: v.string(),
  },
  handler: async (ctx, args) => {
    const ownerId = await requireOwnerId(ctx);
    const deck = await getOwnedDeck(ctx, ownerId, args.deckId);
    const now = Date.now();
    const cardId = await ctx.db.insert("cards", {
      ownerId,
      deckId: args.deckId,
      pinyin: cleanText(args.pinyin, "Pinyin"),
      english: cleanText(args.english, "English meaning"),
      knownCount: 0,
      needsPracticeCount: 0,
      createdAt: now,
      updatedAt: now,
    });
    await ctx.db.patch(args.deckId, {
      cardCount: deck.cardCount + 1,
      updatedAt: now,
    });
    return cardId;
  },
});

export const update = mutation({
  args: {
    cardId: v.id("cards"),
    pinyin: v.string(),
    english: v.string(),
  },
  handler: async (ctx, args) => {
    const ownerId = await requireOwnerId(ctx);
    const card = await getOwnedCard(ctx, ownerId, args.cardId);
    await getOwnedDeck(ctx, ownerId, card.deckId);
    await ctx.db.patch(args.cardId, {
      pinyin: cleanText(args.pinyin, "Pinyin"),
      english: cleanText(args.english, "English meaning"),
      updatedAt: Date.now(),
    });
  },
});

export const remove = mutation({
  args: {
    cardId: v.id("cards"),
  },
  handler: async (ctx, args) => {
    const ownerId = await requireOwnerId(ctx);
    const card = await getOwnedCard(ctx, ownerId, args.cardId);
    const deck = await getOwnedDeck(ctx, ownerId, card.deckId);
    await ctx.db.delete(args.cardId);
    await ctx.db.patch(card.deckId, {
      cardCount: Math.max(0, deck.cardCount - 1),
      updatedAt: Date.now(),
    });
  },
});

export const recordReview = mutation({
  args: {
    cardId: v.id("cards"),
    result: v.union(v.literal("known"), v.literal("needsPractice")),
  },
  handler: async (ctx, args) => {
    const ownerId = await requireOwnerId(ctx);
    const card = await getOwnedCard(ctx, ownerId, args.cardId);
    const now = Date.now();
    await ctx.db.patch(args.cardId, {
      knownCount: card.knownCount + (args.result === "known" ? 1 : 0),
      needsPracticeCount:
        card.needsPracticeCount + (args.result === "needsPractice" ? 1 : 0),
      lastReviewResult: args.result,
      lastReviewedAt: now,
      updatedAt: now,
    });
  },
});
