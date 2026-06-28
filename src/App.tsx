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
import { OfflineSyncProvider } from "@/components/offline/offline-sync-provider";
import { OfflineDeckReviewView } from "@/components/review/offline-deck-review-view";
import { DeckReviewView } from "@/components/review/deck-review-view";
import { Toaster } from "@/components/ui/sonner";

function App() {
  return (
    <main className="min-h-svh bg-background text-foreground">
      <BrowserRouter>
        <Unauthenticated>
          <Routes>
            <Route element={<OfflineDeckReviewView />} path="/decks/:deckId/review" />
            <Route element={<SignedOutView />} path="*" />
          </Routes>
        </Unauthenticated>
        <Authenticated>
          <OfflineSyncProvider>
            <Routes>
              <Route element={<DecksView />} path="/" />
              <Route element={<DeckDetailView />} path="/decks/:deckId" />
              <Route element={<DeckReviewView />} path="/decks/:deckId/review" />
            </Routes>
            <Toaster />
          </OfflineSyncProvider>
        </Authenticated>
        <AuthLoading>
          <Routes>
            <Route element={<OfflineDeckReviewView />} path="/decks/:deckId/review" />
            <Route
              element={<FullPageMessage message="Loading your workspace" />}
              path="*"
            />
          </Routes>
        </AuthLoading>
        <AuthRefreshing>
          <Routes>
            <Route element={<OfflineDeckReviewView />} path="/decks/:deckId/review" />
            <Route
              element={<FullPageMessage message="Refreshing your session" />}
              path="*"
            />
          </Routes>
        </AuthRefreshing>
      </BrowserRouter>
    </main>
  );
}

export default App;
