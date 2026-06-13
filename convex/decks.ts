import { v } from "convex/values";
import { internal } from "./_generated/api";
import {
  internalMutation,
  mutation,
  query,
  type MutationCtx,
  type QueryCtx,
} from "./_generated/server";
import type { Id } from "./_generated/dataModel";

const DELETE_BATCH_SIZE = 100;

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

async function findDeckWithName(ctx: QueryCtx | MutationCtx, ownerId: string, name: string) {
  return await ctx.db
    .query("decks")
    .withIndex("by_ownerId_and_name", (q) =>
      q.eq("ownerId", ownerId).eq("name", name),
    )
    .take(2);
}

async function requireUniqueDeckName(
  ctx: QueryCtx | MutationCtx,
  ownerId: string,
  name: string,
  currentDeckId?: Id<"decks">,
) {
  const matches = await findDeckWithName(ctx, ownerId, name);
  const hasDuplicate = matches.some((deck) => deck._id !== currentDeckId);

  if (hasDuplicate) {
    throw new Error("A deck with this name already exists.");
  }
}

async function deleteDeckCardsBatch(
  ctx: MutationCtx,
  ownerId: string,
  deckId: Id<"decks">,
) {
  const cards = await ctx.db
    .query("cards")
    .withIndex("by_ownerId_and_deckId", (q) =>
      q.eq("ownerId", ownerId).eq("deckId", deckId),
    )
    .take(DELETE_BATCH_SIZE);

  for (const card of cards) {
    await ctx.db.delete(card._id);
  }

  return cards.length;
}

export const list = query({
  args: {},
  handler: async (ctx) => {
    const ownerId = await requireOwnerId(ctx);
    return await ctx.db
      .query("decks")
      .withIndex("by_ownerId_and_deletingAt", (q) =>
        q.eq("ownerId", ownerId).eq("deletingAt", undefined),
      )
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
    const name = cleanName(args.name);
    await requireUniqueDeckName(ctx, ownerId, name);
    const now = Date.now();
    return await ctx.db.insert("decks", {
      ownerId,
      name,
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
    const name = cleanName(args.name);
    await requireUniqueDeckName(ctx, ownerId, name, args.deckId);
    await ctx.db.patch(args.deckId, {
      name,
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
    const now = Date.now();
    await ctx.db.patch(args.deckId, {
      deletingAt: now,
      updatedAt: now,
    });

    const deletedCount = await deleteDeckCardsBatch(ctx, ownerId, args.deckId);

    if (deletedCount === DELETE_BATCH_SIZE) {
      await ctx.scheduler.runAfter(0, internal.decks.deleteDeckBatch, {
        ownerId,
        deckId: args.deckId,
      });
      return;
    }

    await ctx.db.delete(args.deckId);
  },
});

export const deleteDeckBatch = internalMutation({
  args: {
    ownerId: v.string(),
    deckId: v.id("decks"),
  },
  handler: async (ctx, args) => {
    const deck = await ctx.db.get(args.deckId);

    if (!deck || deck.ownerId !== args.ownerId || !deck.deletingAt) {
      return;
    }

    const deletedCount = await deleteDeckCardsBatch(
      ctx,
      args.ownerId,
      args.deckId,
    );

    if (deletedCount === DELETE_BATCH_SIZE) {
      await ctx.scheduler.runAfter(0, internal.decks.deleteDeckBatch, args);
      return;
    }

    await ctx.db.delete(args.deckId);
  },
});
