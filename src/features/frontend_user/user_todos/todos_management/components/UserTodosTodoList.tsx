/**
 * RESPONSIBILITY: Virtualized Todo list with pull-to-refresh, empty states, and optimized item rendering.
 * FLOW: Receives task array from MainView; renders UserTodosTodoCard items with stable keys and performance guards.
 */

import React, { useCallback } from 'react';
import { FlatList, RefreshControl, StyleSheet, View } from 'react-native';
import type { TodoEntity } from '../types/user_todos.types';
import { UserTodosTodoCard } from './UserTodosTodoCard';
import { UserTodosEmptyState } from './UserTodosEmptyState';
import { useThemeTokens } from '../../../../../core/theme/useThemeTokens';

interface UserTodosTodoListProps {
  todos: TodoEntity[];
  refreshing: boolean;
  onRefresh: () => void;
  onPressTodo: (todo: TodoEntity) => void;
  onToggleComplete: (id: string) => void;
  onToggleFavorite: (id: string) => void;
  onPressEmptyCta?: () => void;
  emptyTitle?: string;
  emptyDescription?: string;
}

export function UserTodosTodoList({
  todos,
  refreshing,
  onRefresh,
  onPressTodo,
  onToggleComplete,
  onToggleFavorite,
  onPressEmptyCta,
  emptyTitle,
  emptyDescription,
}: UserTodosTodoListProps) {
  const tokens = useThemeTokens();

  const renderItem = useCallback(
    ({ item }: { item: TodoEntity }) => (
      <UserTodosTodoCard
        todo={item}
        onPress={onPressTodo}
        onToggleComplete={onToggleComplete}
        onToggleFavorite={onToggleFavorite}
      />
    ),
    [onPressTodo, onToggleComplete, onToggleFavorite]
  );

  const keyExtractor = useCallback((item: TodoEntity) => String(item.id), []);

  const styles = StyleSheet.create({
    listContent: {
      paddingHorizontal: tokens.space[4],
      paddingTop: tokens.space[2],
      paddingBottom: tokens.space[9],
      flexGrow: 1,
    },
  });

  return (
    <FlatList
      data={todos}
      keyExtractor={keyExtractor}
      renderItem={renderItem}
      contentContainerStyle={styles.listContent}
      windowSize={5}
      maxToRenderPerBatch={10}
      initialNumToRender={10}
      removeClippedSubviews={true}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={tokens.color.primary}
          colors={[tokens.color.primary]}
        />
      }
      ListEmptyComponent={
        <UserTodosEmptyState
          title={emptyTitle}
          description={emptyDescription}
          onPressCta={onPressEmptyCta}
        />
      }
    />
  );
}
