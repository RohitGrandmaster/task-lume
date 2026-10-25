/**
 * RESPONSIBILITY: Standalone test harness for UserOverview (≤150 lines).
 * FLOW: Mounts the sub-module in complete isolation with mock theme and scenario controls.
 */

import React, { useState } from 'react';
import { View, Text, SafeAreaView } from 'react-native';
import { I18nProvider } from '../../../../../../core/i18n/useTranslation';
import { ThemeProvider } from '../../../../../../core/theme/ThemeProvider';
import { useThemeTokens } from '../../../../../../core/theme/useThemeTokens';
import { UserOverviewMainView } from '../../components/UserOverviewMainView';

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

export function UserOverviewHarness() {
  const [scenario] = useState<'ACTIVE' | 'EMPTY' | 'ERROR'>('ACTIVE');

  return (
    <I18nProvider>
      <ThemeProvider>
        <HarnessInner title={'Harness: UserOverview [Scenario: ' + scenario + ']'}>
          <UserOverviewMainView metrics={{ totalTasks: 0, completedTasks: 0, completionRate: 0, currentStreak: 0, totalFocusMinutes: null, todayFocusMinutes: null }} categoryData={[]} activityData={[]} insightText="Add a task to start tracking your progress." refreshing={false} onRefresh={() => undefined} />
        </HarnessInner>
      </ThemeProvider>
    </I18nProvider>
  );
}
