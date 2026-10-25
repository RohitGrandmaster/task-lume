/**
 * RESPONSIBILITY: Owns validated Todo create/edit inputs through React Hook Form and the canonical Zod schema.
 * FLOW: UserTodosTodoForm → RHF field state → TodoFormSchema → owning create/edit callback.
 */
import React from 'react';
import { Controller, useForm } from 'react-hook-form';
import { View, Text, TextInput, StyleSheet, Pressable, ScrollView } from 'react-native';
import type { TodoPriority, TodoRecurrence } from '../types/user_todos.types';
import { TodoFormSchema, type TodoFormInput } from '../schemas/user_todos.schemas';
import { UserTodosPillSelector } from './UserTodosPillSelector';
import { useThemeTokens } from '../../../../../core/theme/useThemeTokens';
import { useTranslation } from '../../../../../core/i18n/useTranslation';
import { getMinTouchTarget } from '../../../../../core/theme/getMinTouchTarget';
import { triggerErrorHaptic, triggerSuccessHaptic } from '../../../../../core/interaction/haptics';

interface UserTodosTodoFormProps {
  initialValues?: Partial<TodoFormInput>;
  submitLabel?: string;
  isSubmitting?: boolean;
  onSubmit: (values: TodoFormInput) => void | Promise<void>;
  categories: string[];
}

/**
 * Validates all fields before forwarding a normalized task payload.
 * @param props - Initial values, available categories and owning save handler.
 * @returns Accessible React Hook Form with field-specific Zod feedback.
 * @sideEffects Calls the owner's save operation; emits success haptics only after it resolves.
 */
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
  const {
    control, handleSubmit, watch, setValue, setError, clearErrors,
    formState: { errors, isSubmitting: formSubmitting },
  } = useForm<TodoFormInput>({
    mode: 'onSubmit',
    defaultValues: {
      title: initialValues?.title ?? '',
      description: initialValues?.description ?? '',
      category: initialValues?.category ?? (categories[0] || 'Personal'),
      priority: initialValues?.priority ?? 'medium',
      dueDate: initialValues?.dueDate ?? '',
      reminder: Boolean(initialValues?.reminder),
      reminderTime: initialValues?.reminderTime ?? '',
      recurrence: initialValues?.recurrence ?? 'none',
    },
  });
  const priority = watch('priority');
  const category = watch('category');
  const reminder = watch('reminder');
  const recurrence = watch('recurrence');

  const submitForm = handleSubmit(async (values) => {
    const parsed = TodoFormSchema.safeParse(values);
    if (!parsed.success) {
      triggerErrorHaptic();
      for (const issue of parsed.error.issues) {
        const field = issue.path[0];
        if (field === 'title' || field === 'description' || field === 'category' ||
            field === 'priority' || field === 'dueDate' || field === 'reminder' ||
            field === 'reminderTime' || field === 'recurrence') {
          setError(field, { type: 'zod', message: issue.message });
        }
      }
      return;
    }
    clearErrors();
    try {
      await onSubmit(parsed.data);
      triggerSuccessHaptic();
    } catch {
      setError('root', { type: 'server', message: 'user_todos_management.SUBMIT_FAILED' });
    }
  }, () => {
    triggerErrorHaptic();
  });

  const styles = StyleSheet.create({
    container: { padding: tokens.space[4], paddingBottom: tokens.space[9] },
    fieldGroup: { marginBottom: tokens.space[4] },
    label: { ...tokens.typography.caption, color: tokens.color.foreground, fontWeight: '600', marginBottom: tokens.space[2], textTransform: 'uppercase', letterSpacing: 0.5 },
    input: { minHeight: minTarget, backgroundColor: tokens.color.cardElevated, borderRadius: tokens.radius.md, borderWidth: 1, borderColor: tokens.color.border, paddingHorizontal: tokens.space[3], color: tokens.color.foreground, ...tokens.typography.body },
    inputError: { borderColor: tokens.color.destructive },
    errorText: { ...tokens.typography.caption, color: tokens.color.statusDangerText, marginTop: tokens.space[1] },
    submitButton: { minHeight: minTarget, backgroundColor: tokens.color.primary, borderRadius: tokens.radius.md, alignItems: 'center', justifyContent: 'center', marginTop: tokens.space[5], minWidth: tokens.layout.buttonMinWidth, opacity: (isSubmitting || formSubmitting) ? tokens.opacity.loading : 1 },
    submitButtonText: { ...tokens.typography.body, color: tokens.color.onPrimary, fontWeight: '700' },
    reminderToggle: { minHeight: minTarget, justifyContent: 'center', paddingHorizontal: tokens.space[3], borderRadius: tokens.radius.md, borderWidth: 1, borderColor: reminder ? tokens.color.primary : tokens.color.border, backgroundColor: reminder ? tokens.color.primarySubtle : tokens.color.card },
    reminderToggleText: { ...tokens.typography.bodySm, color: reminder ? tokens.color.primaryText : tokens.color.foreground, fontWeight: '600' },
  });

  const errorLabel = (message?: string) => message ? (
    <Text accessibilityRole="alert" style={styles.errorText}>{t(message)}</Text>
  ) : null;

  return (
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <View style={styles.fieldGroup}>
        <Text style={styles.label}>{t('user_todos_management.TASK_TITLE_LABEL')}</Text>
        <Controller control={control} name="title" render={({ field }) => (
          <TextInput
            style={[styles.input, errors.title ? styles.inputError : null]}
            value={field.value}
            onChangeText={(value) => { field.onChange(value); clearErrors('title'); }}
            onBlur={field.onBlur}
            placeholder={t('user_todos_management.TASK_TITLE_PLACEHOLDER')}
            placeholderTextColor={tokens.color.muted}
            accessibilityLabel={t('user_todos_management.TASK_TITLE_LABEL')}
            accessibilityHint={t('user_todos_management.TASK_TITLE_PLACEHOLDER')}
            testID="user_todos-form-title"
          />
        )} />
        {errorLabel(errors.title?.message)}
      </View>

      <UserTodosPillSelector<TodoPriority>
        label={t('user_todos_management.PRIORITY_LABEL')}
        options={['low', 'medium', 'high']}
        selected={priority}
        onSelect={(value) => { setValue('priority', value, { shouldDirty: true }); clearErrors('priority'); }}
        formatOption={(value) => t(`user_todos_management.PRIORITY_${value.toUpperCase()}`)}
      />
      {errorLabel(errors.priority?.message)}

      <UserTodosPillSelector<string>
        label={t('user_todos_management.CATEGORY_LABEL')}
        options={categories}
        selected={category}
        onSelect={(value) => { setValue('category', value, { shouldDirty: true }); clearErrors('category'); }}
      />
      {errorLabel(errors.category?.message)}

      <View style={styles.fieldGroup}>
        <Text style={styles.label}>{t('user_todos_management.DESCRIPTION_OPTIONAL')}</Text>
        <Controller control={control} name="description" render={({ field }) => (
          <TextInput
            style={[styles.input, { minHeight: tokens.space[8] * 2, textAlignVertical: 'top', paddingTop: tokens.space[3] }, errors.description ? styles.inputError : null]}
            value={field.value ?? ''}
            onChangeText={(value) => { field.onChange(value); clearErrors('description'); }}
            onBlur={field.onBlur}
            multiline
            numberOfLines={3}
            placeholder={t('user_todos_management.DESCRIPTION_PLACEHOLDER')}
            placeholderTextColor={tokens.color.muted}
            accessibilityLabel={t('user_todos_management.DESCRIPTION_OPTIONAL')}
            testID="user_todos-form-description"
          />
        )} />
        {errorLabel(errors.description?.message)}
      </View>

      <View style={styles.fieldGroup}>
        <Text style={styles.label}>{t('user_todos_management.DUE_DATE_LABEL')}</Text>
        <Controller control={control} name="dueDate" render={({ field }) => (
          <TextInput
            style={[styles.input, errors.dueDate ? styles.inputError : null]}
            value={field.value}
            onChangeText={(value) => { field.onChange(value); clearErrors('dueDate'); }}
            onBlur={field.onBlur}
            placeholder={t('user_todos_management.DUE_DATE_PLACEHOLDER')}
            placeholderTextColor={tokens.color.muted}
            accessibilityLabel={t('user_todos_management.DUE_DATE_LABEL')}
            testID="user_todos-form-due-date"
          />
        )} />
        {errorLabel(errors.dueDate?.message)}
      </View>

      <UserTodosPillSelector<TodoRecurrence>
        label={t('user_todos_management.RECURRENCE_LABEL')}
        options={['none', 'daily', 'weekly', 'monthly']}
        selected={recurrence}
        onSelect={(value) => { setValue('recurrence', value, { shouldDirty: true }); clearErrors('recurrence'); }}
        formatOption={(value) => t(`user_todos_management.RECURRENCE_${value.toUpperCase()}`)}
      />

      <View style={styles.fieldGroup}>
        <Pressable
          style={styles.reminderToggle}
          onPress={() => setValue('reminder', !reminder, { shouldDirty: true })}
          accessibilityRole="switch"
          accessibilityState={{ checked: reminder }}
          accessibilityLabel={t(reminder ? 'user_todos_management.REMINDER_TOGGLE_ON' : 'user_todos_management.REMINDER_TOGGLE_OFF')}
          testID="user_todos-form-reminder-toggle"
        >
          <Text style={styles.reminderToggleText}>{t(reminder ? 'user_todos_management.REMINDER_TOGGLE_ON' : 'user_todos_management.REMINDER_TOGGLE_OFF')}</Text>
        </Pressable>
        {reminder && (
          <View style={{ marginTop: tokens.space[3] }}>
            <Text style={styles.label}>{t('user_todos_management.REMINDER_TIME_LABEL')}</Text>
            <Controller control={control} name="reminderTime" render={({ field }) => (
              <TextInput
                style={[styles.input, errors.reminderTime ? styles.inputError : null]}
                value={field.value ?? ''}
                onChangeText={(value) => { field.onChange(value); clearErrors('reminderTime'); }}
                onBlur={field.onBlur}
                placeholder={t('user_todos_management.REMINDER_TIME_PLACEHOLDER')}
                placeholderTextColor={tokens.color.muted}
                accessibilityLabel={t('user_todos_management.REMINDER_TIME_LABEL')}
                testID="user_todos-form-reminder-time"
              />
            )} />
            {errorLabel(errors.reminderTime?.message)}
          </View>
        )}
      </View>

      {errorLabel(errors.root?.message)}
      <Pressable
        style={styles.submitButton}
        onPress={() => { void submitForm(); }}
        disabled={isSubmitting || formSubmitting}
        accessibilityRole="button"
        accessibilityLabel={submitLabel || t('user_todos_management.SAVE_TASK')}
        testID="user_todos-form-submit"
      >
        <Text style={styles.submitButtonText}>
          {(isSubmitting || formSubmitting) ? t('user_todos_management.SAVING') : submitLabel || t('user_todos_management.SAVE_TASK')}
        </Text>
      </Pressable>
    </ScrollView>
  );
}
