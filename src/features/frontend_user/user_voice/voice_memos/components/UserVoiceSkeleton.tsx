/**
 * RESPONSIBILITY: Layout-mimicking skeleton loading state for Voice Memos list.
 * FLOW: Rendered during audio recordings retrieval from device storage.
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useThemeTokens } from '../../../../../core/theme/useThemeTokens';

export function UserVoiceSkeleton() {
  const tokens = useThemeTokens();

  const styles = StyleSheet.create({
    container: {
      padding: tokens.space[4],
    },
    card: {
      height: 76,
      backgroundColor: tokens.color.card,
      borderRadius: tokens.radius.lg,
      borderWidth: 1,
      borderColor: tokens.color.border,
      padding: tokens.space[4],
      justifyContent: 'center',
      marginBottom: tokens.space[3],
    },
    titleBar: {
      width: '55%',
      height: 14,
      borderRadius: tokens.radius.sm,
      backgroundColor: tokens.color.skeletonBase,
      marginBottom: tokens.space[2],
    },
    durationBar: {
      width: '25%',
      height: 10,
      borderRadius: tokens.radius.sm,
      backgroundColor: tokens.color.skeletonHighlight,
    },
  });

  return (
    <View style={styles.container} accessible={true} accessibilityLabel="Loading voice memos">
      {[1, 2, 3].map((i) => (
        <View key={i} style={styles.card}>
          <View style={styles.titleBar} />
          <View style={styles.durationBar} />
        </View>
      ))}
    </View>
  );
}
