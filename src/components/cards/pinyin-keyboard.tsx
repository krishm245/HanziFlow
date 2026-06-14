import type { ReactNode, RefObject } from "react";
import { useState } from "react";
import { Delete, Keyboard, Space, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  clearPinyinText,
  deletePinyinText,
  insertPinyinText,
  type PinyinTextResult,
} from "./pinyin-keyboard-helpers";

type PinyinKeyboardProps = {
  inputRef: RefObject<HTMLInputElement | null>;
  onValueChange: (value: string) => void;
  value: string;
};

const pinyinRows = [
  ["a", "ā", "á", "ǎ", "à"],
  ["e", "ē", "é", "ě", "è"],
  ["i", "ī", "í", "ǐ", "ì"],
  ["o", "ō", "ó", "ǒ", "ò"],
  ["u", "ū", "ú", "ǔ", "ù"],
  ["ü", "ǖ", "ǘ", "ǚ", "ǜ"],
] as const;

function PinyinKeyboard({ inputRef, onValueChange, value }: PinyinKeyboardProps) {
  const [isVisible, setIsVisible] = useState(true);

  function getSelection() {
    const input = inputRef.current;

    return {
      selectionEnd: input?.selectionEnd ?? value.length,
      selectionStart: input?.selectionStart ?? value.length,
      value,
    };
  }

  function applyTextResult(result: PinyinTextResult) {
    onValueChange(result.value);
    window.requestAnimationFrame(() => {
      inputRef.current?.focus();
      inputRef.current?.setSelectionRange(
        result.selectionStart,
        result.selectionEnd,
      );
    });
  }

  function insertText(text: string) {
    applyTextResult(insertPinyinText({ ...getSelection(), text }));
  }

  function deleteText() {
    applyTextResult(deletePinyinText(getSelection()));
  }

  function clearText() {
    applyTextResult(clearPinyinText());
  }

  return (
    <div className="grid gap-3 rounded-lg border border-[#d8e7df] bg-white/80 p-3 shadow-xs">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-medium text-[#183d32]">Pinyin keyboard</p>
        <Button
          aria-label={isVisible ? "Hide pinyin keyboard" : "Show pinyin keyboard"}
          onClick={() => setIsVisible((current) => !current)}
          size="icon"
          type="button"
          variant="outline"
        >
          <Keyboard />
        </Button>
      </div>

      {isVisible ? (
        <div className="grid gap-2">
          {pinyinRows.map((row) => (
            <div className="grid grid-cols-5 gap-2" key={row[0]}>
              {row.map((key) => (
                <KeyboardButton
                  ariaLabel={`Insert ${key}`}
                  key={key}
                  onClick={() => insertText(key)}
                >
                  {key}
                </KeyboardButton>
              ))}
            </div>
          ))}

          <div className="grid grid-cols-4 gap-2">
            <KeyboardButton
              ariaLabel="Insert space"
              className="text-xs"
              onClick={() => insertText(" ")}
            >
              <Space className="size-4" />
              Space
            </KeyboardButton>
            <KeyboardButton
              ariaLabel="Insert apostrophe"
              onClick={() => insertText("'")}
            >
              '
            </KeyboardButton>
            <KeyboardButton ariaLabel="Backspace" onClick={deleteText}>
              <Delete className="size-4" />
            </KeyboardButton>
            <KeyboardButton ariaLabel="Clear pinyin" onClick={clearText}>
              <X className="size-4" />
            </KeyboardButton>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function KeyboardButton({
  ariaLabel,
  children,
  className,
  onClick,
}: {
  ariaLabel: string;
  children: ReactNode;
  className?: string;
  onClick: () => void;
}) {
  return (
    <Button
      aria-label={ariaLabel}
      className={cn(
        "h-11 min-w-0 border-[#d8e7df] bg-white text-base font-semibold text-[#183d32] hover:bg-[#e7f3ed]",
        className,
      )}
      onClick={onClick}
      onMouseDown={(event) => event.preventDefault()}
      type="button"
      variant="outline"
    >
      {children}
    </Button>
  );
}

export { PinyinKeyboard };
