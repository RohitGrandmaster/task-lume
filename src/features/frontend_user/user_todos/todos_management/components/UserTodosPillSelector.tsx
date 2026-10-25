/**
 * RESPONSIBILITY: Reusable horizontal chip / pill selector for Todo priorities and categories.
 * FLOW: Rendered in UserTodosTodoForm; handles pill selection with light haptic feedback.
 */

import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useThemeTokens } from '../../../../../core/theme/useThemeTokens';
import { triggerLightImpact } from '../../../../../core/interaction/haptics';
import { useTranslation } from '../../../../../core/i18n/useTranslation';
import { getMinTouchTarget } from '../../../../../core/theme/getMinTouchTarget';

interface UserTodosPillSelectorProps<T extends string> {
  label: string;
  options: T[];
  selected: T;
  onSelect: (option: T) => void;
  formatOption?: (option: T) => string;
}

export function UserTodosPillSelector<T extends string>({
  label,
  options,
  selected,
  onSelect,
  formatOption = (opt) => opt,
}: UserTodosPillSelectorProps<T>) {
  const tokens = useThemeTokens();
  const { t } = useTranslation();
  const minTarget = getMinTouchTarget();

  const styles = StyleSheet.create({
    container: {
      marginBottom: tokens.space[4],
    },
    label: {
      ...tokens.typography.caption,
      color: tokens.color.foreground,
      fontWeight: '600',
      marginBottom: tokens.space[2],
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    optionsRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: tokens.space[2],
    },
    pill: {
      minHeight: minTarget,
      paddingHorizontal: tokens.space[3],
      borderRadius: tokens.radius.full,
      borderWidth: 1,
      borderColor: tokens.color.border,
      backgroundColor: tokens.color.card,
      alignItems: 'center',
      justifyContent: 'center',
    },
    pillActive: {
      backgroundColor: tokens.color.primary,
      borderColor: tokens.color.primary,
    },
    pillText: {
      ...tokens.typography.caption,
      color: tokens.color.muted,
      fontWeight: '600',
    },
    pillTextActive: {
      color: tokens.color.onPrimary,
    },
  });

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.optionsRow}>
        {options.map((opt) => {
          const isActive = opt === selected;
          return (
            <Pressable
              key={opt}
              style={[styles.pill, isActive ? styles.pillActive : null]}
              onPress={() => {
                triggerLightImpact();
                onSelect(opt);
              }}
              accessibilityRole="button"
              accessibilityState={{ selected: isActive }}
              accessibilityLabel={t('user_todos_management.SELECT_OPTION').replace('{option}', formatOption(opt))}
              testID={`user_todos-pill-${String(opt).toLowerCase().replace(/[^a-z0-9]+/g, '-')}`}
            >
              <Text style={[styles.pillText, isActive ? styles.pillTextActive : null]}>
                {formatOption(opt)}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
