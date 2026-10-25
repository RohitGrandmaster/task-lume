/**
 * RESPONSIBILITY: Standalone test harness for UserVoice (≤150 lines).
 * FLOW: Mounts the sub-module in complete isolation with mock theme and scenario controls.
 */

import React, { useState } from 'react';
import { View, Text, SafeAreaView } from 'react-native';
import { I18nProvider } from '../../../../../../core/i18n/useTranslation';
import { ThemeProvider } from '../../../../../../core/theme/ThemeProvider';
import { useThemeTokens } from '../../../../../../core/theme/useThemeTokens';
import { UserVoiceMainView } from '../../components/UserVoiceMainView';

function HarnessInner({ title, children }: { title: string; children: React.ReactNode }) {
  const tokens = useThemeTokens();
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: tokens.colors.background }}>
      <View
        style={{
          padding: tokens.space[2],
          backgroundColor: tokens.colors.card,
          borderBottomWidth: 1,
          borderBottomColor: tokens.colors.border,
        }}
      >
        <Text
          style={{
            color: tokens.colors.primary,
            fontSize: tokens.typography.caption.fontSize,
            fontWeight: '700',
          }}
        >
          {title}
        </Text>
      </View>
      <View style={{ flex: 1 }}>{children}</View>
    </SafeAreaView>
  );
}

export function UserVoiceHarness() {
  const [scenario] = useState<'ACTIVE' | 'EMPTY' | 'ERROR'>('ACTIVE');

  return (
    <I18nProvider>
      <ThemeProvider>
        <HarnessInner title={`Harness: UserVoice [Scenario: ${scenario}]`}>
        <UserVoiceMainView />
        </HarnessInner>
      </ThemeProvider>
    </I18nProvider>
  );
}
