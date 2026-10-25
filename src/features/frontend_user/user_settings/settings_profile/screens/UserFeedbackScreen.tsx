/**
 * RESPONSIBILITY: Thin Screen entry point for User Feedback (≤80 lines).
 * FLOW: Renders SafeAreaView, StatusBar, and UserFeedbackMainView.
 */

import React from 'react';
import { StatusBar, StyleSheet } from 'react-native';
import { showToast } from '../../../../../core/toast/showToast';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { UserFeedbackMainView } from '../components/UserFeedbackMainView';
import { useThemeTokens } from '../../../../../core/theme/useThemeTokens';

export function UserFeedbackScreen() {
  const navigation = useNavigation<any>();
  const tokens = useThemeTokens();

  const handleSubmitFeedback = (data: { category: string; rating: number; message: string }) => {
    showToast('Your feedback has been received. Thank you!', 'success');
    navigation.goBack();
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
      <UserFeedbackMainView
        onSubmit={handleSubmitFeedback}
        onBack={() => navigation.goBack()}
      />
    </SafeAreaView>
  );
}
