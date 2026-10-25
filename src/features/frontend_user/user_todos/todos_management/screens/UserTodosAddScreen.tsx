/**
 * RESPONSIBILITY: Thin Screen entry point for User Todos Add view (≤80 lines).
 * FLOW: Composes SafeAreaView, StatusBar, and UserTodosAddMainView; delegates persistence to useTodos hook.
 */

import React, { useState } from 'react';
import { StatusBar, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { UserTodosAddMainView } from '../components/UserTodosAddMainView';
import { useThemeTokens } from '../../../../../core/theme/useThemeTokens';
import { useUserTodos } from '../hooks/useUserTodos';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { UserTodosStackParamList } from '../config/user_todos.url_config';
import type { TodoFormInput } from '../schemas/user_todos.schemas';
import { showToast } from '../../../../../core/toast/showToast';

export function UserTodosAddScreen({ navigation }: NativeStackScreenProps<UserTodosStackParamList, typeof USER_TODOS_ROUTES.ADD>) {
  const tokens = useThemeTokens();
  const { categories, addTodo } = useUserTodos();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (values: TodoFormInput) => {
    setIsSubmitting(true);
    try {
      await addTodo(values);
      navigation.goBack();
    } catch (error) {
      showToast('Task could not be saved. Your entries are still available.', 'error', 'user-todos-create-failed');
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

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <StatusBar
        barStyle={tokens.isDark ? 'light-content' : 'dark-content'}
        backgroundColor={tokens.color.background}
      />
      <UserTodosAddMainView
        categories={categories}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
      />
    </SafeAreaView>
  );
}
