/**
 * RESPONSIBILITY: Thin Screen entry point for User Calendar view (≤80 lines).
 * FLOW: Composes SafeAreaView, StatusBar, and UserCalendarMainView; extracts tasks from useTodos.
 */

import React from 'react';
import { StatusBar, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { UserCalendarMainView } from '../components/UserCalendarMainView';
import { useThemeTokens } from '../../../../core/theme/useThemeTokens';
import { useTodos } from '../../../../hooks/useTodos';

export function UserCalendarScreen() {
  const tokens = useThemeTokens();
  const { todos } = useTodos();

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
      <UserCalendarMainView todos={todos} />
    </SafeAreaView>
  );
}
