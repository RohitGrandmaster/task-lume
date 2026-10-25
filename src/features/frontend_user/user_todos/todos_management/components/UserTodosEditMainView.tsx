/**
 * RESPONSIBILITY: Main View component for the User Todos Edit screen.
 * FLOW: Renders UserTodosTodoForm pre-populated with existing todo data; returns updated values on submit.
 */

import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { UserTodosTodoForm } from './UserTodosTodoForm';
import type { TodoEntity } from '../types/user_todos.types';
import type { TodoFormInput } from '../schemas/user_todos.schemas';
import { useThemeTokens } from '../../../../core/theme/useThemeTokens';

interface UserTodosEditMainViewProps {
  todo: TodoEntity;
  categories: string[];
  onSubmit: (values: TodoFormInput) => void;
  isSubmitting?: boolean;
}

export function UserTodosEditMainView({
  todo,
  categories,
  onSubmit,
  isSubmitting = false,
}: UserTodosEditMainViewProps) {
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
        <Text style={styles.title}>Edit Task</Text>
      </View>
      <UserTodosTodoForm
        initialValues={todo}
        categories={categories}
        onSubmit={onSubmit}
        isSubmitting={isSubmitting}
        submitLabel="Update Task"
      />
    </View>
  );
}
