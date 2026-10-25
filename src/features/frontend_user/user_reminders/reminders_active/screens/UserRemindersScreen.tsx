/**
 * RESPONSIBILITY: Thin Screen entry point for User Reminders view (≤80 lines).
 * FLOW: Composes SafeAreaView, StatusBar, and UserRemindersMainView; filters tasks with active reminders.
 */

import React, { useMemo } from 'react';
import { StatusBar, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { UserRemindersMainView } from '../components/UserRemindersMainView';
import { useThemeTokens } from '../../../../core/theme/useThemeTokens';
import { useTodos } from '../../../../hooks/useTodos';

export function UserRemindersScreen() {
  const tokens = useThemeTokens();
  const { todos } = useTodos();

  const activeReminders = useMemo(() => {
    return todos.filter((t: any) => t.reminder && !t.completed && !t.deleted);
  }, [todos]);

  const styles = StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: tokens.color.background,
    },
  });

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <StatusBar
        barStyle={tokens.isDark ? 'light-content' : 'dark-content'}
        backgroundColor={tokens.color.background}
      />
      <UserRemindersMainView reminders={activeReminders} />
    </SafeAreaView>
  );
}
