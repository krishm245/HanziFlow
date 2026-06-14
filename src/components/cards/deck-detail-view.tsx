import { useMutation, useQuery } from "convex/react";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Link, useParams } from "react-router";

import { AddCardTemplate } from "@/components/cards/add-card-template";
import { CardList } from "@/components/cards/card-list";
import { AppHeader } from "@/components/layout/app-header";
import { Button } from "@/components/ui/button";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";

function DeckDetailView() {
  const { deckId } = useParams();
  const typedDeckId = deckId as Id<"decks"> | undefined;
  const deck = useQuery(
    api.decks.get,
    typedDeckId ? { deckId: typedDeckId } : "skip",
  );
  const cards = useQuery(
    api.cards.listByDeck,
    deck ? { deckId: deck._id } : "skip",
  );
  const createCard = useMutation(api.cards.create);
  const updateCard = useMutation(api.cards.update);
  const removeCard = useMutation(api.cards.remove);

  return (
    <section className="mx-auto flex min-h-svh w-full max-w-6xl flex-col gap-7 px-5 py-5 sm:px-8">
      <AppHeader />

      {deck === undefined ? (
        <div className="text-muted-foreground flex min-h-60 items-center justify-center gap-2 rounded-lg border border-dashed text-sm">
          <Loader2 className="size-4 animate-spin" />
          Loading deck
        </div>
      ) : deck === null || !typedDeckId ? (
        <div className="grid gap-4 rounded-lg border border-dashed border-[#d8e7df] bg-[#f6fbf8] p-8 text-[#49675b]">
          <div>
            <h1 className="text-xl font-semibold text-[#183d32]">
              Deck not found
            </h1>
            <p className="mt-2 text-sm">
              This deck may have been deleted or belongs to another account.
            </p>
          </div>
          <div>
            <Button asChild variant="outline">
              <Link to="/">
                <ArrowLeft />
                Back to decks
              </Link>
            </Button>
          </div>
        </div>
      ) : (
        <div className="grid gap-6">
          <div className="grid gap-4 sm:flex sm:items-end sm:justify-between">
            <div className="grid gap-3">
              <Button asChild className="w-fit" variant="outline">
                <Link to="/">
                  <ArrowLeft />
                  Back to decks
                </Link>
              </Button>
              <div>
                <p className="text-sm font-medium text-[#49675b]">
                  Deck workspace
                </p>
                <h1 className="mt-1 text-3xl font-semibold tracking-normal text-[#183d32]">
                  {deck.name}
                </h1>
              </div>
            </div>
            <p className="text-sm text-[#49675b]">
              {deck.cardCount} {deck.cardCount === 1 ? "card" : "cards"}
            </p>
          </div>

          <AddCardTemplate deckId={deck._id} onCreateCard={createCard} />

          <section className="grid gap-3">
            <div>
              <h2 className="text-lg font-semibold">Cards</h2>
              <p className="text-muted-foreground text-sm">
                Newest cards appear first.
              </p>
            </div>
            <CardList
              cards={cards}
              onRemoveCard={removeCard}
              onUpdateCard={updateCard}
            />
          </section>
        </div>
      )}
    </section>
  );
}

export { DeckDetailView };
