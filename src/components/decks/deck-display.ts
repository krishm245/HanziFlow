function getDeckNameError(name: string) {
  return name.trim() ? "" : "Enter a deck name.";
}

function formatCardCount(cardCount: number) {
  return `${cardCount} ${cardCount === 1 ? "card" : "cards"}`;
}

export { formatCardCount, getDeckNameError };
