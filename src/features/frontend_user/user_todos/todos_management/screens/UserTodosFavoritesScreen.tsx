/**
 * RESPONSIBILITY: Thin Screen entry point for User Todos Favorites view (≤80 lines).
 * FLOW: Composes SafeAreaView, StatusBar, and UserTodosFavoritesMainView; delegates to useTodos hook.
 */

import React from 'react';
import { StatusBar, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { UserTodosFavoritesMainView } from '../components/UserTodosFavoritesMainView';
import { useThemeTokens } from '../../../../../core/theme/useThemeTokens';
import { useTodos } from '../../../../../hooks/useTodos';
import { USER_TODOS_ROUTES } from '../config/user_todos.url_config';

export function UserTodosFavoritesScreen({ navigation }: { navigation: any }) {
  const tokens = useThemeTokens();
  const { todos, toggleComplete, toggleFavorite, refreshTodos, loading } = useTodos();

  const handlePressTodo = (todo: any) => {
    navigation.navigate(USER_TODOS_ROUTES.DETAIL, { id: todo.id });
  };

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
      <UserTodosFavoritesMainView
        todos={todos}
        onPressTodo={handlePressTodo}
        onToggleComplete={toggleComplete}
        onToggleFavorite={toggleFavorite}
        refreshing={loading}
        onRefresh={refreshTodos}
      />
    </SafeAreaView>
  );
}
