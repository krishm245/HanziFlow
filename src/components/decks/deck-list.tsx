import { BookOpen, Loader2 } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { Doc } from "../../../convex/_generated/dataModel";
import { formatCardCount } from "./deck-display";

type DeckListProps = {
  action: React.ReactNode;
  decks: Array<Doc<"decks">> | undefined;
};

function DeckList({ action, decks }: DeckListProps) {
  return (
    <section className="grid gap-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold">Decks</h2>
          <p className="text-muted-foreground text-sm">
            {decks ? `${decks.length} total` : "Loading decks"}
          </p>
        </div>
        {action}
      </div>

      {decks === undefined ? (
        <div className="text-muted-foreground flex min-h-40 items-center justify-center gap-2 rounded-lg border border-dashed text-sm">
          <Loader2 className="size-4 animate-spin" />
          Loading decks
        </div>
      ) : decks.length === 0 ? (
        <div className="rounded-lg border border-dashed border-[#d8e7df] bg-[#f6fbf8] p-8 text-sm text-[#49675b]">
          No decks yet. Use the + button to create your first deck.
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {decks.map((deck) => (
            <DeckCard deck={deck} key={deck._id} />
          ))}
        </div>
      )}
    </section>
  );
}

function DeckCard({ deck }: { deck: Doc<"decks"> }) {
  return (
    <Card className="min-h-44 border-[#d8e7df] shadow-sm transition-colors hover:border-[#91b8a7] hover:bg-[#f6fbf8]">
      <CardHeader className="pb-3">
        <div className="mb-4 flex size-10 items-center justify-center rounded-lg bg-[#e7f3ed] text-[#183d32]">
          <BookOpen className="size-5" />
        </div>
        <CardTitle className="truncate text-lg">{deck.name}</CardTitle>
        <CardDescription>{formatCardCount(deck.cardCount)}</CardDescription>
      </CardHeader>
      <CardContent className="mt-auto">
        <div className="flex items-center justify-between border-t border-[#d8e7df] pt-4 text-xs text-[#49675b]">
          <span>Last updated</span>
          <time dateTime={new Date(deck.updatedAt).toISOString()}>
            {new Date(deck.updatedAt).toLocaleDateString()}
          </time>
        </div>
      </CardContent>
    </Card>
  );
}

export { DeckList };
