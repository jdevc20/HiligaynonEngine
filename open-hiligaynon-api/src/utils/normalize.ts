/**
 * Canonical text normalization used for search keys and deduplication.
 * Original text is always retained separately.
 */
export const normalizeText = (text: string): string => {
  return text
    .normalize("NFC")
    .toLocaleLowerCase()
    .trim()
    .replace(/[.,/#!$%^&*;:{}=_`~()\[\]?"“”]/g, "")
    .replace(/\s+/g, " ");
};
