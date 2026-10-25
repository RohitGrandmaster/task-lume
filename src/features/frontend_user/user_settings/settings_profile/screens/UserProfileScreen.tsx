/**
 * RESPONSIBILITY: Thin screen entry point for User Profile view (≤80 lines).
 * FLOW: Renders SafeAreaView, StatusBar, and UserProfileMainView; hooks into useAuth and useTodos.
 */

import React from 'react';
import { StatusBar, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { UserProfileMainView } from '../components/UserProfileMainView';
import { useThemeTokens } from '../../../../core/theme/useThemeTokens';
import { useAuth } from '../../../../hooks/useAuth';
import { useTodos } from '../../../../hooks/useTodos';

export function UserProfileScreen() {
  const tokens = useThemeTokens();
  const { user, updateProfile } = useAuth();
  const { tasks } = useTodos();

  const completed = (tasks || []).filter((t: any) => t.completed && !t.deleted).length;
  const active = (tasks || []).filter((t: any) => !t.completed && !t.deleted).length;

  const handleSaveProfile = async (data: { name: string; email: string; phone: string }) => {
    if (updateProfile) {
      await updateProfile(data);
    }
    Alert.alert('Success', 'Profile updated successfully.');
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
        initialName={user?.name || 'Rohit Kumar'}
        initialEmail={user?.email || 'rohit@tasklume.app'}
        initialPhone={user?.phone || '918084350824'}
        completedTasks={completed}
        activeTasks={active}
        streakDays={7}
        onSaveProfile={handleSaveProfile}
      />
    </SafeAreaView>
  );
}
