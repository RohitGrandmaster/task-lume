/**
 * RESPONSIBILITY: Provides language selection and namespaced translation lookup to React Native UI.
 * FLOW: App → I18nProvider → useTranslation().t('namespace.KEY'); locale is shared with networkClient.
 */
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { en } from '../../i18n/generated/en';
import { hi } from '../../i18n/generated/hi';
import { detectDeviceLocale, setActiveLocale, type SupportedLocale } from './locale';

type TranslationMap = Record<string, Record<string, string>>;
const RESOURCES: Record<SupportedLocale, TranslationMap> = {
  en: en as unknown as TranslationMap,
  hi: hi as unknown as TranslationMap,
};

export interface TranslationContextValue {
  locale: SupportedLocale;
  setLocale: (locale: SupportedLocale) => void;
  t: (key: string, fallback?: string) => string;
}

const I18nContext = createContext<TranslationContextValue | null>(null);

/**
 * Resolves a namespace.key, with English resources as the fallback language.
 * @param locale - Currently selected locale.
 * @param key - Namespaced key such as user_todos_management.PAGE_TITLE.
 * @param fallback - Optional caller-provided fallback for missing keys.
 * @returns Resolved translation or the explicit fallback/key.
 */
function translate(locale: SupportedLocale, key: string, fallback?: string): string {
  const separator = key.indexOf('.');
  if (separator <= 0 || separator === key.length - 1) return fallback ?? key;
  const namespace = key.slice(0, separator);
  const field = key.slice(separator + 1);
  return RESOURCES[locale][namespace]?.[field]
    ?? RESOURCES.en[namespace]?.[field]
    ?? fallback
    ?? key;
}

/**
 * Provides translation lookup and synchronizes the language used by network requests.
 * @param props - Child tree and optional initial locale for tests.
 * @returns Provider that exposes locale, setLocale, and t().
 * @sideEffects Updates the shared locale read by networkClient.
 */
export function I18nProvider({ children, initialLocale }: {
  children: React.ReactNode;
  initialLocale?: SupportedLocale;
}) {
  const [locale, setLocaleState] = useState<SupportedLocale>(() => initialLocale ?? detectDeviceLocale());
  const setLocale = useCallback((next: SupportedLocale) => setLocaleState(next), []);
  const t = useCallback((key: string, fallback?: string) => translate(locale, key, fallback), [locale]);

  useEffect(() => {
    // Keep request language synchronized with the same locale that renders the UI.
    setActiveLocale(locale);
  }, [locale]);

  const value = useMemo(() => ({ locale, setLocale, t }), [locale, setLocale, t]);
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

/**
 * Reads the translation API from its provider.
 * @returns Current locale, locale setter and namespaced translator.
 * @throws Error if called outside I18nProvider.
 */
export function useTranslation(): TranslationContextValue {
  const context = useContext(I18nContext);
  if (!context) throw new Error('useTranslation must be used within I18nProvider.');
  return context;
}
