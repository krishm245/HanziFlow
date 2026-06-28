import { useMutation, useQuery } from "convex/react";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Link, useParams } from "react-router";

import { AppHeader } from "@/components/layout/app-header";
import { OfflineStatusBanner } from "@/components/offline/offline-status-banner";
import { useOfflineDecks } from "@/components/offline/offline-deck-context";
import { Button } from "@/components/ui/button";
import { useOnlineStatus } from "@/lib/use-online-status";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import { ReviewSessionView } from "./review-session-view";

function DeckReviewView() {
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
  const recordReview = useMutation(api.cards.recordReview);
  const isOnline = useOnlineStatus();
  const { getDownloadedDeck, queueReview } = useOfflineDecks();
  const offlineDeck = typedDeckId ? getDownloadedDeck(typedDeckId) : null;
  const shouldUseOfflineDeck = Boolean(!isOnline && offlineDeck);

  return (
    <section className="mx-auto flex min-h-svh w-full max-w-6xl flex-col gap-7 px-5 py-5 sm:px-8">
      <AppHeader />
      <OfflineStatusBanner />

      {shouldUseOfflineDeck && offlineDeck ? (
        <ReviewSessionView
          cards={offlineDeck.cards}
          deck={offlineDeck.deck}
          onRecordReview={async ({ cardId, result }) => {
            await queueReview({
              cardId,
              deckId: offlineDeck.deck._id,
              result,
            });
          }}
        />
      ) : deck === undefined || cards === undefined ? (
        <div className="text-muted-foreground flex min-h-60 items-center justify-center gap-2 rounded-lg border border-dashed text-sm">
          <Loader2 className="size-4 animate-spin" />
          Loading review
        </div>
      ) : deck === null || !typedDeckId ? (
        <ReviewMessage
          description="This deck may have been deleted or belongs to another account."
          title="Deck not found"
        />
      ) : cards.length === 0 ? (
        <ReviewMessage
          description="Add cards before starting a review session."
          title="No cards to review"
        />
      ) : (
        <ReviewSessionView
          cards={cards}
          deck={deck}
          onRecordReview={recordReview}
        />
      )}
    </section>
  );
}

function ReviewMessage({
  description,
  title,
}: {
  description: string;
  title: string;
}) {
  return (
    <div className="grid gap-4 rounded-lg border border-dashed border-[#d8e7df] bg-[#f6fbf8] p-8 text-[#49675b]">
      <div>
        <h1 className="text-xl font-semibold text-[#183d32]">{title}</h1>
        <p className="mt-2 text-sm">{description}</p>
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
  );
}

export { DeckReviewView };
