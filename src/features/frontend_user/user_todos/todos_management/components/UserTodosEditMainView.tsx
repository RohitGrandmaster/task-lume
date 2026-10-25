/**
 * RESPONSIBILITY: Main View component for the User Todos Edit screen.
 * FLOW: Renders UserTodosTodoForm pre-populated with existing todo data; returns updated values on submit.
 */

import React from 'react';
import { View, StyleSheet, Text, Pressable } from 'react-native';
import { ArrowLeft } from 'lucide-react-native';
import { UserTodosTodoForm } from './UserTodosTodoForm';
import type { TodoEntity } from '../types/user_todos.types';
import type { TodoFormInput } from '../schemas/user_todos.schemas';
import { useThemeTokens } from '../../../../../core/theme/useThemeTokens';
import { getMinTouchTarget } from '../../../../../core/theme/getMinTouchTarget';
import { triggerLightImpact } from '../../../../../core/interaction/haptics';

interface UserTodosEditMainViewProps {
  todo: TodoEntity;
  categories: string[];
  onSubmit: (values: TodoFormInput) => void;
  isSubmitting?: boolean;
  onBack?: () => void;
}

export function UserTodosEditMainView({
  todo,
  categories,
  onSubmit,
  isSubmitting = false,
  onBack,
}: UserTodosEditMainViewProps) {
  const tokens = useThemeTokens();
  const minTarget = getMinTouchTarget();

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: tokens.color.background,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: tokens.space[4],
      paddingTop: tokens.space[2],
      paddingBottom: tokens.space[2],
      gap: tokens.space[2],
    },
    backButton: {
      width: minTarget,
      height: minTarget,
      borderRadius: tokens.radius.md,
      backgroundColor: tokens.color.card,
      borderWidth: 1,
      borderColor: tokens.color.border,
      alignItems: 'center',
      justifyContent: 'center',
    },
    title: {
      ...tokens.typography.headingLg,
      color: tokens.color.foreground,
    },
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        {onBack ? (
          <Pressable
            style={styles.backButton}
            onPress={() => {
              triggerLightImpact();
              onBack();
            }}
            accessibilityRole="button"
            accessibilityLabel="Go back"
            hitSlop={8}
          >
            <ArrowLeft size={20} color={tokens.color.foreground} strokeWidth={2.2} />
          </Pressable>
        ) : null}
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
