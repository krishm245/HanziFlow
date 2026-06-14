type PinyinTextEdit = {
  selectionEnd: number;
  selectionStart: number;
  value: string;
};

type PinyinTextResult = {
  selectionEnd: number;
  selectionStart: number;
  value: string;
};

function clampSelection(value: string, selection: number) {
  return Math.min(Math.max(selection, 0), value.length);
}

function normalizeSelection({ selectionEnd, selectionStart, value }: PinyinTextEdit) {
  const start = clampSelection(value, selectionStart);
  const end = clampSelection(value, selectionEnd);

  return {
    end: Math.max(start, end),
    start: Math.min(start, end),
  };
}

function insertPinyinText({
  selectionEnd,
  selectionStart,
  text,
  value,
}: PinyinTextEdit & { text: string }): PinyinTextResult {
  const selection = normalizeSelection({ selectionEnd, selectionStart, value });
  const nextValue =
    value.slice(0, selection.start) + text + value.slice(selection.end);
  const nextSelection = selection.start + text.length;

  return {
    selectionEnd: nextSelection,
    selectionStart: nextSelection,
    value: nextValue,
  };
}

function deletePinyinText({
  selectionEnd,
  selectionStart,
  value,
}: PinyinTextEdit): PinyinTextResult {
  const selection = normalizeSelection({ selectionEnd, selectionStart, value });

  if (selection.start !== selection.end) {
    return insertPinyinText({
      selectionEnd,
      selectionStart,
      text: "",
      value,
    });
  }

  if (selection.start === 0) {
    return {
      selectionEnd: 0,
      selectionStart: 0,
      value,
    };
  }

  const nextSelection = selection.start - 1;

  return {
    selectionEnd: nextSelection,
    selectionStart: nextSelection,
    value: value.slice(0, nextSelection) + value.slice(selection.start),
  };
}

function clearPinyinText(): PinyinTextResult {
  return {
    selectionEnd: 0,
    selectionStart: 0,
    value: "",
  };
}

export { clearPinyinText, deletePinyinText, insertPinyinText };
export type { PinyinTextResult };
