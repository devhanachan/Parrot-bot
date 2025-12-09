export const EXCLUDED_ROLE_NAMES = new Set(
  ["Owner", "parrot", "S", "Parrot(Staging)"].map((name) => name.toLowerCase())
);

export const LANGUAGE_ROLE_NAMES = new Set(
  [
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
  ].map((name) => name.toLowerCase())
);

export const DEVELOPER_ROLE_NAME = "developer";

export const MAX_SELECT_MENU_OPTIONS = 25;
