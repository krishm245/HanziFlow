import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  decks: defineTable({
    ownerId: v.string(),
    name: v.string(),
    cardCount: v.number(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_ownerId", ["ownerId"])
    .index("by_ownerId_and_name", ["ownerId", "name"]),

  cards: defineTable({
    ownerId: v.string(),
    deckId: v.id("decks"),
    pinyin: v.string(),
    english: v.string(),
    knownCount: v.number(),
    needsPracticeCount: v.number(),
    lastReviewResult: v.optional(
      v.union(v.literal("known"), v.literal("needsPractice")),
    ),
    lastReviewedAt: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_ownerId_and_deckId", ["ownerId", "deckId"])
    .index("by_ownerId_and_deckId_and_pinyin", ["ownerId", "deckId", "pinyin"]),
});
