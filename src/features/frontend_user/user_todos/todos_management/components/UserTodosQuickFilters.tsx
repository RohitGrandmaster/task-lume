/**
 * RESPONSIBILITY: Quick filter chip strip for User Todos (≤90 lines).
 * FLOW: Renders quick filters for Today, High Priority, and Favorites with active states.
 */

import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Calendar, Flame, Star } from 'lucide-react-native';
import { useThemeTokens } from '../../../../../core/theme/useThemeTokens';
import { triggerLightImpact } from '../../../../../core/interaction/haptics';

export type QuickFilterKey = 'today' | 'high' | 'starred' | null;

interface UserTodosQuickFiltersProps {
  activeQuickFilter: QuickFilterKey;
  onSelectQuickFilter: (key: QuickFilterKey) => void;
}

export function UserTodosQuickFilters({
  activeQuickFilter,
  onSelectQuickFilter,
}: UserTodosQuickFiltersProps) {
  const tokens = useThemeTokens();

  const filters = [
    { key: 'today' as const, label: 'Today', icon: Calendar },
    { key: 'high' as const, label: 'High Priority', icon: Flame },
    { key: 'starred' as const, label: 'Favorites', icon: Star },
  ];

  const styles = StyleSheet.create({
    container: {
      flexDirection: 'row',
      paddingHorizontal: tokens.space[4],
      marginBottom: tokens.space[2],
      gap: tokens.space[2],
    },
    chip: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: tokens.space[1],
      paddingHorizontal: tokens.space[3],
      paddingVertical: 7,
      borderRadius: tokens.radius.full,
      backgroundColor: tokens.color.card,
      borderWidth: 1,
      borderColor: tokens.color.border,
    },
    chipActive: {
      backgroundColor: tokens.color.primarySubtle,
      borderColor: tokens.color.primary,
    },
    chipText: {
      ...tokens.typography.caption,
      fontWeight: '600',
      color: tokens.color.muted,
    },
    chipTextActive: {
      color: tokens.color.primaryText,
      fontWeight: '700',
    },
  });

  return (
    <View style={styles.container}>
      {filters.map((f) => {
        const Icon = f.icon;
        const isActive = activeQuickFilter === f.key;
        return (
          <Pressable
            key={f.key}
            style={[styles.chip, isActive ? styles.chipActive : null]}
            onPress={() => {
              triggerLightImpact();
              onSelectQuickFilter(isActive ? null : f.key);
            }}
            accessibilityRole="button"
            accessibilityLabel={`Filter by ${f.label}`}
          >
            <Icon
              size={13}
              color={isActive ? tokens.color.primary : tokens.color.muted}
              strokeWidth={2.4}
            />
            <Text style={[styles.chipText, isActive ? styles.chipTextActive : null]}>
              {f.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
