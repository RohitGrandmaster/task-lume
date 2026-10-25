/**
 * RESPONSIBILITY: Empty state visual component for Todo lists.
 * FLOW: Rendered when a list has zero records for the active filter/category; provides actionable CTA.
 */

import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { CheckCircle2 } from 'lucide-react-native';
import { useThemeTokens } from '../../../../../core/theme/useThemeTokens';
import { getMinTouchTarget } from '../../../../../core/theme/getMinTouchTarget';

interface UserTodosEmptyStateProps {
  title?: string;
  description?: string;
  ctaLabel?: string;
  onPressCta?: () => void;
}

export function UserTodosEmptyState({
  title = 'No tasks found',
  description = 'You have completed everything or haven’t added any tasks here yet.',
  ctaLabel = 'Create New Task',
  onPressCta,
}: UserTodosEmptyStateProps) {
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
      marginBottom: tokens.space[5],
    },
    button: {
      height: minTarget,
      paddingHorizontal: tokens.space[5],
      backgroundColor: tokens.color.primary,
      borderRadius: tokens.radius.md,
      alignItems: 'center',
      justifyContent: 'center',
      minWidth: tokens.layout.buttonMinWidth,
    },
    buttonText: {
      ...tokens.typography.bodySm,
      color: tokens.color.onPrimary,
      fontWeight: '600',
    },
  });

  return (
    <View style={styles.container}>
      <View style={styles.iconWrapper}>
        <CheckCircle2 size={32} color={tokens.color.primary} />
      </View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.description}>{description}</Text>
      {onPressCta && (
        <Pressable
          style={styles.button}
          onPress={onPressCta}
          accessibilityRole="button"
          accessibilityLabel={ctaLabel}
        >
          <Text style={styles.buttonText}>{ctaLabel}</Text>
        </Pressable>
      )}
    </View>
  );
}
