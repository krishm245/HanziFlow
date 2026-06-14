import { describe, expect, it } from "vitest";

import { formatReviewStatus, getCardFieldError } from "./card-display";

describe("card display helpers", () => {
  it("validates required card fields", () => {
    expect(getCardFieldError("", "study")).toBe("Enter pinyin.");
    expect(getCardFieldError("   ", "study")).toBe("Enter pinyin.");
    expect(getCardFieldError("xue", "")).toBe("Enter an English meaning.");
    expect(getCardFieldError("xue", "   ")).toBe("Enter an English meaning.");
    expect(getCardFieldError("xue", "study")).toBe("");
  });

  it("formats review state", () => {
    expect(formatReviewStatus(0, 0)).toBe("Unreviewed");
    expect(formatReviewStatus(2, 1, "known")).toBe(
      "Last marked known - 2 known / 1 practice",
    );
    expect(formatReviewStatus(2, 1, "needsPractice")).toBe(
      "Needs practice - 2 known / 1 practice",
    );
  });
});
