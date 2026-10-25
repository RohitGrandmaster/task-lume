/**
 * RESPONSIBILITY: Safe Error Fallback component for Todo domain failures.
 * FLOW: Rendered when task loading or storage operations encounter exceptions; provides user retry action.
 */

import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { AlertCircle } from 'lucide-react-native';
import { useThemeTokens } from '../../../../core/theme/useThemeTokens';
import { getMinTouchTarget } from '../../../../core/theme/getMinTouchTarget';

interface UserTodosErrorFallbackProps {
  message?: string;
  onRetry: () => void;
}

export function UserTodosErrorFallback({
  message = 'An unexpected error occurred while loading your tasks.',
  onRetry,
}: UserTodosErrorFallbackProps) {
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
      marginBottom: tokens.space[2],
    },
    message: {
      ...tokens.typography.bodySm,
      color: tokens.color.muted,
      textAlign: 'center',
      marginBottom: tokens.space[5],
      maxWidth: 260,
    },
    button: {
      height: minTarget,
      paddingHorizontal: tokens.space[6],
      backgroundColor: tokens.color.destructive,
      borderRadius: tokens.radius.md,
      alignItems: 'center',
      justifyContent: 'center',
      minWidth: tokens.layout.buttonMinWidth,
    },
    buttonText: {
      ...tokens.typography.bodySm,
      color: tokens.color.onDestructive,
      fontWeight: '600',
    },
  });

  return (
    <View style={styles.container}>
      <View style={styles.iconWrapper}>
        <AlertCircle size={28} color={tokens.color.destructive} />
      </View>
      <Text style={styles.title}>Unable to load tasks</Text>
      <Text style={styles.message}>{message}</Text>
      <Pressable
        style={styles.button}
        onPress={onRetry}
        accessibilityRole="button"
        accessibilityLabel="Try again"
      >
        <Text style={styles.buttonText}>Try Again</Text>
      </Pressable>
    </View>
  );
}
