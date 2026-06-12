import { useQuery } from "convex/react";

import { CreateDeckForm } from "@/components/decks/create-deck-form";
import { DeckList } from "@/components/decks/deck-list";
import { AppHeader } from "@/components/layout/app-header";
import { BrandMark } from "@/components/layout/brand-mark";
import { api } from "../../../convex/_generated/api";

function DecksView() {
  const decks = useQuery(api.decks.list);

  return (
    <section className="mx-auto flex min-h-svh w-full max-w-6xl flex-col gap-6 px-5 py-5 sm:px-8">
      <AppHeader />

      <div className="grid gap-5 lg:grid-cols-[280px_minmax(0,360px)_1fr]">
        <aside className="hidden rounded-lg border border-[#d8e7df] bg-[#f6fbf8] p-5 lg:block">
          <BrandMark />
          <p className="mt-6 text-sm leading-6 text-[#49675b]">
            Keep each deck small enough to review in one sitting. HanziFlow is
            built around steady character practice, not oversized collections.
          </p>
        </aside>
        <CreateDeckForm />
        <DeckList decks={decks} />
      </div>
    </section>
  );
}

export { DecksView };
