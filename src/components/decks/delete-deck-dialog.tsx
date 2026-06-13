import { useState } from "react";
import type { ReactNode } from "react";
import { Loader2, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { Doc, Id } from "../../../convex/_generated/dataModel";
import { formatCardCount } from "./deck-display";

type RemoveDeck = (args: { deckId: Id<"decks"> }) => Promise<unknown>;

type DeleteDeckDialogProps = {
  children: (props: { openDeleteDialog: () => void }) => ReactNode;
  deck: Doc<"decks">;
  onRemoveDeck: RemoveDeck;
};

function DeleteDeckDialog({
  children,
  deck,
  onRemoveDeck,
}: DeleteDeckDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  function openDeleteDialog() {
    setError("");
    setIsOpen(true);
  }

  async function handleDeleteDeck() {
    setIsDeleting(true);
    setError("");

    try {
      await onRemoveDeck({ deckId: deck._id });
      setIsOpen(false);
    } catch (caught) {
      setError(
        caught instanceof Error ? caught.message : "Could not delete deck.",
      );
    } finally {
      setIsDeleting(false);
    }
  }

  function handleOpenChange(nextOpen: boolean) {
    setIsOpen(nextOpen);

    if (!nextOpen) {
      setError("");
    }
  }

  return (
    <>
      {children({ openDeleteDialog })}
      <Dialog open={isOpen} onOpenChange={handleOpenChange}>
        <DialogContent className="border-[#f0c9c3]">
          <DialogHeader>
            <DialogTitle>Delete deck</DialogTitle>
            <DialogDescription>
              Delete "{deck.name}" and all {formatCardCount(deck.cardCount)} in
              it. This cannot be undone.
            </DialogDescription>
          </DialogHeader>

          {error ? (
            <p className="text-destructive text-sm" role="alert">
              {error}
            </p>
          ) : null}

          <div className="flex justify-end gap-2">
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </DialogClose>
            <Button
              type="button"
              variant="destructive"
              disabled={isDeleting}
              onClick={handleDeleteDeck}
            >
              {isDeleting ? <Loader2 className="animate-spin" /> : <Trash2 />}
              Delete deck
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

export { DeleteDeckDialog };
