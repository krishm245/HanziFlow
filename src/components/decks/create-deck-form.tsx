import { useState } from "react";
import type { FormEvent } from "react";
import { Loader2, Plus } from "lucide-react";
import type { FunctionReference } from "convex/server";
import { useMutation } from "convex/react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api } from "../../../convex/_generated/api";

type CreateDeckMutation = FunctionReference<
  "mutation",
  "public",
  { name: string },
  string
>;

function CreateDeckForm() {
  const createDeck = useMutation(api.decks.create as CreateDeckMutation);
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  async function handleCreateDeck(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const deckName = name.trim();

    if (!deckName) {
      setError("Enter a deck name.");
      return;
    }

    setIsCreating(true);
    setError("");

    try {
      await createDeck({ name: deckName });
      setName("");
    } catch (caught) {
      setError(
        caught instanceof Error ? caught.message : "Could not create deck.",
      );
    } finally {
      setIsCreating(false);
    }
  }

  return (
    <Card className="border-[#d8e7df] shadow-sm">
      <CardHeader>
        <CardTitle>New deck</CardTitle>
        <CardDescription>
          Name the idea you want to practice first.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form className="grid gap-3" onSubmit={handleCreateDeck}>
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

          <Button
            className="bg-[#183d32] hover:bg-[#245747]"
            type="submit"
            disabled={isCreating}
          >
            {isCreating ? <Loader2 className="animate-spin" /> : <Plus />}
            Create deck
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

export { CreateDeckForm };
