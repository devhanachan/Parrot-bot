export function normalize(value: string): string {
  return value.trim().toLowerCase();
}

export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) {
    return text;
  }
  return text.slice(0, maxLength - 1) + "…";
}

export function encodeForUrl(text: string): string {
  return encodeURIComponent(text);
}