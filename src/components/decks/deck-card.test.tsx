// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { MemoryRouter, Route, Routes, useLocation } from "react-router";

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

function renderDeckCard({
  deck = createDeck(),
  removeDeck = vi.fn(async () => {}),
  renameDeck = vi.fn(async () => {}),
}: {
  deck?: Doc<"decks">;
  removeDeck?: (args: { deckId: Id<"decks"> }) => Promise<unknown>;
  renameDeck?: (args: {
    deckId: Id<"decks">;
    name: string;
  }) => Promise<unknown>;
} = {}) {
  render(
    <MemoryRouter>
      <DeckCard
        deck={deck}
        onRemoveDeck={removeDeck}
        onRenameDeck={renameDeck}
      />
    </MemoryRouter>,
  );
}

function LocationDisplay() {
  const location = useLocation();
  return <div data-testid="location">{location.pathname}</div>;
}

describe("DeckCard", () => {
  it("renames a deck from the actions menu", async () => {
    const user = userEvent.setup();
    const renameDeck = vi.fn(async () => {});
    const removeDeck = vi.fn(async () => {});
    const deck = createDeck();

    renderDeckCard({ deck, removeDeck, renameDeck });

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

    renderDeckCard({ removeDeck, renameDeck });

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

    renderDeckCard({ deck, removeDeck, renameDeck });

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

    renderDeckCard({ removeDeck, renameDeck });

    await user.click(screen.getByRole("button", { name: "Manage HSK 1 verbs" }));
    await user.click(screen.getByText("Delete"));
    await user.click(screen.getByRole("button", { name: "Cancel" }));

    expect(removeDeck).not.toHaveBeenCalled();
  });

  it("navigates to the deck route while keeping actions isolated", async () => {
    const user = userEvent.setup();
    const deck = createDeck();

    render(
      <MemoryRouter initialEntries={["/"]}>
        <Routes>
          <Route
            element={
              <>
                <DeckCard
                  deck={deck}
                  onRemoveDeck={async () => {}}
                  onRenameDeck={async () => {}}
                />
                <LocationDisplay />
              </>
            }
            path="/"
          />
          <Route element={<LocationDisplay />} path="/decks/:deckId" />
        </Routes>
      </MemoryRouter>,
    );

    await user.click(screen.getByRole("button", { name: "Manage HSK 1 verbs" }));

    expect(screen.getByTestId("location").textContent).toBe("/");

    await user.keyboard("{Escape}");
    await user.click(screen.getByRole("link", { name: "Open HSK 1 verbs" }));

    expect(screen.getByTestId("location").textContent).toBe(
      `/decks/${deck._id}`,
    );
  });

  it("navigates to the review route from the actions menu", async () => {
    const user = userEvent.setup();
    const deck = createDeck();

    render(
      <MemoryRouter initialEntries={["/"]}>
        <Routes>
          <Route
            element={
              <>
                <DeckCard
                  deck={deck}
                  onRemoveDeck={async () => {}}
                  onRenameDeck={async () => {}}
                />
                <LocationDisplay />
              </>
            }
            path="/"
          />
          <Route element={<LocationDisplay />} path="/decks/:deckId/review" />
        </Routes>
      </MemoryRouter>,
    );

    await user.click(screen.getByRole("button", { name: "Manage HSK 1 verbs" }));
    await user.click(screen.getByText("Review"));

    expect(screen.getByTestId("location").textContent).toBe(
      `/decks/${deck._id}/review`,
    );
  });

  it("disables review for empty decks", async () => {
    const user = userEvent.setup();

    renderDeckCard({ deck: createDeck({ cardCount: 0 }) });

    await user.click(screen.getByRole("button", { name: "Manage HSK 1 verbs" }));

    expect(
      screen
        .getByText("Review")
        .closest("[role='menuitem']")
        ?.getAttribute("data-disabled"),
    ).not.toBeNull();
  });

  it("downloads a deck for offline review from the actions menu", async () => {
    const user = userEvent.setup();
    const deck = createDeck();
    const downloadDeck = vi.fn(async () => {});

    render(
      <MemoryRouter>
        <DeckCard
          deck={deck}
          onDownloadDeck={downloadDeck}
          onRemoveDeck={async () => {}}
          onRenameDeck={async () => {}}
        />
      </MemoryRouter>,
    );

    await user.click(screen.getByRole("button", { name: "Manage HSK 1 verbs" }));
    await user.click(screen.getByText("Download for offline"));

    expect(downloadDeck).toHaveBeenCalledWith(deck);
  });

  it("shows remove offline action for downloaded decks", async () => {
    const user = userEvent.setup();
    const deck = createDeck();
    const removeOfflineDeck = vi.fn();

    render(
      <MemoryRouter>
        <DeckCard
          deck={deck}
          isOfflineAvailable
          onRemoveDeck={async () => {}}
          onRemoveOfflineDeck={removeOfflineDeck}
          onRenameDeck={async () => {}}
        />
      </MemoryRouter>,
    );

    expect(screen.getByText("Available offline")).not.toBeNull();

    await user.click(screen.getByRole("button", { name: "Manage HSK 1 verbs" }));
    await user.click(screen.getByText("Remove offline"));

    expect(removeOfflineDeck).toHaveBeenCalledWith(deck._id);
  });
});
