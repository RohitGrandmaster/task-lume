/**
 * RESPONSIBILITY: Thin Screen entry point for User Todos Categories view (≤80 lines).
 * FLOW: Composes SafeAreaView, StatusBar, and UserTodosCategoriesMainView; delegates to useTodos hook.
 */

import React from 'react';
import { StatusBar, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { UserTodosCategoriesMainView } from '../components/UserTodosCategoriesMainView';
import { useThemeTokens } from '../../../../../core/theme/useThemeTokens';
import { useTodos } from '../../../../../hooks/useTodos';

export function UserTodosCategoriesScreen() {
  const tokens = useThemeTokens();
  const { categories, todos, addCategory, deleteCategory } = useTodos();

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
      <UserTodosCategoriesMainView
        categories={categories}
        todos={todos}
        onAddCategory={addCategory}
        onDeleteCategory={deleteCategory}
      />
    </SafeAreaView>
  );
}
