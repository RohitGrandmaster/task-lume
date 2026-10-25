/**
 * RESPONSIBILITY: Resilient Error Fallback view for the Pomodoro Timer.
 * FLOW: Rendered when background timer persistence or state restoration fails.
 */

import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { AlertTriangle, RefreshCw } from 'lucide-react-native';
import { useThemeTokens } from '../../../../../core/theme/useThemeTokens';
import { getMinTouchTarget } from '../../../../../core/theme/getMinTouchTarget';

interface UserPomodoroErrorFallbackProps {
  message?: string;
  onRetry?: () => void;
}

export function UserPomodoroErrorFallback({
  message = 'Failed to load timer state',
  onRetry,
}: UserPomodoroErrorFallbackProps) {
  const tokens = useThemeTokens();
  const minTarget = getMinTouchTarget();

  const styles = StyleSheet.create({
    container: {
      padding: tokens.space[6],
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: tokens.space[8],
    },
    iconWrapper: {
      width: 56,
      height: 56,
      borderRadius: tokens.radius.full,
      backgroundColor: tokens.color.statusDangerBg,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: tokens.space[4],
    },
    title: {
      ...tokens.typography.headingSm,
      color: tokens.color.foreground,
      textAlign: 'center',
      marginBottom: tokens.space[2],
    },
    message: {
      ...tokens.typography.bodySm,
      color: tokens.color.muted,
      textAlign: 'center',
      maxWidth: 280,
      marginBottom: tokens.space[5],
    },
    retryButton: {
      height: minTarget,
      paddingHorizontal: tokens.space[5],
      backgroundColor: tokens.color.card,
      borderRadius: tokens.radius.md,
      borderWidth: 1,
      borderColor: tokens.color.border,
      flexDirection: 'row',
      alignItems: 'center',
      gap: tokens.space[2],
    },
    retryText: {
      ...tokens.typography.labelUppercase,
      color: tokens.color.foreground,
      fontWeight: '600',
    },
  });

  return (
    <View style={styles.container} accessible={true} accessibilityLabel="Error loading timer">
      <View style={styles.iconWrapper}>
        <AlertTriangle size={28} color={tokens.color.statusDangerText} />
      </View>
      <Text style={styles.title}>Timer Error</Text>
      <Text style={styles.message}>{message}</Text>
      {onRetry && (
        <Pressable
          style={styles.retryButton}
          onPress={onRetry}
          accessibilityRole="button"
          accessibilityLabel="Retry timer"
        >
          <RefreshCw size={16} color={tokens.color.foreground} />
          <Text style={styles.retryText}>Reset Timer</Text>
        </Pressable>
      )}
    </View>
  );
}
