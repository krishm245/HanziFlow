import { useState } from "react";
import type { ReactNode } from "react";
import { Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";

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

type RemoveCard = (args: { cardId: Id<"cards"> }) => Promise<unknown>;

type DeleteCardDialogProps = {
  card: Doc<"cards">;
  children: (props: { openDeleteDialog: () => void }) => ReactNode;
  onRemoveCard: RemoveCard;
};

function DeleteCardDialog({
  card,
  children,
  onRemoveCard,
}: DeleteCardDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState("");

  function openDeleteDialog() {
    setError("");
    setIsOpen(true);
  }

  async function handleDeleteCard() {
    setIsDeleting(true);
    setError("");

    try {
      await onRemoveCard({ cardId: card._id });
      setIsOpen(false);
      toast.success("Card deleted");
    } catch (caught) {
      setError(
        caught instanceof Error ? caught.message : "Could not delete card.",
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
            <DialogTitle>Delete card</DialogTitle>
            <DialogDescription>
              Delete "{card.pinyin}" - {card.english}. This cannot be undone.
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
              disabled={isDeleting}
              onClick={handleDeleteCard}
              type="button"
              variant="destructive"
            >
              {isDeleting ? <Loader2 className="animate-spin" /> : <Trash2 />}
              Delete card
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

export { DeleteCardDialog };
