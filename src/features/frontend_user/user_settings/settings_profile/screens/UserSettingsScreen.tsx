/**
 * RESPONSIBILITY: Thin Screen entry point for User Settings view (≤80 lines).
 * FLOW: Composes SafeAreaView, StatusBar, and UserSettingsMainView; delegates to useUserSettings hook.
 */

import React from 'react';
import { StatusBar, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, DrawerActions } from '@react-navigation/native';
import { UserSettingsMainView } from '../components/UserSettingsMainView';
import { useThemeTokens } from '../../../../../core/theme/useThemeTokens';
import { useUserSettings } from '../hooks/useUserSettings';
import { USER_SETTINGS_ROUTES } from '../config/user_settings.url_config';
import { useConfirm } from '../../../../../core/hooks/useConfirm';

export function UserSettingsScreen() {
  const navigation = useNavigation<any>();
  const tokens = useThemeTokens();
  const settings = useUserSettings();
  const { confirm, confirmDialog } = useConfirm();

  const handleClearCompleted = async () => {
    await confirm({
      title: 'Clear completed tasks?',
      message: 'Completed active tasks will be permanently removed. Active tasks and items in Trash will be kept.',
      confirmLabel: 'Clear Completed',
      cancelLabel: 'Cancel',
      destructive: true,
    }, () => { settings.clearCompleted(); });
  };

  const handleEmptyTrash = async () => {
    await confirm({
      title: 'Permanently empty Trash?',
      message: 'Every task in Trash will be permanently deleted and cannot be restored.',
      confirmLabel: 'Empty Trash',
      cancelLabel: 'Cancel',
      destructive: true,
    }, () => { settings.clearTrash(); });
  };

  const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: tokens.color.background },
  });

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <StatusBar
        barStyle={tokens.isDark ? 'light-content' : 'dark-content'}
        backgroundColor={tokens.color.background}
      />
      <UserSettingsMainView
        userName={settings.profile?.name ?? ''}
        userEmail={settings.profile?.email ?? ''}
        isLockEnabled={settings.isLockEnabled}
        hapticsEnabled={settings.hapticsEnabled}
        notificationsEnabled={settings.notificationsEnabled}
        remindersEnabled={settings.remindersEnabled}
        onToggleLock={settings.toggleAppLock}
        onToggleHaptics={settings.toggleHaptics}
        onToggleNotifications={settings.toggleNotifications}
        onToggleReminders={settings.toggleReminders}
        onOpenProfile={() => navigation.navigate(USER_SETTINGS_ROUTES.PROFILE)}
        onOpenFaq={() => navigation.navigate(USER_SETTINGS_ROUTES.FAQ)}
        onOpenFeedback={() => navigation.navigate(USER_SETTINGS_ROUTES.FEEDBACK)}
        onOpenMoreApps={() => navigation.navigate(USER_SETTINGS_ROUTES.APPS)}
        onOpenAbout={() => navigation.navigate(USER_SETTINGS_ROUTES.ABOUT)}
        onExportData={settings.exportData}
        onImportData={settings.importData}
        onClearCompleted={handleClearCompleted}
        onEmptyTrash={handleEmptyTrash}
        onOpenDrawer={() => navigation.dispatch(DrawerActions.openDrawer())}
      />
      {confirmDialog}
    </SafeAreaView>
  );
}

