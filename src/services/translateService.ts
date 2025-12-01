import type { TranslateResult } from "../types";
import { encodeForUrl } from "../utils/strings";

const GOOGLE_TRANSLATE_ENDPOINT = "https://translate.googleapis.com/translate_a/single";
const USER_AGENT = "Mozilla/5.0";

export async function translateText(
  text: string,
  targetLanguage: string
): Promise<TranslateResult> {
  const encodedText = encodeForUrl(text);
  const url = buildTranslateUrl(encodedText, targetLanguage);

  const response = await fetch(url, {
    headers: { "User-Agent": USER_AGENT },
  });

  if (!response.ok) {
    throw new Error(`Translation failed with status: ${response.status}`);
  }

  const data = await response.json();
  return parseTranslateResponse(data);
}

function buildTranslateUrl(encodedText: string, targetLanguage: string): string {
  const params = new URLSearchParams({
    client: "gtx",
    sl: "auto",
    tl: targetLanguage,
    dt: "t",
    dj: "1",
    q: decodeURIComponent(encodedText),
  });

  return `${GOOGLE_TRANSLATE_ENDPOINT}?${params.toString()}`;
}

function parseTranslateResponse(data: any): TranslateResult {
  const sentences = Array.isArray(data?.sentences) ? data.sentences : [];
  const translatedText = sentences
    .map((sentence: any) => String(sentence?.trans ?? ""))
    .join("")
    .trim();

  const detectedSource = typeof data?.src === "string" ? data.src : "auto";

  return { translatedText, detectedSource };
}

export async function translateTextLegacy(
  message: string,
  targetLanguage: string
): Promise<any> {
  const encodedMessage = encodeForUrl(message);
  const url = `${GOOGLE_TRANSLATE_ENDPOINT}?client=gtx&sl=auto&tl=${targetLanguage}&dt=t&q=${encodedMessage}`;

  const response = await fetch(url);
  
  if (!response.ok) {
    throw new Error(`Translation failed with status: ${response.status}`);
  }

  return response.json();
}