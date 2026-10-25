/**
 * RESPONSIBILITY: Resilient Error Fallback view for the Calendar view.
 * FLOW: Rendered when calendar date calculations encounter an error.
 */

import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { AlertTriangle, RefreshCw } from 'lucide-react-native';
import { useThemeTokens } from '../../../../core/theme/useThemeTokens';
import { getMinTouchTarget } from '../../../../core/theme/getMinTouchTarget';

interface UserCalendarErrorFallbackProps {
  message?: string;
  onRetry?: () => void;
}

export function UserCalendarErrorFallback({
  message = 'Failed to load calendar agenda',
  onRetry,
}: UserCalendarErrorFallbackProps) {
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
    <View style={styles.container} accessible={true} accessibilityLabel="Error loading calendar">
      <View style={styles.iconWrapper}>
        <AlertTriangle size={28} color={tokens.color.statusDangerText} />
      </View>
      <Text style={styles.title}>Calendar Error</Text>
      <Text style={styles.message}>{message}</Text>
      {onRetry && (
        <Pressable
          style={styles.retryButton}
          onPress={onRetry}
          accessibilityRole="button"
          accessibilityLabel="Retry loading calendar"
        >
          <RefreshCw size={16} color={tokens.color.foreground} />
          <Text style={styles.retryText}>Retry</Text>
        </Pressable>
      )}
    </View>
  );
}
