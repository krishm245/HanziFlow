import { useQuery } from "convex/react";

import { CreateDeckDialog } from "@/components/decks/create-deck-dialog";
import { DeckList } from "@/components/decks/deck-list";
import { AppHeader } from "@/components/layout/app-header";
import { OfflineStatusBanner } from "@/components/offline/offline-status-banner";
import { api } from "../../../convex/_generated/api";

function DecksView() {
  const decks = useQuery(api.decks.list);

  return (
    <section className="mx-auto flex min-h-svh w-full max-w-6xl flex-col gap-7 px-5 py-5 sm:px-8">
      <AppHeader />
      <OfflineStatusBanner />

      <DeckList action={<CreateDeckDialog />} decks={decks} />
    </section>
  );
}

export { DecksView };
