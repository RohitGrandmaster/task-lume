/**
 * RESPONSIBILITY: Layout-mimicking skeleton loading state for Todo list screens.
 * FLOW: Rendered during async storage load or filter transitions; prevents layout shift without full-screen spinners.
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useThemeTokens } from '../../../../core/theme/useThemeTokens';

export function UserTodosSkeleton() {
  const tokens = useThemeTokens();

  const styles = StyleSheet.create({
    container: {
      paddingHorizontal: tokens.space[4],
      paddingVertical: tokens.space[3],
    },
    card: {
      height: 76,
      backgroundColor: tokens.color.card,
      borderRadius: tokens.radius.lg,
      marginBottom: tokens.space[3],
      borderWidth: 1,
      borderColor: tokens.color.border,
      padding: tokens.space[4],
      justifyContent: 'center',
    },
    titleBar: {
      width: '65%',
      height: 14,
      borderRadius: tokens.radius.sm,
      backgroundColor: tokens.color.skeletonBase,
      marginBottom: tokens.space[2],
    },
    subBar: {
      width: '35%',
      height: 10,
      borderRadius: tokens.radius.sm,
      backgroundColor: tokens.color.skeletonHighlight,
    },
  });

  return (
    <View style={styles.container} accessible={true} accessibilityLabel="Loading tasks">
      {[1, 2, 3, 4, 5].map((key) => (
        <View key={key} style={styles.card}>
          <View style={styles.titleBar} />
          <View style={styles.subBar} />
        </View>
      ))}
    </View>
  );
}
