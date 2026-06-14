import {
  Authenticated,
  Unauthenticated,
  AuthLoading,
  AuthRefreshing,
} from "convex/react";
import { BrowserRouter, Route, Routes } from "react-router";

import { FullPageMessage } from "@/components/auth/full-page-message";
import { DeckDetailView } from "@/components/cards/deck-detail-view";
import { SignedOutView } from "@/components/auth/signed-out-view";
import { DecksView } from "@/components/decks/decks-view";
import { Toaster } from "@/components/ui/sonner";

function App() {
  return (
    <main className="min-h-svh bg-background text-foreground">
      <Unauthenticated>
        <SignedOutView />
      </Unauthenticated>
      <Authenticated>
        <BrowserRouter>
          <Routes>
            <Route element={<DecksView />} path="/" />
            <Route element={<DeckDetailView />} path="/decks/:deckId" />
          </Routes>
        </BrowserRouter>
        <Toaster />
      </Authenticated>
      <AuthLoading>
        <FullPageMessage message="Loading your workspace" />
      </AuthLoading>
      <AuthRefreshing>
        <FullPageMessage message="Refreshing your session" />
      </AuthRefreshing>
    </main>
  );
}

export default App;
