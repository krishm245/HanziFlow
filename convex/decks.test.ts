/// <reference types="vite/client" />
import { convexTest } from "convex-test";
import { describe, expect, it } from "vitest";

import { api } from "./_generated/api";
import schema from "./schema";

const modules = import.meta.glob("./**/*.ts");
const ownerId = "https://issuer.example|user_123";

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
});
