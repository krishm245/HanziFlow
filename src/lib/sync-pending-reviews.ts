import type { Id } from "../../convex/_generated/dataModel";
import {
  getPendingReviewEvents,
  removePendingReviewEvents,
  type PendingReviewResult,
} from "@/lib/offline-storage";

type RecordReview = (args: {
  cardId: Id<"cards">;
  result: PendingReviewResult;
}) => Promise<unknown>;

async function syncPendingReviewEvents(recordReview: RecordReview) {
  const pendingEvents = getPendingReviewEvents();
  const syncedIds: string[] = [];

  for (const event of pendingEvents) {
    await recordReview({
      cardId: event.cardId,
      result: event.result,
    });
    syncedIds.push(event.id);
  }

  removePendingReviewEvents(syncedIds);
  return syncedIds.length;
}

export { syncPendingReviewEvents };
export type { RecordReview };
