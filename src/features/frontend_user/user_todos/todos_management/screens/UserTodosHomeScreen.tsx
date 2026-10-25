/**
 * RESPONSIBILITY: Thin Screen entry point for User Todos Home view (≤80 lines).
 * FLOW: Composes SafeAreaView, StatusBar, and UserTodosHomeMainView; zero business logic.
 */

import React from 'react';
import { StatusBar, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { DrawerActions } from '@react-navigation/native';
import { UserTodosHomeMainView } from '../components/UserTodosHomeMainView';
import { useThemeTokens } from '../../../../../core/theme/useThemeTokens';
import { useUserTodos } from '../hooks/useUserTodos';
import { USER_TODOS_ROUTES, type UserTodosStackParamList } from '../config/user_todos.url_config';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { TodoEntity } from '../types/user_todos.types';

export function UserTodosHomeScreen({ navigation }: NativeStackScreenProps<UserTodosStackParamList, typeof USER_TODOS_ROUTES.HOME>) {
  const tokens = useThemeTokens();
  const { todos, categories, toggleComplete, toggleFavorite, refreshTodos, loading } = useUserTodos();

  const handleOpenDrawer = () => {
    navigation.dispatch(DrawerActions.openDrawer());
  };

  const handlePressAdd = () => {
    navigation.navigate(USER_TODOS_ROUTES.ADD);
  };

  const handlePressTodo = (todo: TodoEntity) => {
    navigation.navigate(USER_TODOS_ROUTES.DETAIL, { id: todo.id });
  };

  const handlePressReminders = () => {
    navigation.navigate('Reminders');
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
      <UserTodosHomeMainView
        todos={todos}
        categories={categories}
        onOpenDrawer={handleOpenDrawer}
        onPressAdd={handlePressAdd}
        onPressTodo={handlePressTodo}
        onToggleComplete={toggleComplete}
        onToggleFavorite={toggleFavorite}
        onPressReminders={handlePressReminders}
        refreshing={loading}
        onRefresh={refreshTodos}
      />
    </SafeAreaView>
  );
}
