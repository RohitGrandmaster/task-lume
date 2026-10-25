/**
 * RESPONSIBILITY: Main View component for the User Todos Favorites / Starred screen.
 * FLOW: Filters tasks by favorite status; renders UserTodosTodoList with Starred title.
 */

import React, { useMemo } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import type { TodoEntity } from '../types/user_todos.types';
import { UserTodosTodoList } from './UserTodosTodoList';
import { useThemeTokens } from '../../../../core/theme/useThemeTokens';

interface UserTodosFavoritesMainViewProps {
  todos: TodoEntity[];
  onPressTodo: (todo: TodoEntity) => void;
  onToggleComplete: (id: string) => void;
  onToggleFavorite: (id: string) => void;
  refreshing?: boolean;
  onRefresh?: () => void;
}

export function UserTodosFavoritesMainView({
  todos,
  onPressTodo,
  onToggleComplete,
  onToggleFavorite,
  refreshing = false,
  onRefresh = () => {},
}: UserTodosFavoritesMainViewProps) {
  const tokens = useThemeTokens();

  const favoriteTodos = useMemo(() => {
    return todos.filter((t) => t.favorite && !t.deleted);
  }, [todos]);

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: tokens.color.background,
    },
    header: {
      paddingHorizontal: tokens.space[4],
      paddingVertical: tokens.space[3],
    },
    title: {
      ...tokens.typography.headingLg,
      color: tokens.color.foreground,
    },
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Starred Tasks</Text>
      </View>
      <UserTodosTodoList
        todos={favoriteTodos}
        refreshing={refreshing}
        onRefresh={onRefresh}
        onPressTodo={onPressTodo}
        onToggleComplete={onToggleComplete}
        onToggleFavorite={onToggleFavorite}
        emptyTitle="No starred tasks"
        emptyDescription="Tap the star icon on any task to pin it here for quick access."
      />
    </View>
  );
}
