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

  const handleSaveProfile = async (data: { name: string; email: string; phone: string }): Promise<boolean> => {
    const saved = await updateProfile(data);
    if (saved) {
      showToast('Profile updated successfully.', 'success', 'user_settings:profile:saved');
    }
    return saved;
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
      <UserProfileMainView
        initialName={profile?.name ?? ''}
        initialEmail={profile?.email ?? ''}
        initialPhone={profile?.phone ?? ''}
        completedTasks={profile?.completedTasks ?? 0}
        activeTasks={profile?.activeTasks ?? 0}
        streakDays={profile?.streakDays ?? 0}
        onSaveProfile={handleSaveProfile}
      />
    </SafeAreaView>
  );
}
