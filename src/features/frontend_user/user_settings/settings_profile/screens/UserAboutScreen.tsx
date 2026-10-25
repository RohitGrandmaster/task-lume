/**
 * RESPONSIBILITY: Thin Screen entry point for About Developer view (≤80 lines).
 * FLOW: Renders SafeAreaView, StatusBar, and UserAboutMainView.
 */

import React from 'react';
import { StatusBar, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { UserAboutMainView } from '../components/UserAboutMainView';
import { useThemeTokens } from '../../../../../core/theme/useThemeTokens';

export function UserAboutScreen() {
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
      <UserAboutMainView />
    </SafeAreaView>
  );
}
