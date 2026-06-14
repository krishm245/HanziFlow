import { BookOpen, Loader2, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { useMutation } from "convex/react";
import { Link } from "react-router";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { api } from "../../../convex/_generated/api";
import type { Doc, Id } from "../../../convex/_generated/dataModel";
import { DeleteDeckDialog } from "./delete-deck-dialog";
import { formatCardCount } from "./deck-display";
import { RenameDeckDialog } from "./rename-deck-dialog";

type DeckListProps = {
  action: React.ReactNode;
  decks: Array<Doc<"decks">> | undefined;
};

type RenameDeck = (args: {
  deckId: Id<"decks">;
  name: string;
}) => Promise<unknown>;

type RemoveDeck = (args: { deckId: Id<"decks"> }) => Promise<unknown>;

function DeckList({ action, decks }: DeckListProps) {
  const renameDeck = useMutation(api.decks.rename);
  const removeDeck = useMutation(api.decks.remove);

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
            <DeckCard
              deck={deck}
              key={deck._id}
              onRemoveDeck={removeDeck}
              onRenameDeck={renameDeck}
            />
          ))}
        </div>
      )}
    </section>
  );
}

function DeckCard({
  deck,
  onRemoveDeck,
  onRenameDeck,
}: {
  deck: Doc<"decks">;
  onRemoveDeck: RemoveDeck;
  onRenameDeck: RenameDeck;
}) {
  return (
    <Card className="min-h-44 border-[#d8e7df] shadow-sm transition-colors hover:border-[#91b8a7] hover:bg-[#f6fbf8]">
      <CardHeader className="pb-3">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div className="flex size-10 items-center justify-center rounded-lg bg-[#e7f3ed] text-[#183d32]">
            <BookOpen className="size-5" />
          </div>
          <DeckActions
            deck={deck}
            onRemoveDeck={onRemoveDeck}
            onRenameDeck={onRenameDeck}
          />
        </div>
        <CardTitle className="truncate text-lg">{deck.name}</CardTitle>
        <CardDescription>{formatCardCount(deck.cardCount)}</CardDescription>
      </CardHeader>
      <CardContent className="mt-auto">
        <Link
          aria-label={`Open ${deck.name}`}
          className="focus-visible:ring-ring -mx-2 mb-4 block rounded-lg px-2 py-1 text-sm font-medium text-[#183d32] outline-none transition-colors hover:text-[#245747] focus-visible:ring-3"
          to={`/decks/${deck._id}`}
        >
          Open deck
        </Link>
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

function DeckActions({
  deck,
  onRemoveDeck,
  onRenameDeck,
}: {
  deck: Doc<"decks">;
  onRemoveDeck: RemoveDeck;
  onRenameDeck: RenameDeck;
}) {
  return (
    <RenameDeckDialog deck={deck} onRenameDeck={onRenameDeck}>
      {({ openRenameDialog }) => (
        <DeleteDeckDialog deck={deck} onRemoveDeck={onRemoveDeck}>
          {({ openDeleteDialog }) => (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  aria-label={`Manage ${deck.name}`}
                  className="text-[#49675b] hover:bg-[#e7f3ed] hover:text-[#183d32]"
                  size="icon"
                  variant="ghost"
                >
                  <MoreHorizontal />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Deck actions</DropdownMenuLabel>
                <DropdownMenuItem onSelect={openRenameDialog}>
                  <Pencil />
                  Rename
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onSelect={openDeleteDialog}
                  variant="destructive"
                >
                  <Trash2 />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </DeleteDeckDialog>
      )}
    </RenameDeckDialog>
  );
}

export { DeckCard, DeckList };
