import { Toaster as Sonner } from "sonner";
import type { ComponentProps } from "react";

function Toaster(props: ComponentProps<typeof Sonner>) {
  return (
    <Sonner
      position="bottom-center"
      toastOptions={{
        classNames: {
          toast: "border-[#d8e7df] bg-background text-foreground",
          description: "text-muted-foreground",
        },
      }}
      {...props}
    />
  );
}

export { Toaster };
