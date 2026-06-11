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

function cleanName(name: string) {
  const trimmed = name.trim();
  if (!trimmed) {
    throw new Error("Deck name is required.");
  }
  return trimmed;
}

export const list = query({
  args: {},
  handler: async (ctx) => {
    const ownerId = await requireOwnerId(ctx);
    return await ctx.db
      .query("decks")
      .withIndex("by_ownerId", (q) => q.eq("ownerId", ownerId))
      .order("desc")
      .take(100);
  },
});

export const create = mutation({
  args: {
    name: v.string(),
  },
  handler: async (ctx, args) => {
    const ownerId = await requireOwnerId(ctx);
    const now = Date.now();
    return await ctx.db.insert("decks", {
      ownerId,
      name: cleanName(args.name),
      cardCount: 0,
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const rename = mutation({
  args: {
    deckId: v.id("decks"),
    name: v.string(),
  },
  handler: async (ctx, args) => {
    const ownerId = await requireOwnerId(ctx);
    await getOwnedDeck(ctx, ownerId, args.deckId);
    await ctx.db.patch(args.deckId, {
      name: cleanName(args.name),
      updatedAt: Date.now(),
    });
  },
});

export const remove = mutation({
  args: {
    deckId: v.id("decks"),
  },
  handler: async (ctx, args) => {
    const ownerId = await requireOwnerId(ctx);
    await getOwnedDeck(ctx, ownerId, args.deckId);
    const cards = await ctx.db
      .query("cards")
      .withIndex("by_ownerId_and_deckId", (q) =>
        q.eq("ownerId", ownerId).eq("deckId", args.deckId),
      )
      .take(200);

    if (cards.length === 200) {
      throw new Error("Delete some cards first, then try deleting this deck again.");
    }

    for (const card of cards) {
      await ctx.db.delete(card._id);
    }
    await ctx.db.delete(args.deckId);
  },
});
