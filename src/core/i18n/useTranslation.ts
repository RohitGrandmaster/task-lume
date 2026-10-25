/**
 * RESPONSIBILITY: Canonical re-export for useTranslation hook (Section 968).
 * FLOW: Re-exports I18nProvider and useTranslation hook from useTranslation.tsx.
 */

export * from './useTranslation.tsx';
export { useTranslation, I18nProvider, resolveTranslation } from './useTranslation.tsx';
export type { TranslationResources, TranslationContextValue } from './useTranslation.tsx';
