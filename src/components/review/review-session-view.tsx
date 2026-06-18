import { useState } from "react";
import { ArrowLeft, Check, RotateCcw } from "lucide-react";
import { Link } from "react-router";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Doc, Id } from "../../../convex/_generated/dataModel";
import {
  createReviewSession,
  getReviewSummary,
  isReviewComplete,
  markCurrentCorrect,
  markCurrentNeedsReview,
  revealCurrentCard,
  type ReviewSession,
} from "./review-session";

type RecordReview = (args: {
  cardId: Id<"cards">;
  result: "known" | "needsPractice";
}) => Promise<unknown>;

type ReviewSessionViewProps = {
  cards: Array<Doc<"cards">>;
  deck: Doc<"decks">;
  onRecordReview: RecordReview;
  random?: () => number;
};

function ReviewSessionView({
  cards,
  deck,
  onRecordReview,
  random = Math.random,
}: ReviewSessionViewProps) {
  const [session, setSession] = useState<ReviewSession<Doc<"cards">>>(() =>
    createReviewSession(cards, random),
  );
  const [error, setError] = useState("");
  const [isMarking, setIsMarking] = useState(false);

  const completed = isReviewComplete(session);
  const progressTotal = cards.length;
  const completedCount = completed
    ? progressTotal
    : Math.max(0, progressTotal - session.queue.length - 1);
  const progressPercent =
    progressTotal === 0 ? 0 : Math.round((completedCount / progressTotal) * 100);

  function revealCard() {
    if (!session.currentCard || session.isRevealed) {
      return;
    }

    setSession((current) => revealCurrentCard(current));
  }

  async function markCorrect() {
    if (!session.currentCard) {
      return;
    }

    setIsMarking(true);
    setError("");

    try {
      await onRecordReview({
        cardId: session.currentCard._id,
        result: "known",
      });
      setSession((current) => markCurrentCorrect(current));
    } catch (caught) {
      setError(
        caught instanceof Error ? caught.message : "Could not record review.",
      );
    } finally {
      setIsMarking(false);
    }
  }

  async function markNeedsReview() {
    if (!session.currentCard) {
      return;
    }

    setIsMarking(true);
    setError("");

    try {
      await onRecordReview({
        cardId: session.currentCard._id,
        result: "needsPractice",
      });
      setSession((current) => markCurrentNeedsReview(current, random));
    } catch (caught) {
      setError(
        caught instanceof Error ? caught.message : "Could not record review.",
      );
    } finally {
      setIsMarking(false);
    }
  }

  if (completed) {
    return <ReviewSummary deck={deck} session={session} />;
  }

  const currentCard = session.currentCard;

  if (!currentCard) {
    return null;
  }

  return (
    <div className="mx-auto grid w-full max-w-3xl gap-6">
      <div className="grid gap-3">
        <Button asChild className="w-fit" variant="outline">
          <Link to="/">
            <ArrowLeft />
            Back to decks
          </Link>
        </Button>
        <div className="grid gap-2">
          <div className="flex items-center justify-between gap-4 text-sm text-[#49675b]">
            <span>{deck.name}</span>
            <span>
              {completedCount + 1} of {progressTotal}
            </span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-[#e7f3ed]">
            <div
              className="h-full rounded-full bg-[#183d32] transition-all"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      <button
        aria-label={
          session.isRevealed
            ? `English meaning: ${currentCard.english}`
            : `Pinyin: ${currentCard.pinyin}`
        }
        className="group min-h-[22rem] rounded-xl border border-[#d8e7df] bg-white p-6 text-left shadow-sm outline-none transition-all hover:border-[#91b8a7] hover:bg-[#f6fbf8] focus-visible:ring-3 focus-visible:ring-ring sm:p-10"
        onClick={revealCard}
        type="button"
      >
        <div className="grid h-full min-h-[18rem] place-items-center">
          <div className="grid gap-4 text-center transition duration-200 group-active:scale-[0.99]">
            <p className="text-sm font-medium uppercase tracking-[0.18em] text-[#49675b]">
              {session.isRevealed ? "Meaning" : "Pinyin"}
            </p>
            <p className="text-5xl font-semibold tracking-normal text-[#183d32] sm:text-7xl">
              {session.isRevealed ? currentCard.english : currentCard.pinyin}
            </p>
            {!session.isRevealed ? (
              <p className="text-sm text-[#49675b]">Tap the card to reveal</p>
            ) : null}
          </div>
        </div>
      </button>

      {session.isRevealed ? (
        <div className="grid gap-3 sm:grid-cols-2">
          <Button
            className="h-12 border-[#f0c9c3] text-destructive hover:bg-destructive/10"
            disabled={isMarking}
            onClick={markNeedsReview}
            type="button"
            variant="outline"
          >
            <RotateCcw />
            Needs review
          </Button>
          <Button
            className="h-12 bg-[#183d32] hover:bg-[#245747]"
            disabled={isMarking}
            onClick={markCorrect}
            type="button"
          >
            <Check />
            Correct
          </Button>
        </div>
      ) : null}

      {error ? (
        <p className="text-destructive text-sm" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}

function ReviewSummary({
  deck,
  session,
}: {
  deck: Doc<"decks">;
  session: ReviewSession<Doc<"cards">>;
}) {
  const summary = getReviewSummary(session);

  return (
    <div className="mx-auto grid w-full max-w-4xl gap-6">
      <div className="rounded-xl border border-[#d8e7df] bg-[#f6fbf8] p-6 shadow-sm sm:p-8">
        <p className="text-sm font-medium uppercase tracking-[0.18em] text-[#49675b]">
          Review complete
        </p>
        <h1 className="mt-3 text-3xl font-semibold text-[#183d32]">
          {deck.name}
        </h1>
        <p className="mt-2 text-sm text-[#49675b]">
          {summary.correctCards.length} correct,{" "}
          {summary.needsReviewCards.length} need review.
        </p>
      </div>

      <div className="grid items-start gap-4 md:grid-cols-2">
        <SummaryColumn
          cards={summary.correctCards}
          emptyMessage="No cards were marked correct without a miss."
          title="Correct"
        />
        <SummaryColumn
          cards={summary.needsReviewCards}
          emptyMessage="No cards need review."
          tone="needsReview"
          title="Needs review"
        />
      </div>

      <Button asChild className="w-fit bg-[#183d32] hover:bg-[#245747]">
        <Link to="/">
          <ArrowLeft />
          Back to decks
        </Link>
      </Button>
    </div>
  );
}

function SummaryColumn({
  cards,
  emptyMessage,
  tone = "default",
  title,
}: {
  cards: Array<Doc<"cards">>;
  emptyMessage: string;
  tone?: "default" | "needsReview";
  title: string;
}) {
  const isNeedsReview = tone === "needsReview";

  return (
    <section
      className={cn(
        "flex flex-col rounded-xl border bg-white p-5 shadow-sm",
        isNeedsReview ? "gap-2 border-[#f0c9c3]" : "gap-3 border-[#d8e7df]",
      )}
    >
      <h2
        className={cn(
          "font-semibold",
          isNeedsReview ? "text-[#8f2f28]" : "text-[#183d32]",
        )}
      >
        {title}
      </h2>
      {cards.length === 0 ? (
        <p className="text-sm text-[#49675b]">{emptyMessage}</p>
      ) : (
        <div className="grid content-start gap-2">
          {cards.map((card) => (
            <div
              className={cn(
                "rounded-lg border p-3",
                isNeedsReview
                  ? "border-[#f0c9c3] bg-[#fff6f5]"
                  : "border-[#d8e7df] bg-[#f6fbf8]",
              )}
              key={card._id}
            >
              <p
                className={cn(
                  "font-medium",
                  isNeedsReview ? "text-[#8f2f28]" : "text-[#183d32]",
                )}
              >
                {card.pinyin}
              </p>
              <p
                className={cn(
                  "text-sm",
                  isNeedsReview ? "text-[#9f514b]" : "text-[#49675b]",
                )}
              >
                {card.english}
              </p>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

export { ReviewSessionView };
