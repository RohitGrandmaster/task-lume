/**
 * RESPONSIBILITY: Thin Screen entry point for User Reminders view (≤80 lines).
 * FLOW: Composes SafeAreaView, StatusBar, and UserRemindersMainView; zero business logic.
 */

import React from 'react';
import { StatusBar, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { DrawerActions } from '@react-navigation/native';
import { UserRemindersMainView } from '../components/UserRemindersMainView';
import { useThemeTokens } from '../../../../../core/theme/useThemeTokens';
import { useUserReminders } from '../hooks/useUserReminders';

export function UserRemindersScreen({ navigation }: { navigation?: any }) {
  const tokens = useThemeTokens();
  const { reminders } = useUserReminders();

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
        backgroundColor={tokens.color.background}
      />
      <UserRemindersMainView reminders={reminders} onOpenDrawer={handleOpenDrawer} />
    </SafeAreaView>
  );
}
