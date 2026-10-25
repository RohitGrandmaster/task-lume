/**
 * RESPONSIBILITY: Standalone Settings visual harness with real local toggle state.
 * FLOW: Harness actions → local preference state and feedback → UserSettingsMainView.
 */

import React, { useState } from 'react';
import { Pressable, View, Text, SafeAreaView } from 'react-native';
import { ThemeProvider } from '../../../../../../core/theme/ThemeProvider';
import { useThemeTokens } from '../../../../../../core/theme/useThemeTokens';
import { UserSettingsMainView } from '../../components/UserSettingsMainView';

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

function UserSettingsHarnessContent() {
  const tokens = useThemeTokens();
  const [isLockEnabled, setLock] = useState(false);
  const [haptics, setHaptics] = useState(true);
  const [notifications, setNotifications] = useState(true);
  const [reminders, setReminders] = useState(true);
  const [feedback, setFeedback] = useState('');
  return (
    <HarnessInner title="Harness: UserSettings [LOCAL_STATE]">
      <View style={{ padding: tokens.space[2] }}>
        <Text style={{ ...tokens.typography.caption, color: tokens.color.muted }}>{feedback || 'Actions update local harness state; no real account or storage is connected.'}</Text>
      </View>
      <UserSettingsMainView
        userName="Harness User"
        userEmail="harness@example.invalid"
        isLockEnabled={isLockEnabled}
        hapticsEnabled={haptics}
        notificationsEnabled={notifications}
        remindersEnabled={reminders}
        onToggleLock={() => setLock((v) => !v)}
        onToggleHaptics={() => setHaptics((v) => !v)}
        onToggleNotifications={() => setNotifications((v) => !v)}
        onToggleReminders={() => setReminders((v) => !v)}
        onOpenProfile={() => setFeedback('Profile route requested')}
        onOpenFaq={() => setFeedback('FAQ route requested')}
        onOpenFeedback={() => setFeedback('Feedback route requested')}
        onOpenMoreApps={() => setFeedback('More Apps route requested')}
        onOpenAbout={() => setFeedback('About route requested')}
        onExportData={() => setFeedback('Backup export action requested')}
        onImportData={(records) => { setFeedback(`Validated ${records.length} tasks in harness`); return true; }}
        onClearCompleted={() => setFeedback('Clear completed action requested')}
        onEmptyTrash={() => setFeedback('Empty Trash action requested')}
      />
      <Pressable style={{ minHeight: 48, padding: tokens.space[2], backgroundColor: tokens.color.primarySubtle }} onPress={() => setFeedback('Settings harness interaction verified')} accessibilityRole="button" accessibilityLabel="Show Settings harness feedback" testID="user-settings-harness-feedback">
        <Text style={{ color: tokens.color.foreground }}>Show interaction feedback</Text>
      </Pressable>
    </HarnessInner>
  );
}

export function UserSettingsHarness() {
  return <ThemeProvider><UserSettingsHarnessContent /></ThemeProvider>;
}
