import { UserButton } from "@clerk/react";

function AppHeader() {
  return (
    <header className="flex min-h-14 items-center justify-between gap-4 border-b border-[#d8e7df] pb-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-normal">HanziFlow</h1>
      </div>
      <UserButton />
    </header>
  );
}

export { AppHeader };
