import { useState } from "react";
import type { FormEvent, ReactNode } from "react";
import { Loader2, Save } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Doc, Id } from "../../../convex/_generated/dataModel";
import { getDeckNameError } from "./deck-display";

type RenameDeck = (args: {
  deckId: Id<"decks">;
  name: string;
}) => Promise<unknown>;

type RenameDeckDialogProps = {
  children: (props: { openRenameDialog: () => void }) => ReactNode;
  deck: Doc<"decks">;
  onRenameDeck: RenameDeck;
};

function RenameDeckDialog({
  children,
  deck,
  onRenameDeck,
}: RenameDeckDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState(deck.name);
  const [error, setError] = useState("");
  const [isRenaming, setIsRenaming] = useState(false);

  function openRenameDialog() {
    setName(deck.name);
    setError("");
    setIsOpen(true);
  }

  async function handleRenameDeck(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const deckName = name.trim();
    const nextError = getDeckNameError(deckName);

    if (nextError) {
      setError(nextError);
      return;
    }

    setIsRenaming(true);
    setError("");

    try {
      await onRenameDeck({ deckId: deck._id, name: deckName });
      setIsOpen(false);
    } catch (caught) {
      setError(
        caught instanceof Error ? caught.message : "Could not rename deck.",
      );
    } finally {
      setIsRenaming(false);
    }
  }

  function handleOpenChange(nextOpen: boolean) {
    setIsOpen(nextOpen);

    if (!nextOpen) {
      setName(deck.name);
      setError("");
    }
  }

  return (
    <>
      {children({ openRenameDialog })}
      <Dialog open={isOpen} onOpenChange={handleOpenChange}>
        <DialogContent className="border-[#d8e7df]">
          <DialogHeader>
            <DialogTitle>Rename deck</DialogTitle>
            <DialogDescription>
              Update the name shown in your HanziFlow deck list.
            </DialogDescription>
          </DialogHeader>

          <form className="grid gap-4" onSubmit={handleRenameDeck}>
            <div className="grid gap-2">
              <Label htmlFor={`rename-deck-${deck._id}`}>Deck name</Label>
              <Input
                id={`rename-deck-${deck._id}`}
                value={name}
                onChange={(event) => setName(event.target.value)}
                autoComplete="off"
                aria-invalid={Boolean(error)}
                lang="zh-CN"
              />
            </div>

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
                className="bg-[#183d32] hover:bg-[#245747]"
                type="submit"
                disabled={isRenaming}
              >
                {isRenaming ? <Loader2 className="animate-spin" /> : <Save />}
                Save changes
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}

export { RenameDeckDialog };
