/**
 * RESPONSIBILITY: Canonical i18n core manifest and translation orchestrator (Section 967).
 * FLOW: Consumed by useTranslation and network client for localized telemetry and Accept-Language headers.
 */

export {
  type SupportedLocale,
  getActiveLocale,
  setActiveLocale,
  normalizeLocale,
  detectDeviceLocale,
} from './locale';

export { useTranslation, I18nProvider } from './useTranslation';
