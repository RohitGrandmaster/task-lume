/**
 * RESPONSIBILITY: Controlled form component for creating and editing Todo tasks with validation feedback.
 * FLOW: Rendered in UserTodosAddMainView and UserTodosEditMainView; validates fields and returns payload to handler.
 */

import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Pressable, ScrollView } from 'react-native';
import type { TodoPriority, TodoRecurrence } from '../types/user_todos.types';
import type { TodoFormInput } from '../schemas/user_todos.schemas';
import { validateTodoInput } from '../schemas/user_todos.schemas';
import { useThemeTokens } from '../../../../core/theme/useThemeTokens';
import { getMinTouchTarget } from '../../../../core/theme/getMinTouchTarget';
import { triggerLightImpact, triggerErrorHaptic, triggerSuccessHaptic } from '../../../../core/interaction/haptics';

interface UserTodosTodoFormProps {
  initialValues?: Partial<TodoFormInput>;
  submitLabel?: string;
  isSubmitting?: boolean;
  onSubmit: (values: TodoFormInput) => void;
  categories: string[];
}

export function UserTodosTodoForm({
  initialValues,
  submitLabel = 'Save Task',
  isSubmitting = false,
  onSubmit,
  categories,
}: UserTodosTodoFormProps) {
  const tokens = useThemeTokens();
  const minTarget = getMinTouchTarget();

  const [title, setTitle] = useState(initialValues?.title || '');
  const [description, setDescription] = useState(initialValues?.description || '');
  const [category, setCategory] = useState(initialValues?.category || (categories[0] || 'Personal'));
  const [priority, setPriority] = useState<TodoPriority>(initialValues?.priority || 'medium');
  const [dueDate, setDueDate] = useState(initialValues?.dueDate || '');
  const [recurrence, setRecurrence] = useState<TodoRecurrence>(initialValues?.recurrence || 'none');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = () => {
    const payload: TodoFormInput = {
      title,
      description,
      category,
      priority,
      dueDate,
      reminder: Boolean(initialValues?.reminder),
      recurrence,
    };

    const validation = validateTodoInput(payload);
    if (!validation.isValid) {
      triggerErrorHaptic();
      setErrors(validation.errors);
      return;
    }

    setErrors({});
    triggerSuccessHaptic();
    onSubmit(payload);
  };

  const styles = StyleSheet.create({
    container: {
      padding: tokens.space[4],
    },
    fieldGroup: {
      marginBottom: tokens.space[4],
    },
    label: {
      ...tokens.typography.caption,
      color: tokens.color.foreground,
      fontWeight: '600',
      marginBottom: tokens.space[2],
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    input: {
      minHeight: minTarget,
      backgroundColor: tokens.color.cardElevated,
      borderRadius: tokens.radius.md,
      borderWidth: 1,
      borderColor: tokens.color.border,
      paddingHorizontal: tokens.space[3],
      color: tokens.color.foreground,
      ...tokens.typography.body,
    },
    inputError: {
      borderColor: tokens.color.destructive,
    },
    errorText: {
      ...tokens.typography.caption,
      color: tokens.color.statusDangerText,
      marginTop: 4,
    },
    optionsRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: tokens.space[2],
    },
    pill: {
      height: 36,
      paddingHorizontal: tokens.space[3],
      borderRadius: tokens.radius.full,
      borderWidth: 1,
      borderColor: tokens.color.border,
      backgroundColor: tokens.color.card,
      alignItems: 'center',
      justifyContent: 'center',
    },
    pillActive: {
      backgroundColor: tokens.color.primary,
      borderColor: tokens.color.primary,
    },
    pillText: {
      ...tokens.typography.caption,
      color: tokens.color.muted,
      fontWeight: '600',
    },
    pillTextActive: {
      color: tokens.color.onPrimary,
    },
    submitButton: {
      height: 50,
      backgroundColor: tokens.color.primary,
      borderRadius: tokens.radius.md,
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: tokens.space[5],
      minWidth: tokens.layout.buttonMinWidth,
      opacity: isSubmitting ? tokens.opacity.loading : 1,
    },
    submitButtonText: {
      ...tokens.typography.body,
      color: tokens.color.onPrimary,
      fontWeight: '700',
    },
  });

  return (
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <View style={styles.fieldGroup}>
        <Text style={styles.label}>Task Title *</Text>
        <TextInput
          style={[styles.input, errors.title ? styles.inputError : null]}
          value={title}
          onChangeText={(val) => {
            setTitle(val);
            if (errors.title) setErrors((prev) => ({ ...prev, title: '' }));
          }}
          placeholder="e.g., Complete project presentation"
          placeholderTextColor={tokens.color.muted}
          accessibilityLabel="Task title input"
        />
        {Boolean(errors.title) && <Text style={styles.errorText}>{errors.title}</Text>}
      </View>

      <View style={styles.fieldGroup}>
        <Text style={styles.label}>Priority</Text>
        <View style={styles.optionsRow}>
          {(['low', 'medium', 'high'] as TodoPriority[]).map((p) => (
            <Pressable
              key={p}
              style={[styles.pill, priority === p ? styles.pillActive : null]}
              onPress={() => {
                triggerLightImpact();
                setPriority(p);
              }}
              accessibilityRole="button"
              accessibilityLabel={`Select priority ${p}`}
            >
              <Text style={[styles.pillText, priority === p ? styles.pillTextActive : null]}>
                {p.toUpperCase()}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      <View style={styles.fieldGroup}>
        <Text style={styles.label}>Category</Text>
        <View style={styles.optionsRow}>
          {categories.map((c) => (
            <Pressable
              key={c}
              style={[styles.pill, category === c ? styles.pillActive : null]}
              onPress={() => {
                triggerLightImpact();
                setCategory(c);
              }}
              accessibilityRole="button"
              accessibilityLabel={`Select category ${c}`}
            >
              <Text style={[styles.pillText, category === c ? styles.pillTextActive : null]}>
                {c}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      <View style={styles.fieldGroup}>
        <Text style={styles.label}>Description (Optional)</Text>
        <TextInput
          style={[styles.input, { minHeight: 72, textAlignVertical: 'top', paddingTop: 8 }]}
          value={description}
          onChangeText={setDescription}
          multiline={true}
          numberOfLines={3}
          placeholder="Add details, notes, or steps..."
          placeholderTextColor={tokens.color.muted}
          accessibilityLabel="Task description input"
        />
      </View>

      <Pressable
        style={styles.submitButton}
        onPress={handleSubmit}
        disabled={isSubmitting}
        accessibilityRole="button"
        accessibilityLabel={submitLabel}
      >
        <Text style={styles.submitButtonText}>
          {isSubmitting ? 'Saving...' : submitLabel}
        </Text>
      </Pressable>
    </ScrollView>
  );
}
