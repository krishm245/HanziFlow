import { Loader2 } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { Doc } from "../../../convex/_generated/dataModel";

type DeckListProps = {
  decks: Array<Doc<"decks">> | undefined;
};

function DeckList({ decks }: DeckListProps) {
  return (
    <Card className="border-[#d8e7df] shadow-sm">
      <CardHeader>
        <CardTitle>Your decks</CardTitle>
        <CardDescription>
          {decks ? `${decks.length} total` : "Loading decks"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {decks === undefined ? (
          <div className="text-muted-foreground flex items-center gap-2 text-sm">
            <Loader2 className="size-4 animate-spin" />
            Loading
          </div>
        ) : decks.length === 0 ? (
          <div className="border-border rounded-lg border border-dashed bg-[#f6fbf8] p-6 text-sm text-[#49675b]">
            No decks yet. Create your first deck from the form.
          </div>
        ) : (
          <div className="grid gap-2">
            {decks.map((deck) => (
              <DeckListItem deck={deck} key={deck._id} />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function DeckListItem({ deck }: { deck: Doc<"decks"> }) {
  return (
    <div className="border-border flex min-h-16 items-center justify-between gap-3 rounded-lg border px-4 py-3 transition-colors hover:border-[#91b8a7] hover:bg-[#f6fbf8]">
      <div className="min-w-0">
        <p className="truncate font-medium">{deck.name}</p>
        <p className="text-muted-foreground text-sm">{deck.cardCount} cards</p>
      </div>
      <time
        className="text-muted-foreground shrink-0 text-xs"
        dateTime={new Date(deck.updatedAt).toISOString()}
      >
        {new Date(deck.updatedAt).toLocaleDateString()}
      </time>
    </div>
  );
}

export { DeckList };
