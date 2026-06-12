const HANZI_RAIL = ["汉", "字", "流"];

function BrandMark() {
  return (
    <div className="flex items-center gap-4" aria-label="HanziFlow">
      <div className="grid grid-cols-3 overflow-hidden rounded-lg border border-[#91b8a7] bg-white shadow-xs">
        {HANZI_RAIL.map((character) => (
          <span
            className="flex size-12 items-center justify-center border-r border-[#d8e7df] text-2xl font-semibold text-[#183d32] last:border-r-0"
            key={character}
            lang="zh-Hans"
          >
            {character}
          </span>
        ))}
      </div>
      <div>
        <p className="text-lg font-semibold leading-none">HanziFlow</p>
        <p className="text-muted-foreground mt-1 text-xs">Character decks</p>
      </div>
    </div>
  );
}

export { BrandMark };
