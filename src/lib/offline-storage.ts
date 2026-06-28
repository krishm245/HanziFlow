import type { Doc, Id } from "../../convex/_generated/dataModel";

const OFFLINE_DECKS_KEY = "hanziflow.offlineDecks.v1";
const PENDING_REVIEWS_KEY = "hanziflow.pendingReviews.v1";
const OFFLINE_EVENT = "hanziflow:offline-storage";
const OFFLINE_TTL_MS = 7 * 24 * 60 * 60 * 1000;

type OfflineDeck = {
  cards: Array<Doc<"cards">>;
  deck: Doc<"decks">;
  downloadedAt: number;
  expiresAt: number;
};

type PendingReviewResult = "known" | "needsPractice";

type PendingReviewEvent = {
  cardId: Id<"cards">;
  createdAt: number;
  deckId: Id<"decks">;
  id: string;
  result: PendingReviewResult;
};

type OfflineDeckMap = Record<string, OfflineDeck>;

function hasStorage() {
  return typeof window !== "undefined" && Boolean(window.localStorage);
}

function readJson<TValue>(key: string, fallback: TValue): TValue {
  if (!hasStorage()) {
    return fallback;
  }

  const raw = window.localStorage.getItem(key);
  if (!raw) {
    return fallback;
  }

  try {
    return JSON.parse(raw) as TValue;
  } catch {
    return fallback;
  }
}

function writeJson<TValue>(key: string, value: TValue) {
  if (!hasStorage()) {
    return;
  }

  window.localStorage.setItem(key, JSON.stringify(value));
}

function emitOfflineStorageChange() {
  if (typeof window === "undefined") {
    return;
  }

  window.dispatchEvent(new Event(OFFLINE_EVENT));
}

function pruneExpiredDecks(now = Date.now()) {
  const decks = readJson<OfflineDeckMap>(OFFLINE_DECKS_KEY, {});
  const nextDecks = Object.fromEntries(
    Object.entries(decks).filter(([, value]) => value.expiresAt > now),
  );

  if (Object.keys(nextDecks).length !== Object.keys(decks).length) {
    writeJson(OFFLINE_DECKS_KEY, nextDecks);
    emitOfflineStorageChange();
  }

  return nextDecks;
}

function saveOfflineDeck(
  deck: Doc<"decks">,
  cards: Array<Doc<"cards">>,
  now = Date.now(),
) {
  const decks = pruneExpiredDecks(now);
  decks[deck._id] = {
    cards,
    deck,
    downloadedAt: now,
    expiresAt: now + OFFLINE_TTL_MS,
  };
  writeJson(OFFLINE_DECKS_KEY, decks);
  emitOfflineStorageChange();
}

function getOfflineDeck(deckId: Id<"decks">, now = Date.now()) {
  const decks = pruneExpiredDecks(now);
  return decks[deckId] ?? null;
}

function getOfflineDecks(now = Date.now()) {
  return Object.values(pruneExpiredDecks(now)).sort(
    (left, right) => right.deck.updatedAt - left.deck.updatedAt,
  );
}

function getDownloadedDeckIds(now = Date.now()) {
  return new Set(Object.keys(pruneExpiredDecks(now)));
}

function removeOfflineDeck(deckId: Id<"decks">) {
  const decks = readJson<OfflineDeckMap>(OFFLINE_DECKS_KEY, {});
  const nextDecks = { ...decks };
  delete nextDecks[deckId];
  const pending = getPendingReviewEvents().filter(
    (event) => event.deckId !== deckId,
  );

  writeJson(OFFLINE_DECKS_KEY, nextDecks);
  writeJson(PENDING_REVIEWS_KEY, pending);
  emitOfflineStorageChange();
}

function getPendingReviewEvents() {
  return readJson<PendingReviewEvent[]>(PENDING_REVIEWS_KEY, []);
}

function queuePendingReviewEvent(
  event: Omit<PendingReviewEvent, "createdAt" | "id">,
  now = Date.now(),
) {
  const pending = getPendingReviewEvents();
  const nextEvent: PendingReviewEvent = {
    ...event,
    createdAt: now,
    id: `${event.cardId}:${event.result}:${now}:${pending.length}`,
  };

  writeJson(PENDING_REVIEWS_KEY, [...pending, nextEvent]);
  emitOfflineStorageChange();
  return nextEvent;
}

function removePendingReviewEvents(eventIds: string[]) {
  const ids = new Set(eventIds);
  const pending = getPendingReviewEvents().filter((event) => !ids.has(event.id));
  writeJson(PENDING_REVIEWS_KEY, pending);
  emitOfflineStorageChange();
}

function clearOfflineStorage() {
  if (!hasStorage()) {
    return;
  }

  window.localStorage.removeItem(OFFLINE_DECKS_KEY);
  window.localStorage.removeItem(PENDING_REVIEWS_KEY);
  emitOfflineStorageChange();
}

function subscribeToOfflineStorage(listener: () => void) {
  if (typeof window === "undefined") {
    return () => {};
  }

  window.addEventListener(OFFLINE_EVENT, listener);
  window.addEventListener("storage", listener);

  return () => {
    window.removeEventListener(OFFLINE_EVENT, listener);
    window.removeEventListener("storage", listener);
  };
}

export {
  OFFLINE_TTL_MS,
  clearOfflineStorage,
  getDownloadedDeckIds,
  getOfflineDeck,
  getOfflineDecks,
  getPendingReviewEvents,
  queuePendingReviewEvent,
  removeOfflineDeck,
  removePendingReviewEvents,
  saveOfflineDeck,
  subscribeToOfflineStorage,
};
export type { OfflineDeck, PendingReviewEvent, PendingReviewResult };
