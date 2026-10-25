/**
 * RESPONSIBILITY: Empty state component for Voice Memos screen.
 * FLOW: Rendered when user has no voice recordings yet.
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Mic } from 'lucide-react-native';
import { useThemeTokens } from '../../../../../core/theme/useThemeTokens';
import { useTranslation } from '../../../../../core/i18n/useTranslation';

interface UserVoiceEmptyStateProps {
  title?: string;
  description?: string;
}

export function UserVoiceEmptyState({
  title,
  description,
}: UserVoiceEmptyStateProps) {
  const tokens = useThemeTokens();
  const { t } = useTranslation();

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

  const resolvedTitle = title ?? t('user_voice_memos.EMPTY_TITLE');
  const resolvedDescription = description ?? t('user_voice_memos.EMPTY_DESCRIPTION');

  return (
    <View style={styles.container}>
      <View style={styles.iconWrapper}>
        <Mic size={32} color={tokens.color.primary} />
      </View>
      <Text style={styles.title}>{resolvedTitle}</Text>
      <Text style={styles.description}>{resolvedDescription}</Text>
    </View>
  );
}
