/**
 * RESPONSIBILITY: Empty state fallback component for Settings.
 * FLOW: Rendered when user profile data or preferences cannot be found.
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Sliders } from 'lucide-react-native';
import { useThemeTokens } from '../../../../core/theme/useThemeTokens';

interface UserSettingsEmptyStateProps {
  title?: string;
  description?: string;
}

export function UserSettingsEmptyState({
  title = 'Default preferences active',
  description = 'Your device defaults and standard privacy settings are currently active.',
}: UserSettingsEmptyStateProps) {
  const tokens = useThemeTokens();

  const styles = StyleSheet.create({
    container: {
      padding: tokens.space[6],
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: tokens.space[8],
    },
    iconWrapper: {
      width: 64,
      height: 64,
      borderRadius: tokens.radius.full,
      backgroundColor: tokens.color.primarySubtle,
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
    description: {
      ...tokens.typography.bodySm,
      color: tokens.color.muted,
      textAlign: 'center',
      maxWidth: 280,
    },
  });

  return (
    <View style={styles.container}>
      <View style={styles.iconWrapper}>
        <Sliders size={32} color={tokens.color.primary} />
      </View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.description}>{description}</Text>
    </View>
  );
}
