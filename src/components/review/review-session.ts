type ReviewCard = {
  _id: string;
  english: string;
  pinyin: string;
};

type ReviewSession<TCard extends ReviewCard> = {
  allCards: TCard[];
  correctCardIds: string[];
  currentCard: TCard | null;
  isRevealed: boolean;
  missedCardIds: string[];
  queue: TCard[];
};

function shuffleCards<TCard>(cards: TCard[], random = Math.random) {
  const shuffled = [...cards];

  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1));
    [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
  }

  return shuffled;
}

function createReviewSession<TCard extends ReviewCard>(
  cards: TCard[],
  random = Math.random,
): ReviewSession<TCard> {
  const shuffled = shuffleCards(cards, random);
  const [currentCard = null, ...queue] = shuffled;

  return {
    allCards: cards,
    correctCardIds: [],
    currentCard,
    isRevealed: false,
    missedCardIds: [],
    queue,
  };
}

function revealCurrentCard<TCard extends ReviewCard>(
  session: ReviewSession<TCard>,
): ReviewSession<TCard> {
  return {
    ...session,
    isRevealed: true,
  };
}

function markCurrentCorrect<TCard extends ReviewCard>(
  session: ReviewSession<TCard>,
): ReviewSession<TCard> {
  if (!session.currentCard) {
    return session;
  }

  const [nextCard = null, ...nextQueue] = session.queue;
  const wasMissed = session.missedCardIds.includes(session.currentCard._id);
  const nextCorrectCardIds =
    wasMissed || session.correctCardIds.includes(session.currentCard._id)
      ? session.correctCardIds
      : [...session.correctCardIds, session.currentCard._id];

  return {
    ...session,
    correctCardIds: nextCorrectCardIds,
    currentCard: nextCard,
    isRevealed: false,
    queue: nextQueue,
  };
}

function markCurrentNeedsReview<TCard extends ReviewCard>(
  session: ReviewSession<TCard>,
  random = Math.random,
): ReviewSession<TCard> {
  if (!session.currentCard) {
    return session;
  }

  const nextQueue = [...session.queue];
  const insertAt = Math.floor(random() * (nextQueue.length + 1));
  nextQueue.splice(insertAt, 0, session.currentCard);

  const [nextCard = null, ...remainingQueue] = nextQueue;
  const nextMissedCardIds = session.missedCardIds.includes(session.currentCard._id)
    ? session.missedCardIds
    : [...session.missedCardIds, session.currentCard._id];

  return {
    ...session,
    currentCard: nextCard,
    isRevealed: false,
    missedCardIds: nextMissedCardIds,
    queue: remainingQueue,
  };
}

function getReviewSummary<TCard extends ReviewCard>(session: ReviewSession<TCard>) {
  const missedCardIds = new Set(session.missedCardIds);
  const correctCardIds = new Set(session.correctCardIds);

  return {
    correctCards: session.allCards.filter(
      (card) => correctCardIds.has(card._id) && !missedCardIds.has(card._id),
    ),
    needsReviewCards: session.allCards.filter((card) =>
      missedCardIds.has(card._id),
    ),
  };
}

function isReviewComplete<TCard extends ReviewCard>(session: ReviewSession<TCard>) {
  return session.currentCard === null;
}

export {
  createReviewSession,
  getReviewSummary,
  isReviewComplete,
  markCurrentCorrect,
  markCurrentNeedsReview,
  revealCurrentCard,
  shuffleCards,
};
export type { ReviewCard, ReviewSession };
