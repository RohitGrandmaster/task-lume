/**
 * RESPONSIBILITY: Thin Screen entry point for User Pomodoro Timer view (≤80 lines).
 * FLOW: Composes SafeAreaView, StatusBar, and UserPomodoroTimerMainView; zero business logic.
 */

import React from 'react';
import { StatusBar, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { UserPomodoroTimerMainView } from '../components/UserPomodoroTimerMainView';
import { useThemeTokens } from '../../../../core/theme/useThemeTokens';

export function UserPomodoroScreen() {
  const tokens = useThemeTokens();

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
      <UserPomodoroTimerMainView />
    </SafeAreaView>
  );
}
