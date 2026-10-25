/**
 * RESPONSIBILITY: Empty state component for Reminders list.
 * FLOW: Rendered when user has no active alarm reminders scheduled.
 */

import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Bell } from 'lucide-react-native';
import { useThemeTokens } from '../../../../core/theme/useThemeTokens';
import { getMinTouchTarget } from '../../../../core/theme/getMinTouchTarget';

interface UserRemindersEmptyStateProps {
  title?: string;
  description?: string;
  ctaLabel?: string;
  onPressCta?: () => void;
}

export function UserRemindersEmptyState({
  title = 'No active reminders',
  description = 'Add due dates and reminder alerts to your tasks to see scheduled notifications here.',
  ctaLabel = 'Create Task',
  onPressCta,
}: UserRemindersEmptyStateProps) {
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
    },
    buttonText: {
      ...tokens.typography.labelUppercase,
      color: tokens.color.onPrimary,
      fontWeight: '700',
    },
  });

  return (
    <View style={styles.container}>
      <View style={styles.iconWrapper}>
        <Bell size={32} color={tokens.color.primary} />
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
