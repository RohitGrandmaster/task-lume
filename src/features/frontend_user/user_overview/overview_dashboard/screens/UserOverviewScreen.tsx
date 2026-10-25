/**
 * RESPONSIBILITY: Thin Screen entry point for User Overview analytics dashboard (≤80 lines).
 * FLOW: Composes SafeAreaView, StatusBar, and UserOverviewMainView; zero business logic.
 */

import React from 'react';
import { StatusBar, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { UserOverviewMainView } from '../components/UserOverviewMainView';
import { useThemeTokens } from '../../../../../core/theme/useThemeTokens';
import { useUserOverview } from '../hooks/useUserOverview';

export function UserOverviewScreen() {
  const tokens = useThemeTokens();
  const { metrics, categoryData, activityData, refreshing, refresh } = useUserOverview();

  const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: tokens.color.background },
  });

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <StatusBar
        barStyle={tokens.isDark ? 'light-content' : 'dark-content'}
        backgroundColor={tokens.color.background}
      />
      <UserOverviewMainView
        metrics={metrics}
        categoryData={categoryData}
        activityData={activityData}
        refreshing={refreshing}
        onRefresh={refresh}
      />
    </SafeAreaView>
  );
}
