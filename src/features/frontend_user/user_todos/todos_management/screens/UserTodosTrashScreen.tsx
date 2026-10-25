/**
 * RESPONSIBILITY: Thin Screen entry point for User Todos Trash view (≤80 lines).
 * FLOW: Composes SafeAreaView, StatusBar, and UserTodosTrashMainView; routes restore and purge actions.
 */

import React, { useMemo } from 'react';
import { StatusBar, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { UserTodosTrashMainView } from '../components/UserTodosTrashMainView';
import { useThemeTokens } from '../../../../../core/theme/useThemeTokens';
import { useUserTodos } from '../hooks/useUserTodos';

export function UserTodosTrashScreen() {
  const tokens = useThemeTokens();
  const { todos, restoreTodo, permanentDeleteTodo, emptyTrash } = useUserTodos();

  const trashTodos = useMemo(() => todos.filter((t: any) => t.deleted), [todos]);

  const styles = StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: tokens.color.background,
    },
  });

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <StatusBar
        barStyle={tokens.isDark ? 'light-content' : 'dark-content'}
        backgroundColor={tokens.color.background}
      />
      <UserTodosTrashMainView
        trashTodos={trashTodos}
        onRestore={restoreTodo}
        onPermanentDelete={permanentDeleteTodo}
        onEmptyTrash={emptyTrash}
      />
    </SafeAreaView>
  );
}
