/**
 * RESPONSIBILITY: Main View component for the User Todos Add screen.
 * FLOW: Renders UserTodosTodoForm; forwards submitted values to the creation handler.
 */

import React from 'react';
import { View, StyleSheet, Text, Pressable } from 'react-native';
import { ArrowLeft } from 'lucide-react-native';
import { UserTodosTodoForm } from './UserTodosTodoForm';
import type { TodoFormInput } from '../schemas/user_todos.schemas';
import { useThemeTokens } from '../../../../../core/theme/useThemeTokens';
import { getMinTouchTarget } from '../../../../../core/theme/getMinTouchTarget';
import { triggerLightImpact } from '../../../../../core/interaction/haptics';

interface UserTodosAddMainViewProps {
  categories: string[];
  onSubmit: (values: TodoFormInput) => void;
  isSubmitting?: boolean;
  onBack?: () => void;
}

export function UserTodosAddMainView({
  categories,
  onSubmit,
  isSubmitting = false,
  onBack,
}: UserTodosAddMainViewProps) {
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
