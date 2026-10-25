/**
 * RESPONSIBILITY: Thin Screen entry point for User Todos Detail view (≤80 lines).
 * FLOW: Composes SafeAreaView, StatusBar, and UserTodosDetailMainView; routes actions to navigator or useTodos hook.
 */

import React, { useMemo } from 'react';
import { StatusBar, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { UserTodosDetailMainView } from '../components/UserTodosDetailMainView';
import { useThemeTokens } from '../../../../../core/theme/useThemeTokens';
import { useUserTodos } from '../hooks/useUserTodos';
import { USER_TODOS_ROUTES, type UserTodosStackParamList } from '../config/user_todos.url_config';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { TodoEntity } from '../types/user_todos.types';
import { useConfirm } from '../../../../../core/hooks/useConfirm';
import { UserTodosEmptyState } from '../components/UserTodosEmptyState';

export function UserTodosDetailScreen({ route, navigation }: NativeStackScreenProps<UserTodosStackParamList, typeof USER_TODOS_ROUTES.DETAIL>) {
  const tokens = useThemeTokens();
  const { id } = route.params;
  const { todos, deleteTodo, toggleComplete, toggleFavorite } = useUserTodos();
  const { confirm, confirmDialog } = useConfirm();

  const todo = useMemo(() => (todos as TodoEntity[]).find((task) => String(task.id) === id), [todos, id]);

  const handleDelete = async () => {
    const confirmed = await confirm({
      title: 'Move task to Trash?',
      message: 'The task will leave your active list and can be restored from Trash.',
      confirmLabel: 'Move to Trash',
      cancelLabel: 'Keep Task',
      destructive: true,
    }, () => deleteTodo(id));
    if (confirmed) navigation.goBack();
  };

  const handleEdit = () => {
    navigation.navigate(USER_TODOS_ROUTES.EDIT, { id });
  };

  const styles = StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: tokens.color.background,
    },
  });

  if (!todo) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        <StatusBar barStyle={tokens.isDark ? 'light-content' : 'dark-content'} />
        <UserTodosEmptyState
          title="Task not found"
          description="This task may have been moved to Trash or removed."
          ctaLabel="Back to Tasks"
          onPressCta={() => navigation.goBack()}
        />
        {confirmDialog}
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <StatusBar
        barStyle={tokens.isDark ? 'light-content' : 'dark-content'}
      />
      <UserTodosDetailMainView
        todo={todo}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onToggleComplete={() => toggleComplete(id)}
        onToggleFavorite={() => toggleFavorite(id)}
      />
      {confirmDialog}
    </SafeAreaView>
  );
}
