/**
 * RESPONSIBILITY: Main View component for the User Todos Add screen.
 * FLOW: Renders UserTodosTodoForm; forwards submitted values to the creation handler.
 */

import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { UserTodosTodoForm } from './UserTodosTodoForm';
import type { TodoFormInput } from '../schemas/user_todos.schemas';
import { useThemeTokens } from '../../../../core/theme/useThemeTokens';

interface UserTodosAddMainViewProps {
  categories: string[];
  onSubmit: (values: TodoFormInput) => void;
  isSubmitting?: boolean;
}

export function UserTodosAddMainView({
  categories,
  onSubmit,
  isSubmitting = false,
}: UserTodosAddMainViewProps) {
  const tokens = useThemeTokens();

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: tokens.color.background,
    },
    header: {
      paddingHorizontal: tokens.space[4],
      paddingTop: tokens.space[3],
      paddingBottom: tokens.space[1],
    },
    title: {
      ...tokens.typography.headingLg,
      color: tokens.color.foreground,
    },
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>New Task</Text>
      </View>
      <UserTodosTodoForm
        categories={categories}
        onSubmit={onSubmit}
        isSubmitting={isSubmitting}
        submitLabel="Create Task"
      />
    </View>
  );
}
