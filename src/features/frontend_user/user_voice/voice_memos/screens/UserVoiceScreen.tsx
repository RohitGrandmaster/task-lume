/**
 * RESPONSIBILITY: Thin Screen entry point for User Voice Memos view (≤80 lines).
 * FLOW: Composes SafeAreaView, StatusBar, and UserVoiceMainView; routes saved tasks to useTodos.
 */

import React from 'react';
import { StatusBar, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { UserVoiceMainView } from '../components/UserVoiceMainView';
import { useThemeTokens } from '../../../../core/theme/useThemeTokens';
import { useTodos } from '../../../../hooks/useTodos';

export function UserVoiceScreen() {
  const tokens = useThemeTokens();
  const { addTodo } = useTodos();

  const handleSaveAsTask = (transcript: string) => {
    addTodo({
      title: transcript,
      category: 'Personal',
      priority: 'medium',
    });
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
      <UserVoiceMainView onSaveAsTask={handleSaveAsTask} />
    </SafeAreaView>
  );
}
