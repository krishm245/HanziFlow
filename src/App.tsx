import { useState } from "react";
import type { FormEvent } from "react";
import { SignInButton, UserButton } from "@clerk/react";
import { Loader2, Plus } from "lucide-react";
import {
  Authenticated,
  Unauthenticated,
  AuthLoading,
  AuthRefreshing,
  useMutation,
  useQuery,
} from "convex/react";
import { api } from "../convex/_generated/api";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

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

function SignedOutView() {
  return (
    <section className="mx-auto flex min-h-svh w-full max-w-md flex-col justify-center px-5">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Flashdeck</CardTitle>
          <CardDescription>
            Sign in to create and manage your study decks.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SignInButton mode="modal">
            <Button className="w-full" size="lg">
              Sign in
            </Button>
          </SignInButton>
        </CardContent>
      </Card>
    </section>
  );
}

function DecksView() {
  const decks = useQuery(api.decks.list);
  const createDeck = useMutation(api.decks.create);
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  async function handleCreateDeck(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const deckName = name.trim();

    if (!deckName) {
      setError("Enter a deck name.");
      return;
    }

    setIsCreating(true);
    setError("");

    try {
      await createDeck({ name: deckName });
      setName("");
    } catch (caught) {
      setError(
        caught instanceof Error ? caught.message : "Could not create deck.",
      );
    } finally {
      setIsCreating(false);
    }
  }

  return (
    <section className="mx-auto flex min-h-svh w-full max-w-5xl flex-col gap-6 px-5 py-5 sm:px-8">
      <header className="flex min-h-12 items-center justify-between gap-4 border-b pb-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-normal">Flashdeck</h1>
          <p className="text-muted-foreground text-sm">
            Create a deck to start building flashcards.
          </p>
        </div>
        <UserButton />
      </header>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,360px)_1fr]">
        <Card>
          <CardHeader>
            <CardTitle>New Deck</CardTitle>
            <CardDescription>
              Give your deck a short, recognizable name.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form className="grid gap-3" onSubmit={handleCreateDeck}>
              <div className="grid gap-2">
                <Label htmlFor="deck-name">Deck name</Label>
                <Input
                  id="deck-name"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="Mandarin basics"
                  autoComplete="off"
                  aria-invalid={Boolean(error)}
                />
              </div>

              {error ? (
                <p className="text-destructive text-sm" role="alert">
                  {error}
                </p>
              ) : null}

              <Button type="submit" disabled={isCreating}>
                {isCreating ? (
                  <Loader2 className="animate-spin" />
                ) : (
                  <Plus />
                )}
                Create deck
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Your Decks</CardTitle>
            <CardDescription>
              {decks ? `${decks.length} total` : "Loading decks"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {decks === undefined ? (
              <div className="text-muted-foreground flex items-center gap-2 text-sm">
                <Loader2 className="size-4 animate-spin" />
                Loading
              </div>
            ) : decks.length === 0 ? (
              <div className="border-border text-muted-foreground rounded-lg border border-dashed p-6 text-sm">
                No decks yet. Create your first deck from the form.
              </div>
            ) : (
              <div className="grid gap-2">
                {decks.map((deck) => (
                  <div
                    key={deck._id}
                    className="border-border flex min-h-16 items-center justify-between gap-3 rounded-lg border px-4 py-3"
                  >
                    <div className="min-w-0">
                      <p className="truncate font-medium">{deck.name}</p>
                      <p className="text-muted-foreground text-sm">
                        {deck.cardCount} cards
                      </p>
                    </div>
                    <time
                      className="text-muted-foreground shrink-0 text-xs"
                      dateTime={new Date(deck.updatedAt).toISOString()}
                    >
                      {new Date(deck.updatedAt).toLocaleDateString()}
                    </time>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </section>
  );
}

function FullPageMessage({ message }: { message: string }) {
  return (
    <section className="text-muted-foreground flex min-h-svh items-center justify-center gap-2 text-sm">
      <Loader2 className="size-4 animate-spin" />
      {message}
    </section>
  );
}

export default App;
