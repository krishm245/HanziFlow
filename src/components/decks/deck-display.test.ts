import { describe, expect, it } from "vitest";

import { formatCardCount, getDeckNameError } from "./deck-display";

describe("deck display helpers", () => {
  it("requires a non-empty deck name", () => {
    expect(getDeckNameError("")).toBe("Enter a deck name.");
    expect(getDeckNameError("   ")).toBe("Enter a deck name.");
    expect(getDeckNameError("HSK 1 verbs")).toBe("");
  });

  it("formats card counts with the right singular label", () => {
    expect(formatCardCount(0)).toBe("0 cards");
    expect(formatCardCount(1)).toBe("1 card");
    expect(formatCardCount(12)).toBe("12 cards");
  });
});
