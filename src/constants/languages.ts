export const LANG_CODES = [
  "en",
  "th",
  "ja",
  "fil",
  "id",
  "ar-eg",
  "ak",
  "ee",
  "gaa",
  "dag",
] as const;

export type LangCode = (typeof LANG_CODES)[number];

export const TRANSLATE_TARGET: Record<LangCode, string> = {
  en: "en",
  th: "th",
  ja: "ja",
  fil: "fil",
  id: "id",
  "ar-eg": "ar",
  ak: "ak",
  ee: "ee",
  gaa: "gaa",
  dag: "dag",
};

export const DEFAULT_LANGUAGE: LangCode = "en";

export function isValidLangCode(code: string): code is LangCode {
  return LANG_CODES.includes(code as LangCode);
}

export function getTranslateTarget(code: LangCode): string {
  return TRANSLATE_TARGET[code] ?? TRANSLATE_TARGET[DEFAULT_LANGUAGE];
}