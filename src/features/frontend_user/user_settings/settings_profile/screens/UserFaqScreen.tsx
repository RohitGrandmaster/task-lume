/**
 * RESPONSIBILITY: Thin Screen entry point for User FAQ & Help Guide (≤80 lines).
 * FLOW: Renders SafeAreaView, StatusBar, and UserFaqMainView.
 */

import React from 'react';
import { StatusBar, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { UserFaqMainView } from '../components/UserFaqMainView';
import { useThemeTokens } from '../../../../../core/theme/useThemeTokens';

export function UserFaqScreen() {
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
      <UserFaqMainView />
    </SafeAreaView>
  );
}
