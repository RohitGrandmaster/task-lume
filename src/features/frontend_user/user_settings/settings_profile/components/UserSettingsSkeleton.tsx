/**
 * RESPONSIBILITY: Layout-mimicking skeleton loading state for Settings profile view.
 * FLOW: Rendered during async settings and security state initialization.
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useThemeTokens } from '../../../../core/theme/useThemeTokens';

export function UserSettingsSkeleton() {
  const tokens = useThemeTokens();

  const styles = StyleSheet.create({
    container: {
      padding: tokens.space[4],
    },
    sectionCard: {
      backgroundColor: tokens.color.card,
      borderRadius: tokens.radius.lg,
      borderWidth: 1,
      borderColor: tokens.color.border,
      padding: tokens.space[4],
      marginBottom: tokens.space[4],
    },
    row: {
      height: 48,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    leftBar: {
      width: '50%',
      height: 14,
      borderRadius: tokens.radius.sm,
      backgroundColor: tokens.color.skeletonBase,
    },
    rightSwitch: {
      width: 44,
      height: 24,
      borderRadius: 12,
      backgroundColor: tokens.color.skeletonHighlight,
    },
  });

  return (
    <View style={styles.container} accessible={true} accessibilityLabel="Loading settings">
      {[1, 2].map((sec) => (
        <View key={sec} style={styles.sectionCard}>
          <View style={styles.row}>
            <View style={styles.leftBar} />
            <View style={styles.rightSwitch} />
          </View>
          <View style={styles.row}>
            <View style={styles.leftBar} />
            <View style={styles.rightSwitch} />
          </View>
        </View>
      ))}
    </View>
  );
}
