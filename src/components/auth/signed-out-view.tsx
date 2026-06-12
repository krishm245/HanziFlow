import { SignInButton } from "@clerk/react";
import { ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

function SignedOutView() {
  return (
    <section className="mx-auto grid min-h-svh w-full max-w-5xl items-center gap-6 px-5 py-10 md:grid-cols-[1fr_360px]">
      <div className="grid gap-6">
        <div className="max-w-2xl">
          <p className="text-sm font-medium text-[#1f7a5a]">HanziFlow</p>
          <h1 className="mt-3 text-5xl font-semibold tracking-normal text-balance sm:text-6xl">
            Build decks that keep characters moving.
          </h1>
          <p className="text-muted-foreground mt-5 max-w-xl text-base leading-7">
            Create compact study decks for Chinese vocabulary, then fill them
            with the characters, pinyin, and meanings you want to practice.
          </p>
        </div>
      </div>

      <Card className="border-[#d8e7df] shadow-sm">
        <CardHeader>
          <CardTitle className="text-xl">Start your workspace</CardTitle>
          <CardDescription>
            Sign in to create and manage your study decks.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SignInButton mode="modal">
            <Button className="w-full bg-[#183d32] hover:bg-[#245747]" size="lg">
              Sign in
              <ArrowRight />
            </Button>
          </SignInButton>
        </CardContent>
      </Card>
    </section>
  );
}

export { SignedOutView };
