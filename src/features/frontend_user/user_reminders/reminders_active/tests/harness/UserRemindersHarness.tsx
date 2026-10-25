/**
 * RESPONSIBILITY: Standalone reminder visual harness with populated and empty reminder lists.
 * FLOW: Scenario control → deterministic ReminderTaskEntity fixtures → UserRemindersMainView.
 */

import React, { useState } from 'react';
import { Pressable, View, Text, SafeAreaView } from 'react-native';
import { ThemeProvider } from '../../../../../../core/theme/ThemeProvider';
import { useThemeTokens } from '../../../../../../core/theme/useThemeTokens';
import { UserRemindersMainView } from '../../components/UserRemindersMainView';
import type { ReminderTaskEntity } from '../../types/user_reminders.types';

function HarnessInner({ title, children }: { title: string; children: React.ReactNode }) {
  const tokens = useThemeTokens();
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: tokens.color.background }}>
      <View style={{ padding: tokens.space[2], backgroundColor: tokens.color.card, borderBottomWidth: 1, borderBottomColor: tokens.color.border }}>
        <Text style={{ color: tokens.color.primary, ...tokens.typography.caption, fontWeight: '700' }}>{title}</Text>
      </View>
      <View style={{ flex: 1 }}>{children}</View>
    </SafeAreaView>
  );
}

function UserRemindersHarnessContent() {
  const tokens = useThemeTokens();
  const [showRecords, setShowRecords] = useState(true);
  const [feedback, setFeedback] = useState('');
  const reminders: ReminderTaskEntity[] = showRecords ? [{
    id: 'reminder-harness-1',
    title: 'Review today’s priorities',
    reminder: true,
    reminderTime: '09:30',
    dueDate: new Date().toISOString().slice(0, 10),
    completed: false,
    deleted: false,
    priority: 'medium',
    category: 'Personal',
  }] : [];

  return (
    <HarnessInner title={`Harness: UserReminders [${showRecords ? 'ACTIVE_RECORDS' : 'EMPTY_DATA'}]`}>
      <Pressable style={{ minHeight: 48, padding: tokens.space[2], backgroundColor: tokens.color.primarySubtle }} onPress={() => setShowRecords((current) => !current)} accessibilityRole="button" accessibilityLabel="Toggle reminder list scenario" testID="user-reminders-harness-toggle-scenario">
        <Text style={{ color: tokens.color.foreground }}>Switch to {showRecords ? 'empty' : 'populated'} reminders</Text>
      </Pressable>
      {feedback ? <Text accessibilityLiveRegion="polite">{feedback}</Text> : null}
      <UserRemindersMainView
        reminders={reminders}
        onPressReminder={(reminder) => setFeedback(`Selected reminder: ${reminder.title}`)}
      />
    </HarnessInner>
  );
}

export function UserRemindersHarness() {
  return <ThemeProvider><UserRemindersHarnessContent /></ThemeProvider>;
}
