/**
 * RESPONSIBILITY: Thin Screen entry point for User Overview view (≤80 lines).
 * FLOW: Composes SafeAreaView, StatusBar, and UserOverviewMainView; zero business logic.
 */

import React from 'react';
import { StatusBar, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { DrawerActions } from '@react-navigation/native';
import { UserOverviewMainView } from '../components/UserOverviewMainView';
import { useThemeTokens } from '../../../../../core/theme/useThemeTokens';
import { useUserOverview } from '../hooks/useUserOverview';

export function UserOverviewScreen({ navigation }: { navigation?: any }) {
  const tokens = useThemeTokens();
  const { metrics, categoryData, activityData, insightText, refreshing, refreshOverview } = useUserOverview();

  const handleOpenDrawer = () => {
    if (navigation?.dispatch) {
      navigation.dispatch(DrawerActions.openDrawer());
    }
  };

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
      <UserOverviewMainView
        metrics={metrics}
        categoryData={categoryData}
        activityData={activityData}
        insightText={insightText}
        refreshing={refreshing}
        onRefresh={refreshOverview}
        onOpenDrawer={handleOpenDrawer}
      />
    </SafeAreaView>
  );
}
