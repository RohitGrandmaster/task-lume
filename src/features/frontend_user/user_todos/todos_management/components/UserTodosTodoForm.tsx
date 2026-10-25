/**
 * RESPONSIBILITY: Controlled form component for creating and editing Todo tasks with validation feedback.
 * FLOW: Rendered in UserTodosAddMainView and UserTodosEditMainView; validates fields and returns payload to handler.
 */

import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Pressable, ScrollView } from 'react-native';
import type { TodoPriority, TodoRecurrence } from '../types/user_todos.types';
import type { TodoFormInput } from '../schemas/user_todos.schemas';
import { validateTodoInput } from '../schemas/user_todos.schemas';
import { UserTodosPillSelector } from './UserTodosPillSelector';
import { useThemeTokens } from '../../../../../core/theme/useThemeTokens';
import { useTranslation } from '../../../../../core/i18n/useTranslation';
import { getMinTouchTarget } from '../../../../../core/theme/getMinTouchTarget';
import { triggerErrorHaptic, triggerSuccessHaptic } from '../../../../../core/interaction/haptics';

interface UserTodosTodoFormProps {
  initialValues?: Partial<TodoFormInput>;
  submitLabel?: string;
  isSubmitting?: boolean;
  onSubmit: (values: TodoFormInput) => void;
  categories: string[];
}

export function UserTodosTodoForm({
  initialValues,
  submitLabel = '',
  isSubmitting = false,
  onSubmit,
  categories,
}: UserTodosTodoFormProps) {
  const tokens = useThemeTokens();
  const { t } = useTranslation();
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
        <Text style={styles.label}>{t('user_todos_management.TASK_TITLE_LABEL')}</Text>
        <TextInput
          style={[styles.input, errors.title ? styles.inputError : null]}
          value={title}
          onChangeText={(val) => {
            setTitle(val);
            if (errors.title) setErrors((prev) => ({ ...prev, title: '' }));
          }}
          placeholder={t('user_todos_management.TASK_TITLE_PLACEHOLDER')}
          placeholderTextColor={tokens.color.muted}
          accessibilityLabel="Task title input"
        />
        {Boolean(errors.title) && <Text style={styles.errorText}>{errors.title}</Text>}
      </View>

      <UserTodosPillSelector<TodoPriority>
        label={t('user_todos_management.PRIORITY_LABEL')}
        options={['low', 'medium', 'high']}
        selected={priority}
        onSelect={setPriority}
        formatOption={(p) => p.toUpperCase()}
      />

      <UserTodosPillSelector<string>
        label={t('user_todos_management.CATEGORY_LABEL')}
        options={categories}
        selected={category}
        onSelect={setCategory}
      />

      <View style={styles.fieldGroup}>
        <Text style={styles.label}>{t('user_todos_management.DESCRIPTION_OPTIONAL')}</Text>
        <TextInput
          style={[styles.input, { minHeight: 72, textAlignVertical: 'top', paddingTop: 8 }]}
          value={description}
          onChangeText={setDescription}
          multiline={true}
          numberOfLines={3}
          placeholder={t('user_todos_management.DESCRIPTION_PLACEHOLDER')}
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
          {isSubmitting ? t('user_todos_management.SAVING') : submitLabel || t('user_todos_management.SAVE_TASK')}
        </Text>
      </Pressable>
    </ScrollView>
  );
}
