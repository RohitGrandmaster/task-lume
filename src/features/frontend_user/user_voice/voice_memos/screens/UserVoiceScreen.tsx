/**
 * RESPONSIBILITY: Thin Screen entry point for User Voice Memos view (≤80 lines).
 * FLOW: Composes SafeAreaView, StatusBar, and UserVoiceMainView; zero business logic.
 */

import React from 'react';
import { StatusBar, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { DrawerActions } from '@react-navigation/native';
import { UserVoiceMainView } from '../components/UserVoiceMainView';
import { useThemeTokens } from '../../../../../core/theme/useThemeTokens';

export function UserVoiceScreen({ navigation }: { navigation?: any }) {
  const tokens = useThemeTokens();

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
      />
      <UserVoiceMainView onOpenDrawer={handleOpenDrawer} />
    </SafeAreaView>
  );
}
