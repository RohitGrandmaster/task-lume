/**
 * RESPONSIBILITY: Thin Screen entry point for User Todos Edit view (≤80 lines).
 * FLOW: Composes SafeAreaView, StatusBar, and UserTodosEditMainView; forwards updates to useTodos hook.
 */

import React, { useMemo, useState } from 'react';
import { StatusBar, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { UserTodosEditMainView } from '../components/UserTodosEditMainView';
import { useThemeTokens } from '../../../../../core/theme/useThemeTokens';
import { useUserTodos } from '../hooks/useUserTodos';
import { USER_TODOS_ROUTES, type UserTodosStackParamList } from '../config/user_todos.url_config';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { TodoEntity } from '../types/user_todos.types';
import type { TodoFormInput } from '../schemas/user_todos.schemas';
import { UserTodosEmptyState } from '../components/UserTodosEmptyState';
import { showToast } from '../../../../../core/toast/showToast';

export function UserTodosEditScreen({ route, navigation }: NativeStackScreenProps<UserTodosStackParamList, typeof USER_TODOS_ROUTES.EDIT>) {
  const tokens = useThemeTokens();
  const { id } = route.params;
  const { todos, categories, updateTodo } = useUserTodos();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const todo = useMemo(() => (todos as TodoEntity[]).find((task) => String(task.id) === id), [todos, id]);

  const handleSubmit = async (values: TodoFormInput) => {
    setIsSubmitting(true);
    try {
      await updateTodo(id, values);
      navigation.goBack();
    } catch (error) {
      showToast('Task could not be updated. Your entries are still available.', 'error', `user-todos-update-failed-${id}`);
      throw error;
    } finally {
      setIsSubmitting(false);
    }
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
        <StatusBar barStyle={tokens.isDark ? 'light-content' : 'dark-content'} backgroundColor={tokens.color.background} />
        <UserTodosEmptyState title="Task not found" description="This task may have been moved to Trash or removed." ctaLabel="Back to Tasks" onPressCta={() => navigation.goBack()} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <StatusBar
        barStyle={tokens.isDark ? 'light-content' : 'dark-content'}
        backgroundColor={tokens.color.background}
      />
      <UserTodosEditMainView
        todo={todo}
        categories={categories}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
      />
    </SafeAreaView>
  );
}
