/**
 * RESPONSIBILITY: Validates editable profile fields with React Hook Form + the canonical Zod schema.
 * FLOW: UserProfileMainView → UserProfileEditForm → schema validation → profile-save callback.
 */
import React, { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { UserProfileEditSchema, type UserProfileEditValues } from '../schemas/user_settings.schema';
import { useThemeTokens } from '../../../../../core/theme/useThemeTokens';
import { useTranslation } from '../../../../../core/i18n/useTranslation';
import { getMinTouchTarget } from '../../../../../core/theme/getMinTouchTarget';
import { triggerErrorHaptic, triggerSuccessNotification } from '../../../../../core/interaction/haptics';

interface UserProfileEditFormProps {
  initialName: string;
  initialEmail: string;
  initialPhone: string;
  onNameChange?: (name: string) => void;
  onSaveProfile: (profile: UserProfileEditValues) => Promise<boolean>;
}

/**
 * Validates and persists profile changes without showing success when save fails.
 * @param props - Current user fields and profile-save callbacks.
 * @returns RHF-controlled profile form with localized field and server error messages.
 * @sideEffects Calls the profile-save handler; success feedback runs only after a true result.
 */
export function UserProfileEditForm({
  initialName,
  initialEmail,
  initialPhone,
  onNameChange,
  onSaveProfile,
}: UserProfileEditFormProps) {
  const tokens = useThemeTokens();
  const { t } = useTranslation();
  const minTarget = getMinTouchTarget();
  const {
    control, handleSubmit, reset, setError, clearErrors,
    formState: { errors, isSubmitting },
  } = useForm<UserProfileEditValues>({
    mode: 'onSubmit',
    defaultValues: { name: initialName, email: initialEmail, phone: initialPhone },
  });

  useEffect(() => {
    reset({ name: initialName, email: initialEmail, phone: initialPhone });
    onNameChange?.(initialName);
  }, [initialName, initialEmail, initialPhone, onNameChange, reset]);

  const saveProfile = handleSubmit(async (values) => {
    const parsed = UserProfileEditSchema.safeParse(values);
    if (!parsed.success) {
      triggerErrorHaptic();
      for (const issue of parsed.error.issues) {
        const field = issue.path[0];
        if (field === 'name' || field === 'email' || field === 'phone') {
          setError(field, { type: 'zod', message: issue.message });
        }
      }
      return;
    }
    clearErrors();
    try {
      const saved = await onSaveProfile(parsed.data);
      if (saved) triggerSuccessNotification();
      else setError('root', { type: 'server', message: 'user_settings_profile.PROFILE_SAVE_FAILED' });
    } catch {
      setError('root', { type: 'server', message: 'user_settings_profile.PROFILE_SAVE_FAILED' });
    }
  }, triggerErrorHaptic);

  const styles = StyleSheet.create({
    card: { backgroundColor: tokens.color.card, borderRadius: tokens.radius.lg, borderWidth: 1, borderColor: tokens.color.border, padding: tokens.space[4], marginBottom: tokens.space[5] },
    group: { marginBottom: tokens.space[4] },
    label: { ...tokens.typography.caption, color: tokens.color.muted, marginBottom: tokens.space[1] },
    input: { minHeight: minTarget, borderWidth: 1, borderColor: tokens.color.border, borderRadius: tokens.radius.md, paddingHorizontal: tokens.space[3], color: tokens.color.foreground, backgroundColor: tokens.color.cardElevated, ...tokens.typography.body },
    inputError: { borderColor: tokens.color.destructive },
    error: { ...tokens.typography.caption, color: tokens.color.statusDangerText, marginTop: tokens.space[1] },
    saveButton: { minHeight: minTarget, backgroundColor: tokens.color.primary, borderRadius: tokens.radius.md, alignItems: 'center', justifyContent: 'center', opacity: isSubmitting ? tokens.opacity.loading : 1, marginTop: tokens.space[2] },
    saveButtonText: { ...tokens.typography.labelUppercase, color: tokens.color.onPrimary, fontWeight: '700' },
  });

  const errorText = (message?: string) => message ? <Text accessibilityRole="alert" style={styles.error}>{t(message)}</Text> : null;

  return (
    <View style={styles.card}>
      <View style={styles.group}>
        <Text style={styles.label}>{t('user_settings_profile.FULL_NAME_LABEL')}</Text>
        <Controller control={control} name="name" render={({ field }) => (
          <TextInput
            style={[styles.input, errors.name ? styles.inputError : null]}
            value={field.value}
            onChangeText={(value) => { field.onChange(value); onNameChange?.(value); clearErrors('name'); }}
            onBlur={field.onBlur}
            placeholder={t('user_settings_profile.NAME_PLACEHOLDER')}
            placeholderTextColor={tokens.color.muted}
            accessibilityLabel={t('user_settings_profile.FULL_NAME_LABEL')}
            testID="user_settings-profile-name"
          />
        )} />
        {errorText(errors.name?.message)}
      </View>
      <View style={styles.group}>
        <Text style={styles.label}>{t('user_settings_profile.EMAIL_LABEL')}</Text>
        <Controller control={control} name="email" render={({ field }) => (
          <TextInput
            style={[styles.input, errors.email ? styles.inputError : null]}
            value={field.value}
            onChangeText={(value) => { field.onChange(value); clearErrors('email'); }}
            onBlur={field.onBlur}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            placeholder={t('user_settings_profile.EMAIL_PLACEHOLDER')}
            placeholderTextColor={tokens.color.muted}
            accessibilityLabel={t('user_settings_profile.EMAIL_LABEL')}
            testID="user_settings-profile-email"
          />
        )} />
        {errorText(errors.email?.message)}
      </View>
      <View style={styles.group}>
        <Text style={styles.label}>{t('user_settings_profile.PHONE_LABEL')}</Text>
        <Controller control={control} name="phone" render={({ field }) => (
          <TextInput
            style={[styles.input, errors.phone ? styles.inputError : null]}
            value={field.value}
            onChangeText={(value) => { field.onChange(value); clearErrors('phone'); }}
            onBlur={field.onBlur}
            keyboardType="phone-pad"
            placeholder={t('user_settings_profile.PHONE_PLACEHOLDER')}
            placeholderTextColor={tokens.color.muted}
            accessibilityLabel={t('user_settings_profile.PHONE_LABEL')}
            testID="user_settings-profile-phone"
          />
        )} />
        {errorText(errors.phone?.message)}
      </View>
      {errorText(errors.root?.message)}
      <Pressable
        style={styles.saveButton}
        onPress={() => { void saveProfile(); }}
        disabled={isSubmitting}
        accessibilityRole="button"
        accessibilityLabel={t('user_settings_profile.PROFILE_SAVE')}
        testID="user_settings-profile-save"
      >
        <Text style={styles.saveButtonText}>{t('user_settings_profile.PROFILE_SAVE')}</Text>
      </Pressable>
    </View>
  );
}
