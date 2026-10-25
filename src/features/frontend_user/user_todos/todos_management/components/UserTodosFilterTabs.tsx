/**
 * RESPONSIBILITY: Filter tab selector for User Todos (≤60 lines).
 * FLOW: Renders status pills (All, Today, Starred, Completed) with active highlight.
 */

import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import type { TodoFilterType } from '../types/user_todos.types';
import { useThemeTokens } from '../../../../../core/theme/useThemeTokens';
import { triggerLightImpact } from '../../../../../core/interaction/haptics';

interface UserTodosFilterTabsProps {
  activeTab: TodoFilterType;
  onSelectTab: (tab: TodoFilterType) => void;
}

export function UserTodosFilterTabs({
  activeTab,
  onSelectTab,
}: UserTodosFilterTabsProps) {
  const tokens = useThemeTokens();
  const tabs: TodoFilterType[] = ['all', 'today', 'starred', 'completed'];

  const styles = StyleSheet.create({
    container: {
      flexDirection: 'row',
      paddingHorizontal: tokens.space[4],
      marginBottom: tokens.space[2],
      gap: tokens.space[2],
    },
    tabPill: {
      paddingHorizontal: tokens.space[3],
      paddingVertical: 6,
      borderRadius: tokens.radius.full,
      backgroundColor: tokens.color.card,
      borderWidth: 1,
      borderColor: tokens.color.border,
    },
    tabPillActive: {
      backgroundColor: tokens.color.primary,
      borderColor: tokens.color.primary,
    },
    tabText: {
      ...tokens.typography.caption,
      color: tokens.color.muted,
      fontWeight: '600',
    },
    tabTextActive: {
      color: tokens.color.onPrimary,
      fontWeight: '700',
    },
  });

  return (
    <View style={styles.container}>
      {tabs.map((tab) => (
        <Pressable
          key={tab}
          style={[styles.tabPill, activeTab === tab ? styles.tabPillActive : null]}
          onPress={() => {
            triggerLightImpact();
            onSelectTab(tab);
          }}
          accessibilityRole="button"
          accessibilityLabel={`Filter ${tab} tasks`}
        >
          <Text style={[styles.tabText, activeTab === tab ? styles.tabTextActive : null]}>
            {tab.toUpperCase()}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}
