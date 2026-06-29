export type Locale = "en" | "bn";

export type LocalizedText = { en: string; bn: string };

/**
 * Reads a possibly-localized field, tolerating legacy plain-string rows that
 * predate the i18n migration. Falls back to English, then the other locale.
 */
export const readLocalized = (
  field: LocalizedText | string | null | undefined,
  locale: Locale = "en",
): string => {
  if (field == null) return "";
  if (typeof field === "string") return field;
  return field[locale] ?? field.en ?? field.bn ?? "";
};
