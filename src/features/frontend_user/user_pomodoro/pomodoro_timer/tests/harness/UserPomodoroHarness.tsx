/**
 * RESPONSIBILITY: Standalone test harness for UserPomodoro (≤150 lines).
 * FLOW: Mounts the real timer inside isolated theme/i18n providers with explicit session and drawer handlers.
 */
import React from 'react';
import { View, Text, SafeAreaView } from 'react-native';
import { I18nProvider } from '../../../../../../core/i18n/useTranslation';
import { ThemeProvider } from '../../../../../../core/theme/ThemeProvider';
import { useThemeTokens } from '../../../../../../core/theme/useThemeTokens';
import type { PomodoroMode } from '../../types/user_pomodoro.types';
import { UserPomodoroTimerMainView } from '../../components/UserPomodoroTimerMainView';

function HarnessInner() {
  const tokens = useThemeTokens();
  const handleSessionComplete = (_mode: PomodoroMode, _duration: number) => {
    // The standalone harness intentionally does not persist sessions.
  };
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: tokens.color.background }}>
      <View style={{ padding: tokens.space[3], backgroundColor: tokens.color.card, borderBottomWidth: 1, borderBottomColor: tokens.color.border }}>
        <Text style={{ color: tokens.color.primary, ...tokens.typography.caption, fontWeight: '700' }}>
          Harness: UserPomodoro [Scenario: ACTIVE]
        </Text>
      </View>
      <View style={{ flex: 1 }}>
        <UserPomodoroTimerMainView onSessionComplete={handleSessionComplete} onOpenDrawer={() => {}} />
      </View>
    </SafeAreaView>
  );
}

export function UserPomodoroHarness() {
  return (
    <I18nProvider>
      <ThemeProvider initialDarkMode={false}>
        <HarnessInner />
      </ThemeProvider>
    </I18nProvider>
  );
}
