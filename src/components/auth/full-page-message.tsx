import { Loader2 } from "lucide-react";

type FullPageMessageProps = {
  message: string;
};

function FullPageMessage({ message }: FullPageMessageProps) {
  return (
    <section className="text-muted-foreground flex min-h-svh items-center justify-center gap-2 text-sm">
      <Loader2 className="size-4 animate-spin" />
      {message}
    </section>
  );
}

export { FullPageMessage };
