import { useState } from "react";
import type { FormEvent } from "react";
import { Loader2, Plus } from "lucide-react";
import { useMutation } from "convex/react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api } from "../../../convex/_generated/api";
import { getDeckNameError } from "./deck-display";

function CreateDeckDialog() {
  const createDeck = useMutation(api.decks.create);
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  async function handleCreateDeck(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const deckName = name.trim();
    const nextError = getDeckNameError(deckName);

    if (nextError) {
      setError(nextError);
      return;
    }

    setIsCreating(true);
    setError("");

    try {
      await createDeck({ name: deckName });
      setName("");
      setIsOpen(false);
    } catch (caught) {
      setError(
        caught instanceof Error ? caught.message : "Could not create deck.",
      );
    } finally {
      setIsCreating(false);
    }
  }

  function handleOpenChange(nextOpen: boolean) {
    setIsOpen(nextOpen);

    if (!nextOpen) {
      setName("");
      setError("");
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button
          className="bg-[#183d32] hover:bg-[#245747]"
          size="icon"
          aria-label="Create deck"
        >
          <Plus />
        </Button>
      </DialogTrigger>
      <DialogContent className="border-[#d8e7df]">
        <DialogHeader>
          <DialogTitle>Create deck</DialogTitle>
          <DialogDescription>
            Name the character set you want to practice next.
          </DialogDescription>
        </DialogHeader>

        <form className="grid gap-4" onSubmit={handleCreateDeck}>
          <div className="grid gap-2">
            <Label htmlFor="deck-name">Deck name</Label>
            <Input
              id="deck-name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="HSK 1 verbs"
              autoComplete="off"
              aria-invalid={Boolean(error)}
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
              disabled={isCreating}
            >
              {isCreating ? <Loader2 className="animate-spin" /> : <Plus />}
              Create deck
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export { CreateDeckDialog };
