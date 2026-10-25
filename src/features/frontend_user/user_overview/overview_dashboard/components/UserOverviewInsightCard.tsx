/**
 * RESPONSIBILITY: Compact insight card for User Overview metrics (≤200 lines).
 * FLOW: Renders icon, value, suffix, and label.
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import type { LucideIcon } from 'lucide-react-native';
import { useThemeTokens } from '../../../../../core/theme/useThemeTokens';

interface UserOverviewInsightCardProps {
  icon: LucideIcon;
  iconColor?: string;
  label: string;
  value: string | number;
  suffix?: string;
  fullWidth?: boolean;
}

export function UserOverviewInsightCard({
  icon: Icon,
  iconColor,
  label,
  value,
  suffix,
  fullWidth = false,
}: UserOverviewInsightCardProps) {
  const tokens = useThemeTokens();
  const tint = iconColor || tokens.color.primary;

  const styles = StyleSheet.create({
    card: {
      width: fullWidth ? '100%' : '48.5%',
      padding: tokens.space[3],
      borderRadius: tokens.radius.lg,
      borderWidth: 1,
      borderColor: tokens.color.border,
      backgroundColor: tokens.color.card,
      marginBottom: tokens.space[2],
    },
    iconWrap: {
      width: 28,
      height: 28,
      borderRadius: tokens.radius.sm,
      backgroundColor: tokens.color.primarySubtle,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: tokens.space[2],
    },
    value: {
      ...tokens.typography.headingSm,
      color: tokens.color.foreground,
    },
    suffix: {
      ...tokens.typography.caption,
      color: tokens.color.muted,
      marginLeft: 2,
    },
    label: {
      ...tokens.typography.caption,
      color: tokens.color.muted,
      marginTop: 2,
    },
  });

  return (
    <View style={styles.card}>
      <View style={styles.iconWrap}>
        <Icon size={16} color={tint} />
      </View>
      <Text style={styles.value} numberOfLines={1}>
        {value}
        {suffix ? <Text style={styles.suffix}>{suffix}</Text> : null}
      </Text>
      <Text style={styles.label} numberOfLines={1}>{label}</Text>
    </View>
  );
}
