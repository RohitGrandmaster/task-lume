/**
 * RESPONSIBILITY: Thin Screen entry point for User Settings view (≤80 lines).
 * FLOW: Composes SafeAreaView, StatusBar, and UserSettingsMainView; delegates to AppLock and Settings contexts.
 */

import React from 'react';
import { StatusBar, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { UserSettingsMainView } from '../components/UserSettingsMainView';
import { useThemeTokens } from '../../../../core/theme/useThemeTokens';
import { useAppLock } from '../../../../context/AppLockContext';
import { useSettings } from '../../../../context/SettingsContext';

export function UserSettingsScreen() {
  const tokens = useThemeTokens();
  const { isLockEnabled, enableDeviceLock, disableDeviceLock } = useAppLock();
  const { notificationsEnabled, updateSetting } = useSettings();

  const handleToggleLock = async () => {
    if (isLockEnabled) {
      await disableDeviceLock();
    } else {
      await enableDeviceLock();
    }
  };

  const handleToggleNotifications = () => {
    updateSetting('notificationsEnabled', !notificationsEnabled);
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
      <UserSettingsMainView
        isLockEnabled={isLockEnabled}
        onToggleLock={handleToggleLock}
        notificationsEnabled={notificationsEnabled}
        onToggleNotifications={handleToggleNotifications}
      />
    </SafeAreaView>
  );
}
