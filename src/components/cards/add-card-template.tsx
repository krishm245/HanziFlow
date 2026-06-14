import { useState } from "react";
import type { FormEvent } from "react";
import { Loader2, Plus } from "lucide-react";
import { toast } from "sonner";

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
import type { Id } from "../../../convex/_generated/dataModel";
import { getCardFieldError } from "./card-display";

type CreateCard = (args: {
  deckId: Id<"decks">;
  english: string;
  pinyin: string;
}) => Promise<unknown>;

type AddCardTemplateProps = {
  deckId: Id<"decks">;
  onCreateCard: CreateCard;
};

function AddCardTemplate({ deckId, onCreateCard }: AddCardTemplateProps) {
  const [pinyin, setPinyin] = useState("");
  const [english, setEnglish] = useState("");
  const [error, setError] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  async function handleCreateCard(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextError = getCardFieldError(pinyin, english);

    if (nextError) {
      setError(nextError);
      return;
    }

    const nextPinyin = pinyin.trim();
    const nextEnglish = english.trim();
    setIsCreating(true);
    setError("");

    try {
      await onCreateCard({
        deckId,
        english: nextEnglish,
        pinyin: nextPinyin,
      });
      setPinyin("");
      setEnglish("");
      toast.success("Card added");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not add card.");
    } finally {
      setIsCreating(false);
    }
  }

  return (
    <Card className="border-[#91b8a7] bg-[#f6fbf8] shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg">Add card</CardTitle>
        <CardDescription>
          Start with pinyin now. The custom keyboard comes next.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form className="grid gap-4" onSubmit={handleCreateCard}>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="new-card-pinyin">Pinyin</Label>
              <Input
                id="new-card-pinyin"
                value={pinyin}
                onChange={(event) => setPinyin(event.target.value)}
                placeholder="xue"
                autoComplete="off"
                aria-invalid={Boolean(error && !pinyin.trim())}
                lang="zh-CN"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="new-card-english">English meaning</Label>
              <Input
                id="new-card-english"
                value={english}
                onChange={(event) => setEnglish(event.target.value)}
                placeholder="study"
                autoComplete="off"
                aria-invalid={Boolean(error && pinyin.trim() && !english.trim())}
              />
            </div>
          </div>

          {error ? (
            <p className="text-destructive text-sm" role="alert">
              {error}
            </p>
          ) : null}

          <div className="flex justify-end">
            <Button
              className="bg-[#183d32] hover:bg-[#245747]"
              disabled={isCreating}
              type="submit"
            >
              {isCreating ? <Loader2 className="animate-spin" /> : <Plus />}
              Add card
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

export { AddCardTemplate };
