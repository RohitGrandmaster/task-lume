/**
 * RESPONSIBILITY: Maintains the active supported locale for UI translations and HTTP headers.
 * FLOW: I18nProvider updates the active locale; networkClient reads it for Accept-Language.
 */
export type SupportedLocale = 'en' | 'hi';
let activeLocale: SupportedLocale = 'en';

/**
 * Normalizes a runtime locale to one of the app-supported languages.
 * @param value - Locale identifier (for example en-IN or hi-IN).
 * @returns Hindi for hi-prefixed values, otherwise English.
 */
export function normalizeLocale(value?: string | null): SupportedLocale {
  return (value ?? '').toLowerCase().split(/[-_]/)[0] === 'hi' ? 'hi' : 'en';
}

/** @returns The currently active language. */
export function getActiveLocale(): SupportedLocale {
  return activeLocale;
}

/** @param locale - Supported locale chosen by the app/provider. */
export function setActiveLocale(locale: SupportedLocale): void {
  activeLocale = locale;
}

/** @returns A supported locale based on the runtime Intl locale with a safe English fallback. */
export function detectDeviceLocale(): SupportedLocale {
  try {
    return normalizeLocale(Intl.DateTimeFormat().resolvedOptions().locale);
  } catch {
    return 'en';
  }
}
