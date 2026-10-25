/**
 * RESPONSIBILITY: Thin screen entry point for User Profile view (≤80 lines).
 * FLOW: Renders SafeAreaView, StatusBar, and UserProfileMainView; hooks into useUserSettings.
 */

import React from 'react';
import { StatusBar, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { UserProfileMainView } from '../components/UserProfileMainView';
import { useThemeTokens } from '../../../../../core/theme/useThemeTokens';
import { useUserSettings } from '../hooks/useUserSettings';
import { showToast } from '../../../../../core/toast/showToast';

export function UserProfileScreen() {
  const tokens = useThemeTokens();
  const { profile, updateProfile } = useUserSettings();

  const handleSaveProfile = async (data: { name: string; email: string; phone: string }) => {
    if (updateProfile) {
      await updateProfile(data);
    }
    showToast('Profile updated successfully.', 'success');
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
      <UserProfileMainView
        initialName={profile?.name || 'Rohit Kumar'}
        initialEmail={profile?.email || 'rohit@tasklume.app'}
        initialPhone={profile?.phone || '918084350824'}
        completedTasks={profile?.completedTasks || 12}
        activeTasks={profile?.activeTasks || 3}
        streakDays={profile?.streakDays || 7}
        onSaveProfile={handleSaveProfile}
      />
    </SafeAreaView>
  );
}
