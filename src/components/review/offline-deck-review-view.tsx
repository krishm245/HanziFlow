import { ArrowLeft } from "lucide-react";
import { Link, useParams } from "react-router";

import { OfflineStatusBanner } from "@/components/offline/offline-status-banner";
import { useOfflineDecks } from "@/components/offline/offline-deck-context";
import { Button } from "@/components/ui/button";
import type { Id } from "../../../convex/_generated/dataModel";
import { ReviewSessionView } from "./review-session-view";

function OfflineDeckReviewView() {
  const { deckId } = useParams();
  const typedDeckId = deckId as Id<"decks"> | undefined;
  const { getDownloadedDeck, queueReview } = useOfflineDecks();
  const offlineDeck = typedDeckId ? getDownloadedDeck(typedDeckId) : null;

  if (!typedDeckId || !offlineDeck) {
    return (
      <section className="mx-auto flex min-h-svh w-full max-w-6xl flex-col gap-7 px-5 py-5 sm:px-8">
        <div className="grid gap-4 rounded-lg border border-dashed border-[#d8e7df] bg-[#f6fbf8] p-8 text-[#49675b]">
          <div>
            <h1 className="text-xl font-semibold text-[#183d32]">
              Offline deck unavailable
            </h1>
            <p className="mt-2 text-sm">
              This deck has not been downloaded on this device or the download
              has expired.
            </p>
          </div>
          <div>
            <Button asChild variant="outline">
              <Link to="/">
                <ArrowLeft />
                Back to HanziFlow
              </Link>
            </Button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="mx-auto flex min-h-svh w-full max-w-6xl flex-col gap-7 px-5 py-5 sm:px-8">
      <OfflineStatusBanner />
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
    </section>
  );
}

export { OfflineDeckReviewView };
