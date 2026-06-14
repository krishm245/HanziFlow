import { describe, expect, it } from "vitest";

import {
  clearPinyinText,
  deletePinyinText,
  insertPinyinText,
} from "./pinyin-keyboard-helpers";

describe("pinyin keyboard helpers", () => {
  it("inserts text at the beginning, middle, and end", () => {
    expect(
      insertPinyinText({
        selectionEnd: 0,
        selectionStart: 0,
        text: "x",
        value: "ue",
      }),
    ).toEqual({ selectionEnd: 1, selectionStart: 1, value: "xue" });

    expect(
      insertPinyinText({
        selectionEnd: 1,
        selectionStart: 1,
        text: "u",
        value: "xe",
      }),
    ).toEqual({ selectionEnd: 2, selectionStart: 2, value: "xue" });

    expect(
      insertPinyinText({
        selectionEnd: 2,
        selectionStart: 2,
        text: "e",
        value: "xu",
      }),
    ).toEqual({ selectionEnd: 3, selectionStart: 3, value: "xue" });
  });

  it("replaces selected text", () => {
    expect(
      insertPinyinText({
        selectionEnd: 3,
        selectionStart: 1,
        text: "ǚ",
        value: "xue",
      }),
    ).toEqual({ selectionEnd: 2, selectionStart: 2, value: "xǚ" });
  });

  it("inserts space and apostrophe", () => {
    expect(
      insertPinyinText({
        selectionEnd: 3,
        selectionStart: 3,
        text: " ",
        value: "xue",
      }).value,
    ).toBe("xue ");

    expect(
      insertPinyinText({
        selectionEnd: 2,
        selectionStart: 2,
        text: "'",
        value: "xian",
      }).value,
    ).toBe("xi'an");
  });

  it("deletes selected text", () => {
    expect(
      deletePinyinText({
        selectionEnd: 3,
        selectionStart: 1,
        value: "xue",
      }),
    ).toEqual({ selectionEnd: 1, selectionStart: 1, value: "x" });
  });

  it("deletes the character before the cursor", () => {
    expect(
      deletePinyinText({
        selectionEnd: 2,
        selectionStart: 2,
        value: "xue",
      }),
    ).toEqual({ selectionEnd: 1, selectionStart: 1, value: "xe" });
  });

  it("does nothing at the start of the value", () => {
    expect(
      deletePinyinText({
        selectionEnd: 0,
        selectionStart: 0,
        value: "xue",
      }),
    ).toEqual({ selectionEnd: 0, selectionStart: 0, value: "xue" });
  });

  it("clears text", () => {
    expect(clearPinyinText()).toEqual({
      selectionEnd: 0,
      selectionStart: 0,
      value: "",
    });
  });
});
