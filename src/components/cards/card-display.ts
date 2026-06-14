function getCardFieldError(pinyin: string, english: string) {
  if (!pinyin.trim()) {
    return "Enter pinyin.";
  }

  if (!english.trim()) {
    return "Enter an English meaning.";
  }

  return "";
}

function formatReviewStatus(
  knownCount: number,
  needsPracticeCount: number,
  lastReviewResult?: "known" | "needsPractice",
) {
  if (!lastReviewResult) {
    return "Unreviewed";
  }

  const result =
    lastReviewResult === "known" ? "Last marked known" : "Needs practice";
  return `${result} - ${knownCount} known / ${needsPracticeCount} practice`;
}

export { formatReviewStatus, getCardFieldError };
