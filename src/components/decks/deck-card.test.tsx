// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import type { Doc, Id } from "../../../convex/_generated/dataModel";
import { DeckCard } from "./deck-list";

afterEach(() => {
  cleanup();
});

function createDeck(overrides: Partial<Doc<"decks">> = {}): Doc<"decks"> {
  return {
    _creationTime: 1,
    _id: "deck_123" as Id<"decks">,
    ownerId: "https://issuer.example|user_123",
    name: "HSK 1 verbs",
    cardCount: 3,
    createdAt: 1,
    updatedAt: 1,
    ...overrides,
  };
}

describe("DeckCard", () => {
  it("renames a deck from the actions menu", async () => {
    const user = userEvent.setup();
    const renameDeck = vi.fn(async () => {});
    const removeDeck = vi.fn(async () => {});
    const deck = createDeck();

    render(
      <DeckCard
        deck={deck}
        onRemoveDeck={removeDeck}
        onRenameDeck={renameDeck}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Manage HSK 1 verbs" }));
    await user.click(screen.getByText("Rename"));

    const nameInput = screen.getByLabelText("Deck name") as HTMLInputElement;
    expect(nameInput.value).toBe("HSK 1 verbs");

    await user.clear(nameInput);
    await user.type(nameInput, "  HSK 1 nouns  ");
    await user.click(screen.getByRole("button", { name: "Save changes" }));

    expect(renameDeck).toHaveBeenCalledWith({
      deckId: deck._id,
      name: "HSK 1 nouns",
    });
    expect(removeDeck).not.toHaveBeenCalled();
  });

  it("shows validation when rename is blank", async () => {
    const user = userEvent.setup();
    const renameDeck = vi.fn(async () => {});
    const removeDeck = vi.fn(async () => {});

    render(
      <DeckCard
        deck={createDeck()}
        onRemoveDeck={removeDeck}
        onRenameDeck={renameDeck}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Manage HSK 1 verbs" }));
    await user.click(screen.getByText("Rename"));
    await user.clear(screen.getByLabelText("Deck name"));
    await user.click(screen.getByRole("button", { name: "Save changes" }));

    expect(screen.getByRole("alert").textContent).toBe("Enter a deck name.");
    expect(renameDeck).not.toHaveBeenCalled();
  });

  it("deletes a deck only after confirmation", async () => {
    const user = userEvent.setup();
    const renameDeck = vi.fn(async () => {});
    const removeDeck = vi.fn(async () => {});
    const deck = createDeck({ cardCount: 1 });

    render(
      <DeckCard
        deck={deck}
        onRemoveDeck={removeDeck}
        onRenameDeck={renameDeck}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Manage HSK 1 verbs" }));
    await user.click(screen.getByText("Delete"));

    expect(
      screen.getByText(
        'Delete "HSK 1 verbs" and all 1 card in it. This cannot be undone.',
      ),
    ).not.toBeNull();
    expect(removeDeck).not.toHaveBeenCalled();

    await user.click(screen.getByRole("button", { name: "Delete deck" }));

    expect(removeDeck).toHaveBeenCalledWith({ deckId: deck._id });
    expect(renameDeck).not.toHaveBeenCalled();
  });

  it("does not delete when the confirmation is canceled", async () => {
    const user = userEvent.setup();
    const renameDeck = vi.fn(async () => {});
    const removeDeck = vi.fn(async () => {});

    render(
      <DeckCard
        deck={createDeck()}
        onRemoveDeck={removeDeck}
        onRenameDeck={renameDeck}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Manage HSK 1 verbs" }));
    await user.click(screen.getByText("Delete"));
    await user.click(screen.getByRole("button", { name: "Cancel" }));

    expect(removeDeck).not.toHaveBeenCalled();
  });
});
