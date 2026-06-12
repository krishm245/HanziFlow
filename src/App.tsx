import {
  Authenticated,
  Unauthenticated,
  AuthLoading,
  AuthRefreshing,
} from "convex/react";

import { FullPageMessage } from "@/components/auth/full-page-message";
import { SignedOutView } from "@/components/auth/signed-out-view";
import { DecksView } from "@/components/decks/decks-view";

function App() {
  return (
    <main className="min-h-svh bg-background text-foreground">
      <Unauthenticated>
        <SignedOutView />
      </Unauthenticated>
      <Authenticated>
        <DecksView />
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
