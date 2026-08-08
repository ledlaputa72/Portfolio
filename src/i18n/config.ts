export type Locale = "en" | "ko";

export const LOCALES: Locale[] = ["en", "ko"];
export const DEFAULT_LOCALE: Locale = "en";
export const LOCALE_STORAGE_KEY = "portfolio-locale";
export const LOCALE_COOKIE_KEY = "portfolio-locale";

/** A string (or array/value) available in both site languages. */
export type Localized<T = string> = { en: T; ko: T };

/** Pick the value for the active locale. */
export function pick<T>(locale: Locale, value: Localized<T>): T {
  return value[locale];
}

export function isLocale(value: string | null | undefined): value is Locale {
  return value === "en" || value === "ko";
}
