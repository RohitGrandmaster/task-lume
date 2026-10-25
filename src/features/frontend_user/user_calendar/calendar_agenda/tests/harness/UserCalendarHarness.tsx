/**
 * RESPONSIBILITY: Standalone calendar visual harness with deterministic populated/empty states; not an API/MSW integration harness yet.
 * FLOW: UserCalendarHarness supplies local task fixtures and observable callbacks to UserCalendarMainView.
 */

import React, { useState } from 'react';
import { Pressable, Text, View, SafeAreaView } from 'react-native';
import { ThemeProvider } from '../../../../../../core/theme/ThemeProvider';
import { useThemeTokens } from '../../../../../../core/theme/useThemeTokens';
import type { CalendarTaskEntity } from '../../types/user_calendar.types';
import { UserCalendarMainView } from '../../components/UserCalendarMainView';

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

function UserCalendarHarnessContent() {
  const tokens = useThemeTokens();
  const [showRecords, setShowRecords] = useState(true);
  const [feedback, setFeedback] = useState('');
  const today = new Date().toISOString().slice(0, 10);
  const todos: CalendarTaskEntity[] = showRecords ? [{
    id: 'calendar-harness-task-1',
    title: 'Review planned tasks',
    dueDate: today,
    completed: false,
    deleted: false,
    priority: 'medium',
    category: 'Personal',
  }] : [];

  return (
    <HarnessInner title={`Harness: UserCalendar [${showRecords ? 'ACTIVE_RECORDS' : 'EMPTY_DATA'}]`}>
      <Pressable
        style={{ minHeight: 48, padding: tokens.space[2], backgroundColor: tokens.color.primarySubtle }}
        onPress={() => setShowRecords((current) => !current)}
        accessibilityRole="button"
        accessibilityLabel="Toggle populated and empty Calendar scenario"
        testID="user-calendar-harness-toggle-scenario"
      >
        <Text style={{ color: tokens.color.foreground }}>Switch to {showRecords ? 'empty' : 'populated'} scenario</Text>
      </Pressable>
      {feedback ? <Text accessibilityLiveRegion="polite">{feedback}</Text> : null}
      <UserCalendarMainView
        todos={todos}
        onOpenDrawer={() => setFeedback('Drawer action requested in harness')}
        onPressTask={(task) => setFeedback(`Selected: ${task.title}`)}
      />
    </HarnessInner>
  );
}

export function UserCalendarHarness() {
  return (
    <ThemeProvider>
      <UserCalendarHarnessContent />
    </ThemeProvider>
  );
}
