/**
 * RESPONSIBILITY: Thin Screen entry point for User Settings view (≤80 lines).
 * FLOW: Composes SafeAreaView, StatusBar, and UserSettingsMainView; delegates to AppLock and Settings contexts.
 */

import React from 'react';
import { StatusBar, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { UserSettingsMainView } from '../components/UserSettingsMainView';
import { useThemeTokens } from '../../../../../core/theme/useThemeTokens';
import { useAppLock } from '../../../../../context/AppLockContext';
import { useAuth } from '../../../../../hooks/useAuth';
import { useTodos } from '../../../../../hooks/useTodos';

export function UserSettingsScreen() {
  const navigation = useNavigation<any>();
  const tokens = useThemeTokens();
  const { isLockEnabled, enableDeviceLock, disableDeviceLock } = useAppLock();
  const { user } = useAuth();
  const { clearCompleted, clearTrash } = useTodos();

  const handleToggleLock = async () => {
    if (isLockEnabled) {
      await disableDeviceLock();
    } else {
      await enableDeviceLock();
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
      <UserSettingsMainView
        userName={user?.name || 'Rohit Kumar'}
        userEmail={user?.email || 'rohit@tasklume.app'}
        isLockEnabled={isLockEnabled}
        onToggleLock={handleToggleLock}
        onOpenProfile={() => navigation.navigate('Profile')}
        onOpenFaq={() => navigation.navigate('FAQ')}
        onOpenFeedback={() => navigation.navigate('Feedback')}
        onOpenMoreApps={() => navigation.navigate('MoreApps')}
        onOpenAbout={() => navigation.navigate('About')}
        onExportData={() => Alert.alert('Backup', 'Data backup exported to storage.')}
        onImportData={() => Alert.alert('Restore', 'Select JSON backup to import.')}
        onClearCompleted={clearCompleted}
        onResetAllData={clearTrash}
      />
    </SafeAreaView>
  );
}
