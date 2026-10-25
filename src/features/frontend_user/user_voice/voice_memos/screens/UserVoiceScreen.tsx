/**
 * RESPONSIBILITY: Thin Screen entry point for User Voice Memos view (≤80 lines).
 * FLOW: Composes SafeAreaView, StatusBar, and UserVoiceMainView; zero business logic.
 */

import React from 'react';
import { StatusBar, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { UserVoiceMainView } from '../components/UserVoiceMainView';
import { useThemeTokens } from '../../../../../core/theme/useThemeTokens';
import { useUserVoice } from '../hooks/useUserVoice';

export function UserVoiceScreen() {
  const tokens = useThemeTokens();
  const { saveAsTask } = useUserVoice();

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
      <UserVoiceMainView onSaveAsTask={saveAsTask} />
    </SafeAreaView>
  );
}
