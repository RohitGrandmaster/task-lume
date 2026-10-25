/**
 * RESPONSIBILITY: React Hook Form + Zod Todo create/edit form with field-level feedback and keyboard-safe layout.
 * FLOW: Add/Edit MainView → this form → zodResolver(TodoFormSchema) → typed TodoFormInput callback.
 */

import React from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, View, Text, TextInput, StyleSheet, Pressable } from 'react-native';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { TodoPriority, TodoRecurrence } from '../types/user_todos.types';
import { TodoFormSchema, type TodoFormInput } from '../schemas/user_todos.schemas';
import { UserTodosPillSelector } from './UserTodosPillSelector';
import { useThemeTokens } from '../../../../../core/theme/useThemeTokens';
import { getMinTouchTarget } from '../../../../../core/theme/getMinTouchTarget';
import { triggerErrorHaptic } from '../../../../../core/interaction/haptics';

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
  const { control, handleSubmit, formState: { errors, isDirty } } = useForm<TodoFormInput>({
    resolver: zodResolver(TodoFormSchema),
    mode: 'onSubmit',
    reValidateMode: 'onChange',
    defaultValues: {
      title: initialValues?.title ?? '',
      description: initialValues?.description ?? '',
      category: initialValues?.category ?? categories[0] ?? 'Personal',
      priority: initialValues?.priority ?? 'medium',
      dueDate: initialValues?.dueDate ?? '',
      reminder: Boolean(initialValues?.reminder),
      reminderTime: initialValues?.reminderTime ?? null,
      recurrence: initialValues?.recurrence ?? 'none',
    },
  });

  const styles = StyleSheet.create({
    container: { padding: tokens.space[4] },
    fieldGroup: { marginBottom: tokens.space[4] },
    label: { ...tokens.typography.caption, color: tokens.color.foreground, fontWeight: '600', marginBottom: tokens.space[2], textTransform: 'uppercase', letterSpacing: 0.5 },
    input: { minHeight: minTarget, backgroundColor: tokens.color.cardElevated, borderRadius: tokens.radius.md, borderWidth: 1, borderColor: tokens.color.border, paddingHorizontal: tokens.space[3], color: tokens.color.foreground, ...tokens.typography.body },
    inputError: { borderColor: tokens.color.destructive },
    errorText: { ...tokens.typography.caption, color: tokens.color.statusDangerText, marginTop: tokens.space[1] },
    submitButton: { minHeight: minTarget, backgroundColor: tokens.color.primary, borderRadius: tokens.radius.md, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: tokens.space[2], marginTop: tokens.space[5], minWidth: tokens.layout.buttonMinWidth, paddingHorizontal: tokens.space[4], opacity: isSubmitting ? tokens.opacity.loading : 1 },
    submitButtonText: { ...tokens.typography.body, color: tokens.color.onPrimary, fontWeight: '700' },
  });

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Task Title *</Text>
          <Controller
            control={control}
            name="title"
            render={({ field: { value, onChange, onBlur } }) => (
              <TextInput
                style={[styles.input, errors.title ? styles.inputError : null]}
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                placeholder="e.g., Complete project presentation"
                placeholderTextColor={tokens.color.muted}
                accessibilityLabel="Task title input"
                accessibilityState={{ invalid: Boolean(errors.title) }}
                testID="user-todos-form-title"
                maxLength={150}
                returnKeyType="next"
              />
            )}
          />
          {errors.title?.message ? <Text style={styles.errorText} accessibilityLiveRegion="polite">{errors.title.message}</Text> : null}
        </View>

        <Controller
          control={control}
          name="priority"
          render={({ field: { value, onChange } }) => (
            <UserTodosPillSelector<TodoPriority>
              label="Priority"
              options={['low', 'medium', 'high']}
              selected={value}
              onSelect={onChange}
              formatOption={(priority) => priority.toUpperCase()}
            />
          )}
        />
        {errors.priority?.message ? <Text style={styles.errorText}>{errors.priority.message}</Text> : null}

        <Controller
          control={control}
          name="category"
          render={({ field: { value, onChange } }) => (
            <UserTodosPillSelector<string>
              label="Category"
              options={categories.length ? categories : ['Personal']}
              selected={value}
              onSelect={onChange}
            />
          )}
        />
        {errors.category?.message ? <Text style={styles.errorText}>{errors.category.message}</Text> : null}

        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Due Date (Optional)</Text>
          <Controller
            control={control}
            name="dueDate"
            render={({ field: { value, onChange, onBlur } }) => (
              <TextInput
                style={styles.input}
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                placeholder="YYYY-MM-DD"
                placeholderTextColor={tokens.color.muted}
                accessibilityLabel="Task due date in YYYY-MM-DD format"
                testID="user-todos-form-due-date"
                autoCapitalize="none"
              />
            )}
          />
        </View>

        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Description (Optional)</Text>
          <Controller
            control={control}
            name="description"
            render={({ field: { value, onChange, onBlur } }) => (
              <TextInput
                style={[styles.input, { minHeight: 96, textAlignVertical: 'top', paddingTop: tokens.space[2] }, errors.description ? styles.inputError : null]}
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                multiline
                numberOfLines={4}
                maxLength={500}
                placeholder="Add details, notes, or steps..."
                placeholderTextColor={tokens.color.muted}
                accessibilityLabel="Task description input"
                testID="user-todos-form-description"
              />
            )}
          />
          {errors.description?.message ? <Text style={styles.errorText} accessibilityLiveRegion="polite">{errors.description.message}</Text> : null}
        </View>

        <Pressable
          style={styles.submitButton}
          onPress={handleSubmit(onSubmit, () => triggerErrorHaptic())}
          disabled={isSubmitting}
          accessibilityRole="button"
          accessibilityLabel={submitLabel}
          accessibilityState={{ disabled: isSubmitting, busy: isSubmitting }}
          testID="user-todos-form-submit"
        >
          {isSubmitting ? <ActivityIndicator size={tokens.icon.sm} color={tokens.color.onPrimary} /> : null}
          <Text style={styles.submitButtonText}>{isSubmitting ? 'Saving…' : submitLabel}</Text>
        </Pressable>
        {isDirty ? null : null}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
