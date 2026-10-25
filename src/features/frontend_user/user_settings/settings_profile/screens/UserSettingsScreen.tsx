/**
 * RESPONSIBILITY: Thin Screen entry point for User Settings view (≤80 lines).
 * FLOW: Composes SafeAreaView, StatusBar, and UserSettingsMainView; delegates to useUserSettings hook.
 */

import React from 'react';
import { StatusBar, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { UserSettingsMainView } from '../components/UserSettingsMainView';
import { useThemeTokens } from '../../../../../core/theme/useThemeTokens';
import { useUserSettings } from '../hooks/useUserSettings';
import { showToast } from '../../../../../core/toast/showToast';
import { USER_SETTINGS_ROUTES } from '../config/user_settings.url_config';

export function UserSettingsScreen() {
  const navigation = useNavigation<any>();
  const tokens = useThemeTokens();
  const { isLockEnabled, toggleAppLock, exportData, importData, clearCompleted, clearTrash } = useUserSettings();

  const handleExport = async () => {
    await exportData();
    showToast('Data backup exported successfully.', 'success');
  };

  const handleImport = async () => {
    await importData();
    showToast('Backup restored successfully.', 'success');
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
        userName="Rohit Kumar"
        userEmail="rohit@tasklume.app"
        isLockEnabled={isLockEnabled}
        onToggleLock={toggleAppLock}
        onOpenProfile={() => navigation.navigate(USER_SETTINGS_ROUTES.PROFILE)}
        onOpenFaq={() => navigation.navigate(USER_SETTINGS_ROUTES.FAQ)}
        onOpenFeedback={() => navigation.navigate(USER_SETTINGS_ROUTES.FEEDBACK)}
        onOpenMoreApps={() => navigation.navigate(USER_SETTINGS_ROUTES.APPS)}
        onOpenAbout={() => navigation.navigate(USER_SETTINGS_ROUTES.ABOUT)}
        onExportData={handleExport}
        onImportData={handleImport}
        onClearCompleted={clearCompleted}
        onResetAllData={clearTrash}
      />
    </SafeAreaView>
  );
}
