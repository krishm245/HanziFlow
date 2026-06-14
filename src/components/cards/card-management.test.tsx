// @vitest-environment jsdom
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import type { Doc, Id } from "../../../convex/_generated/dataModel";
import { AddCardTemplate } from "./add-card-template";
import { CardRow } from "./card-row";

const { toastSuccess } = vi.hoisted(() => ({
  toastSuccess: vi.fn(),
}));

vi.mock("sonner", () => ({
  toast: {
    success: toastSuccess,
  },
}));

afterEach(() => {
  cleanup();
  toastSuccess.mockClear();
});

function createCard(overrides: Partial<Doc<"cards">> = {}): Doc<"cards"> {
  return {
    _creationTime: 1,
    _id: "card_123" as Id<"cards">,
    deckId: "deck_123" as Id<"decks">,
    ownerId: "https://issuer.example|user_123",
    pinyin: "xue",
    english: "study",
    knownCount: 0,
    needsPracticeCount: 0,
    createdAt: 1,
    updatedAt: 1,
    ...overrides,
  };
}

describe("AddCardTemplate", () => {
  it("creates a trimmed card, clears the form, and shows a toast", async () => {
    const user = userEvent.setup();
    const createCard = vi.fn(async () => {});
    const deckId = "deck_123" as Id<"decks">;

    render(<AddCardTemplate deckId={deckId} onCreateCard={createCard} />);

    await user.type(screen.getByLabelText("Pinyin"), "  xue  ");
    await user.type(screen.getByLabelText("English meaning"), "  study  ");
    await user.click(screen.getByRole("button", { name: "Add card" }));

    expect(createCard).toHaveBeenCalledWith({
      deckId,
      english: "study",
      pinyin: "xue",
    });
    expect((screen.getByLabelText("Pinyin") as HTMLInputElement).value).toBe("");
    expect(
      (screen.getByLabelText("English meaning") as HTMLInputElement).value,
    ).toBe("");
    expect(toastSuccess).toHaveBeenCalledWith("Card added");
  });

  it("validates blank fields", async () => {
    const user = userEvent.setup();
    const createCard = vi.fn(async () => {});

    render(
      <AddCardTemplate
        deckId={"deck_123" as Id<"decks">}
        onCreateCard={createCard}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Add card" }));

    expect(screen.getByRole("alert").textContent).toBe("Enter pinyin.");
    expect(createCard).not.toHaveBeenCalled();
  });

  it("shows, hides, and uses the pinyin keyboard", async () => {
    const user = userEvent.setup();

    render(
      <AddCardTemplate
        deckId={"deck_123" as Id<"decks">}
        onCreateCard={async () => {}}
      />,
    );

    expect(screen.getByText("Pinyin keyboard")).not.toBeNull();

    await user.click(screen.getByRole("button", { name: "Insert ǚ" }));
    await user.click(screen.getByRole("button", { name: "Insert space" }));
    await user.click(screen.getByRole("button", { name: "Insert apostrophe" }));

    expect((screen.getByLabelText("Pinyin") as HTMLInputElement).value).toBe(
      "ǚ '",
    );

    await user.click(
      screen.getByRole("button", { name: "Hide pinyin keyboard" }),
    );
    expect(screen.queryByRole("button", { name: "Insert ǚ" })).toBeNull();

    await user.click(
      screen.getByRole("button", { name: "Show pinyin keyboard" }),
    );
    expect(screen.getByRole("button", { name: "Insert ǚ" })).not.toBeNull();
  });

  it("inserts keyboard text at the pinyin cursor", async () => {
    const user = userEvent.setup();

    render(
      <AddCardTemplate
        deckId={"deck_123" as Id<"decks">}
        onCreateCard={async () => {}}
      />,
    );

    const pinyinInput = screen.getByLabelText("Pinyin") as HTMLInputElement;
    await user.type(pinyinInput, "xue");
    pinyinInput.setSelectionRange(1, 2);

    await user.click(screen.getByRole("button", { name: "Insert ǚ" }));

    expect(pinyinInput.value).toBe("xǚe");
    await waitFor(() => {
      expect(pinyinInput.selectionStart).toBe(2);
      expect(document.activeElement).toBe(pinyinInput);
    });
  });
});

describe("CardRow", () => {
  it("saves inline edits and shows a toast", async () => {
    const user = userEvent.setup();
    const updateCard = vi.fn(async () => {});
    const removeCard = vi.fn(async () => {});
    const card = createCard();

    render(
      <CardRow
        card={card}
        onRemoveCard={removeCard}
        onUpdateCard={updateCard}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Edit xue" }));
    await user.clear(screen.getByLabelText("Pinyin"));
    await user.type(screen.getByLabelText("Pinyin"), "  kan  ");
    await user.clear(screen.getByLabelText("English meaning"));
    await user.type(screen.getByLabelText("English meaning"), "  look  ");
    await user.click(screen.getByRole("button", { name: "Save changes" }));

    expect(updateCard).toHaveBeenCalledWith({
      cardId: card._id,
      english: "look",
      pinyin: "kan",
    });
    expect(removeCard).not.toHaveBeenCalled();
    expect(toastSuccess).toHaveBeenCalledWith("Card updated");
  });

  it("uses the pinyin keyboard while editing a card", async () => {
    const user = userEvent.setup();
    const updateCard = vi.fn(async () => {});

    render(
      <CardRow
        card={createCard()}
        onRemoveCard={async () => {}}
        onUpdateCard={updateCard}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Edit xue" }));
    await user.clear(screen.getByLabelText("Pinyin"));
    await user.click(screen.getByRole("button", { name: "Insert ā" }));
    await user.click(screen.getByRole("button", { name: "Backspace" }));
    await user.click(screen.getByRole("button", { name: "Insert á" }));
    await user.click(screen.getByRole("button", { name: "Clear pinyin" }));
    await user.click(screen.getByRole("button", { name: "Insert ǎ" }));

    expect((screen.getByLabelText("Pinyin") as HTMLInputElement).value).toBe(
      "ǎ",
    );
  });

  it("cancels inline edits", async () => {
    const user = userEvent.setup();
    const updateCard = vi.fn(async () => {});

    render(
      <CardRow
        card={createCard()}
        onRemoveCard={async () => {}}
        onUpdateCard={updateCard}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Edit xue" }));
    await user.clear(screen.getByLabelText("Pinyin"));
    await user.type(screen.getByLabelText("Pinyin"), "kan");
    await user.click(screen.getByRole("button", { name: "Cancel" }));

    expect(screen.getByText("xue")).not.toBeNull();
    expect(updateCard).not.toHaveBeenCalled();
  });

  it("deletes only after confirmation and shows a toast", async () => {
    const user = userEvent.setup();
    const removeCard = vi.fn(async () => {});
    const card = createCard();

    render(
      <CardRow
        card={card}
        onRemoveCard={removeCard}
        onUpdateCard={async () => {}}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Delete xue" }));

    expect(
      screen.getByText('Delete "xue" - study. This cannot be undone.'),
    ).not.toBeNull();
    expect(removeCard).not.toHaveBeenCalled();

    await user.click(screen.getByRole("button", { name: "Delete card" }));

    expect(removeCard).toHaveBeenCalledWith({ cardId: card._id });
    expect(toastSuccess).toHaveBeenCalledWith("Card deleted");
  });
});
