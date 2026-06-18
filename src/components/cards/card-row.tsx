import { useRef, useState } from "react";
import type { FormEvent } from "react";
import { Loader2, MoreHorizontal, Pencil, Save, Trash2, X } from "lucide-react";
import { toast } from "sonner";

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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Doc, Id } from "../../../convex/_generated/dataModel";
import { formatReviewStatus, getCardFieldError } from "./card-display";
import { DeleteCardDialog } from "./delete-card-dialog";
import { PinyinKeyboard } from "./pinyin-keyboard";

type UpdateCard = (args: {
  cardId: Id<"cards">;
  english: string;
  pinyin: string;
}) => Promise<unknown>;

type RemoveCard = (args: { cardId: Id<"cards"> }) => Promise<unknown>;

type CardRowProps = {
  card: Doc<"cards">;
  onRemoveCard: RemoveCard;
  onUpdateCard: UpdateCard;
};

function CardRow({ card, onRemoveCard, onUpdateCard }: CardRowProps) {
  const pinyinInputRef = useRef<HTMLInputElement>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [pinyin, setPinyin] = useState(card.pinyin);
  const [english, setEnglish] = useState(card.english);
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  function startEditing() {
    setPinyin(card.pinyin);
    setEnglish(card.english);
    setError("");
    setIsEditing(true);
  }

  function cancelEditing() {
    setPinyin(card.pinyin);
    setEnglish(card.english);
    setError("");
    setIsEditing(false);
  }

  async function handleUpdateCard(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextError = getCardFieldError(pinyin, english);

    if (nextError) {
      setError(nextError);
      return;
    }

    const nextPinyin = pinyin.trim();
    const nextEnglish = english.trim();
    setIsSaving(true);
    setError("");

    try {
      await onUpdateCard({
        cardId: card._id,
        english: nextEnglish,
        pinyin: nextPinyin,
      });
      setIsEditing(false);
      toast.success("Card updated");
    } catch (caught) {
      setError(
        caught instanceof Error ? caught.message : "Could not update card.",
      );
    } finally {
      setIsSaving(false);
    }
  }

  if (isEditing) {
    return (
      <Card className="h-full w-full border-[#91b8a7] shadow-sm">
        <CardContent className="pt-5">
          <form className="grid gap-4" onSubmit={handleUpdateCard}>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor={`card-${card._id}-pinyin`}>Pinyin</Label>
                <Input
                  id={`card-${card._id}-pinyin`}
                  ref={pinyinInputRef}
                  value={pinyin}
                  onChange={(event) => setPinyin(event.target.value)}
                  autoComplete="off"
                  aria-invalid={Boolean(error && !pinyin.trim())}
                  lang="zh-CN"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor={`card-${card._id}-english`}>
                  English meaning
                </Label>
                <Input
                  id={`card-${card._id}-english`}
                  value={english}
                  onChange={(event) => setEnglish(event.target.value)}
                  autoComplete="off"
                  aria-invalid={Boolean(
                    error && pinyin.trim() && !english.trim(),
                  )}
                />
              </div>
            </div>

            <PinyinKeyboard
              inputRef={pinyinInputRef}
              onValueChange={setPinyin}
              value={pinyin}
            />

            {error ? (
              <p className="text-destructive text-sm" role="alert">
                {error}
              </p>
            ) : null}

            <div className="flex flex-wrap justify-end gap-2">
              <Button type="button" variant="outline" onClick={cancelEditing}>
                <X />
                Cancel
              </Button>
              <Button
                className="bg-[#183d32] hover:bg-[#245747]"
                disabled={isSaving}
                type="submit"
              >
                {isSaving ? <Loader2 className="animate-spin" /> : <Save />}
                Save changes
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full w-full border-[#d8e7df] shadow-sm">
      <CardHeader className="gap-4">
        <div className="min-w-0">
          <CardTitle className="truncate text-xl text-[#183d32]">
            {card.pinyin}
          </CardTitle>
          <CardDescription className="mt-1 text-base text-foreground">
            {card.english}
          </CardDescription>
        </div>
        <CardActions
          card={card}
          onRemoveCard={onRemoveCard}
          onStartEditing={startEditing}
        />
      </CardHeader>
      <CardContent>
        <div className="grid gap-2 border-t border-[#d8e7df] pt-4 text-xs text-[#49675b]">
          <span>
            {formatReviewStatus(
              card.knownCount,
              card.needsPracticeCount,
              card.lastReviewResult,
            )}
          </span>
          <time dateTime={new Date(card.updatedAt).toISOString()}>
            Updated {new Date(card.updatedAt).toLocaleDateString()}
          </time>
        </div>
      </CardContent>
    </Card>
  );
}

function CardActions({
  card,
  onRemoveCard,
  onStartEditing,
}: {
  card: Doc<"cards">;
  onRemoveCard: RemoveCard;
  onStartEditing: () => void;
}) {
  return (
    <div className="flex justify-end">
      <DeleteCardDialog card={card} onRemoveCard={onRemoveCard}>
        {({ openDeleteDialog }) => (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                aria-label={`Manage ${card.pinyin}`}
                className="text-[#49675b] hover:bg-[#e7f3ed] hover:text-[#183d32]"
                size="icon"
                type="button"
                variant="ghost"
              >
                <MoreHorizontal />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Card actions</DropdownMenuLabel>
              <DropdownMenuItem onSelect={onStartEditing}>
                <Pencil />
                Edit
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
      </DeleteCardDialog>
    </div>
  );
}

export { CardRow };
