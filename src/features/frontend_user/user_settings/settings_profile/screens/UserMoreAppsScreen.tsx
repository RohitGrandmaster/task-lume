/**
 * RESPONSIBILITY: Thin Screen entry point for More Apps showcase (≤80 lines).
 * FLOW: Renders SafeAreaView, StatusBar, and UserMoreAppsMainView.
 */

import React from 'react';
import { StatusBar, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { UserMoreAppsMainView } from '../components/UserMoreAppsMainView';
import { useThemeTokens } from '../../../../../core/theme/useThemeTokens';

export function UserMoreAppsScreen({ navigation }: { navigation?: any } = {}) {
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
      />
      <UserMoreAppsMainView onBack={() => navigation?.goBack()} />
    </SafeAreaView>
  );
}
