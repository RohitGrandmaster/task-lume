/**
 * RESPONSIBILITY: Layout-mimicking skeleton loading state for Pomodoro Timer.
 * FLOW: Rendered during timer initialization; prevents layout shift.
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useThemeTokens } from '../../../../../core/theme/useThemeTokens';

export function UserPomodoroSkeleton() {
  const tokens = useThemeTokens();

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      padding: tokens.space[4],
    },
    dialPlaceholder: {
      width: 240,
      height: 240,
      borderRadius: 120,
      backgroundColor: tokens.color.card,
      borderWidth: 6,
      borderColor: tokens.color.border,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: tokens.space[8],
    },
    innerBar: {
      width: 120,
      height: 36,
      borderRadius: tokens.radius.sm,
      backgroundColor: tokens.color.skeletonBase,
      marginBottom: tokens.space[2],
    },
    subBar: {
      width: 60,
      height: 12,
      borderRadius: tokens.radius.sm,
      backgroundColor: tokens.color.skeletonHighlight,
    },
    controlsRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: tokens.space[5],
    },
    buttonPlaceholder: {
      width: 68,
      height: 68,
      borderRadius: 34,
      backgroundColor: tokens.color.skeletonBase,
    },
    sideButtonPlaceholder: {
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: tokens.color.skeletonHighlight,
    },
  });

  return (
    <View style={styles.container} accessible={true} accessibilityLabel="Loading Pomodoro timer">
      <View style={styles.dialPlaceholder}>
        <View style={styles.innerBar} />
        <View style={styles.subBar} />
      </View>
      <View style={styles.controlsRow}>
        <View style={styles.sideButtonPlaceholder} />
        <View style={styles.buttonPlaceholder} />
        <View style={styles.sideButtonPlaceholder} />
      </View>
    </View>
  );
}
