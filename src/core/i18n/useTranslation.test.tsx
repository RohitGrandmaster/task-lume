/**
 * RESPONSIBILITY: Verifies namespaced locale lookup and translation fallback behavior.
 * FLOW: Render consumer inside I18nProvider → assert translated text for supported locales.
 */
import React from 'react';
import { Text } from 'react-native';
import { act, create, type ReactTestRenderer } from 'react-test-renderer';
import { I18nProvider, useTranslation } from './useTranslation';

function TranslationLabel({ translationKey }: { translationKey: string }) {
  const { t } = useTranslation();
  return <Text>{t(translationKey)}</Text>;
}

describe('mobile i18n provider', () => {
  it('returns the selected Hindi translation', () => {
    let root!: ReactTestRenderer;
    act(() => {
      root = create(
        <I18nProvider initialLocale="hi">
          <TranslationLabel translationKey="user_todos_management.PAGE_TITLE" />
        </I18nProvider>,
      );
    });
    expect(root.root.findByType(Text).props.children).toBe('कार्य');
    act(() => root.unmount());
  });

  it('falls back to English when a key is absent from Hindi', () => {
    let root!: ReactTestRenderer;
    act(() => {
      root = create(
        <I18nProvider initialLocale="hi">
          <TranslationLabel translationKey="user_todos_management.RETRY_CTA" />
        </I18nProvider>,
      );
    });
    expect(root.root.findByType(Text).props.children).toBe('Retry');
    act(() => root.unmount());
  });
});
