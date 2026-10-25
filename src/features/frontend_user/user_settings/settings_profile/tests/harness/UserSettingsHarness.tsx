/**
 * RESPONSIBILITY: Standalone test harness for UserSettings (≤150 lines).
 * FLOW: Mounts the sub-module in complete isolation with mock theme and scenario controls.
 */

import React, { useState } from 'react';
import { View, Text, SafeAreaView } from 'react-native';
import { ThemeProvider } from '../../../../../../core/theme/ThemeProvider';
import { useThemeTokens } from '../../../../../../core/theme/useThemeTokens';
import { UserSettingsMainView } from '../../components/UserSettingsMainView';

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

export function UserSettingsHarness() {
  const [scenario] = useState<'ACTIVE' | 'EMPTY' | 'ERROR'>('ACTIVE');

  return (
    <ThemeProvider>
      <HarnessInner title={`Harness: UserSettings [Scenario: ${scenario}]`}>
        <UserSettingsMainView />
      </HarnessInner>
    </ThemeProvider>
  );
}
