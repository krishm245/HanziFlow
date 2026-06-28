import { BookOpen, Play } from "lucide-react";
import { Link } from "react-router";

import { OfflineStatusBanner } from "@/components/offline/offline-status-banner";
import { useOfflineDecks } from "@/components/offline/offline-deck-context";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatCardCount } from "@/components/decks/deck-display";

function OfflineDecksView() {
  const { getDownloadedDecks } = useOfflineDecks();
  const offlineDecks = getDownloadedDecks();

  return (
    <section className="mx-auto flex min-h-svh w-full max-w-6xl flex-col gap-7 px-5 py-5 sm:px-8">
      <div className="flex items-center justify-between gap-4 border-b border-[#d8e7df] pb-5">
        <div>
          <p className="text-sm font-medium text-[#1f7a5a]">HanziFlow</p>
          <h1 className="mt-1 text-2xl font-semibold text-[#183d32]">
            Offline decks
          </h1>
        </div>
      </div>

      <OfflineStatusBanner />

      {offlineDecks.length === 0 ? (
        <div className="rounded-lg border border-dashed border-[#d8e7df] bg-[#f6fbf8] p-8 text-sm text-[#49675b]">
          No decks are available offline on this device.
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {offlineDecks.map(({ deck, expiresAt }) => (
            <Card
              className="border-[#d8e7df] shadow-sm transition-colors hover:border-[#91b8a7] hover:bg-[#f6fbf8]"
              key={deck._id}
            >
              <CardHeader className="pb-3">
                <div className="mb-4 flex items-start justify-between gap-3">
                  <div className="flex size-10 items-center justify-center rounded-lg bg-[#e7f3ed] text-[#183d32]">
                    <BookOpen className="size-5" />
                  </div>
                  <Button asChild size="sm" variant="outline">
                    <Link to={`/decks/${deck._id}/review`}>
                      <Play />
                      Review
                    </Link>
                  </Button>
                </div>
                <CardTitle className="truncate text-lg">{deck.name}</CardTitle>
                <CardDescription>{formatCardCount(deck.cardCount)}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between gap-3 border-t border-[#d8e7df] pt-4 text-xs text-[#49675b]">
                  <span>Available until</span>
                  <time dateTime={new Date(expiresAt).toISOString()}>
                    {new Date(expiresAt).toLocaleDateString()}
                  </time>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </section>
  );
}

export { OfflineDecksView };
