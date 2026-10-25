/**
 * RESPONSIBILITY: Renders one accessible React Hook Form text input backed by the shared token system.
 * FLOW: Parent form passes control/name and its translated label, placeholder, and schema error.
 */
import React from 'react';
import { Controller, type Control } from 'react-hook-form';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import type { TodoFormInput } from '../schemas/user_todos.schemas';
import { useThemeTokens } from '../../../../../core/theme/useThemeTokens';

type TextFieldName = 'title' | 'description' | 'dueDate' | 'reminderTime';

interface UserTodosFormTextFieldProps {
  control: Control<TodoFormInput>;
  name: TextFieldName;
  label: string;
  placeholder: string;
  errorMessage?: string;
  multiline?: boolean;
  accessibilityHint?: string;
  testID: string;
}

/**
 * Renders the controller and its validation message.
 * @param props - Form state and presentation copy.
 * @returns Tokenized accessible text field with error feedback.
 */
export function UserTodosFormTextField({
  control,
  name,
  label,
  placeholder,
  errorMessage,
  multiline = false,
  accessibilityHint,
  testID,
}: UserTodosFormTextFieldProps) {
  const tokens = useThemeTokens();
  const styles = StyleSheet.create({
    group: { marginBottom: tokens.space[4] },
    label: { ...tokens.typography.caption, color: tokens.color.foreground, fontWeight: '600', marginBottom: tokens.space[2], textTransform: 'uppercase', letterSpacing: 0.5 },
    input: { minHeight: multiline ? tokens.space[8] * 2 : tokens.layout.minTouchTargetAndroid, backgroundColor: tokens.color.cardElevated, borderRadius: tokens.radius.md, borderWidth: 1, borderColor: errorMessage ? tokens.color.destructive : tokens.color.border, paddingHorizontal: tokens.space[3], color: tokens.color.foreground, ...tokens.typography.body, ...(multiline ? { textAlignVertical: 'top' as const, paddingTop: tokens.space[3] } : {}) },
    error: { ...tokens.typography.caption, color: tokens.color.statusDangerText, marginTop: tokens.space[1] },
  });
  return (
    <View style={styles.group}>
      <Text style={styles.label}>{label}</Text>
      <Controller control={control} name={name} render={({ field }) => (
        <TextInput
          style={styles.input}
          value={field.value ?? ''}
          onChangeText={field.onChange}
          onBlur={field.onBlur}
          multiline={multiline}
          numberOfLines={multiline ? 3 : 1}
          placeholder={placeholder}
          placeholderTextColor={tokens.color.muted}
          accessibilityLabel={label}
          accessibilityHint={accessibilityHint}
          testID={testID}
        />
      )} />
      {errorMessage ? <Text accessibilityRole="alert" style={styles.error}>{errorMessage}</Text> : null}
    </View>
  );
}
