import { Loader2 } from "lucide-react";

import type { Doc, Id } from "../../../convex/_generated/dataModel";
import { CardRow } from "./card-row";

type UpdateCard = (args: {
  cardId: Id<"cards">;
  english: string;
  pinyin: string;
}) => Promise<unknown>;

type RemoveCard = (args: { cardId: Id<"cards"> }) => Promise<unknown>;

type CardListProps = {
  cards: Array<Doc<"cards">> | undefined;
  onRemoveCard: RemoveCard;
  onUpdateCard: UpdateCard;
};

function CardList({ cards, onRemoveCard, onUpdateCard }: CardListProps) {
  if (cards === undefined) {
    return (
      <div className="text-muted-foreground flex min-h-36 items-center justify-center gap-2 rounded-lg border border-dashed text-sm">
        <Loader2 className="size-4 animate-spin" />
        Loading cards
      </div>
    );
  }

  if (cards.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-[#d8e7df] bg-[#f6fbf8] p-8 text-sm text-[#49675b]">
        No saved cards yet. Add the first one above.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-[repeat(auto-fit,minmax(17rem,20rem))] justify-start gap-4">
      {cards.map((card) => (
        <CardRow
          card={card}
          key={card._id}
          onRemoveCard={onRemoveCard}
          onUpdateCard={onUpdateCard}
        />
      ))}
    </div>
  );
}

export { CardList };
