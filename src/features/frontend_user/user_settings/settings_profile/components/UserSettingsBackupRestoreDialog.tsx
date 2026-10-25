/**
 * RESPONSIBILITY: Validates pasted task-backup JSON and requires a review before merge or replace.
 * FLOW: Settings → Restore Tasks → parse/preview → explicit confirmation → onImport.
 */
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  AccessibilityInfo, KeyboardAvoidingView, Modal, Platform, Pressable,
  StyleSheet, Text, TextInput, View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useThemeTokens } from '../../../../../core/theme/useThemeTokens';
import { useTranslation } from '../../../../../core/i18n/useTranslation';
import { getMinTouchTarget } from '../../../../../core/theme/getMinTouchTarget';
import type { BackupRestoreMode, BackupTask } from '../types/user_settings.types';

export interface UserSettingsBackupRestoreDialogProps {
  visible: boolean;
  onClose: () => void;
  onImport: (tasks: BackupTask[], mode: BackupRestoreMode) => Promise<boolean>;
}

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, unknown> : null;
}

/**
 * Narrows untrusted JSON into the supported task backup shape.
 * @param source - User-pasted JSON text.
 * @returns Normalized task records or null if none have a non-empty title.
 */
function parseBackup(source: string): BackupTask[] | null {
  let parsed: unknown;
  try { parsed = JSON.parse(source); } catch { return null; }
  const envelope = asRecord(parsed);
  const rawTasks = Array.isArray(parsed) ? parsed : envelope && Array.isArray(envelope.tasks) ? envelope.tasks : null;
  if (!rawTasks) return null;
  const tasks: BackupTask[] = [];
  rawTasks.forEach((raw, index) => {
    const task = asRecord(raw);
    const title = typeof task?.title === 'string' ? task.title.trim() : '';
    if (!task || !title) return;
    const p = task.priority;
    const priority = p === 'low' || p === 'high' || p === 'medium' ? p : 'medium';
    const r = task.recurrence;
    const recurrence = r === 'daily' || r === 'weekly' || r === 'monthly' ? r : 'none';
    tasks.push({
      id: task.id == null || String(task.id).trim() === '' ? `import-${Date.now().toString(36)}-${index}-${Math.random().toString(36).slice(2, 8)}` : String(task.id),
      title,
      description: typeof task.description === 'string' ? task.description : '',
      completed: task.completed === true,
      category: typeof task.category === 'string' && task.category.trim() ? task.category.trim() : 'Personal',
      priority,
      dueDate: typeof task.dueDate === 'string' ? task.dueDate : '',
      reminder: task.reminder === true,
      reminderTime: typeof task.reminderTime === 'string' ? task.reminderTime : null,
      favorite: task.favorite === true,
      deleted: task.deleted === true,
      pinned: task.pinned === true,
      recurrence,
      createdAt: typeof task.createdAt === 'number' && Number.isFinite(task.createdAt) ? task.createdAt : Date.now(),
      completedAt: typeof task.completedAt === 'number' && Number.isFinite(task.completedAt) ? task.completedAt : null,
      deletedAt: typeof task.deletedAt === 'number' && Number.isFinite(task.deletedAt) ? task.deletedAt : null,
      timerEndAt: null,
      timerNotificationId: null,
      timerRemaining: 0,
      timerDuration: 0,
    });
  });
  return tasks.length ? tasks : null;
}

/**
 * Provides a user-reviewed JSON restore flow with explicit merge/replace semantics.
 * @param props - Visibility, close callback and import mutation.
 * @returns The paste/preview or confirmation state inside one modal (no nested dialogs).
 * @sideEffects Observes reduced-motion preferences and invokes onImport after explicit confirmation.
 */
export function UserSettingsBackupRestoreDialog({ visible, onClose, onImport }: UserSettingsBackupRestoreDialogProps) {
  const tokens = useThemeTokens();
  const { t } = useTranslation();
  const minTarget = getMinTouchTarget();
  const [jsonText, setJsonText] = useState('');
  const [mode, setMode] = useState<BackupRestoreMode>('merge');
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);
  const importHandledRef = useRef(false);

  useEffect(() => {
    if (!visible) importHandledRef.current = false;
  }, [visible]);
  const tasks = useMemo(() => parseBackup(jsonText), [jsonText]);

  useEffect(() => {
    let active = true;
    AccessibilityInfo.isReduceMotionEnabled().then((enabled) => { if (active) setReduceMotion(enabled); }).catch(() => undefined);
    const subscription = AccessibilityInfo.addEventListener('reduceMotionChanged', setReduceMotion);
    // OS preference changes update animation; listener is removed when unmounted.
    return () => { active = false; subscription.remove(); };
  }, []);

  const styles = StyleSheet.create({
    backdrop: { flex: 1, justifyContent: 'center', padding: tokens.space[4], backgroundColor: tokens.color.overlayBackdrop },
    surface: { backgroundColor: tokens.color.card, borderColor: tokens.color.border, borderWidth: 1, borderRadius: tokens.radius.xl, padding: tokens.space[4], maxHeight: '90%' },
    title: { ...tokens.typography.headingSm, color: tokens.color.foreground, marginBottom: tokens.space[2] },
    body: { ...tokens.typography.bodySm, color: tokens.color.muted, marginBottom: tokens.space[3] },
    input: { minHeight: tokens.space[9], borderWidth: 1, borderColor: error ? tokens.color.destructive : tokens.color.border, borderRadius: tokens.radius.md, padding: tokens.space[3], color: tokens.color.foreground, backgroundColor: tokens.color.cardElevated, textAlignVertical: 'top', ...tokens.typography.bodySm, marginBottom: tokens.space[2] },
    error: { ...tokens.typography.caption, color: tokens.color.statusDangerText, marginBottom: tokens.space[2] },
    row: { flexDirection: 'row', gap: tokens.space[2], marginTop: tokens.space[2], marginBottom: tokens.space[3] },
    choice: { flex: 1, minHeight: minTarget, borderWidth: 1, borderColor: tokens.color.border, borderRadius: tokens.radius.md, alignItems: 'center', justifyContent: 'center', paddingHorizontal: tokens.space[2] },
    choiceActive: { backgroundColor: tokens.color.primarySubtle, borderColor: tokens.color.primary },
    choiceText: { ...tokens.typography.bodySm, color: tokens.color.foreground },
    actions: { flexDirection: 'row', gap: tokens.space[2], justifyContent: 'flex-end', flexWrap: 'wrap', marginTop: tokens.space[2] },
    button: { minHeight: minTarget, minWidth: tokens.layout.buttonMinWidth, alignItems: 'center', justifyContent: 'center', paddingHorizontal: tokens.space[3], borderWidth: 1, borderColor: tokens.color.border, borderRadius: tokens.radius.md },
    primary: { backgroundColor: tokens.color.primary, borderColor: tokens.color.primary },
    danger: { backgroundColor: tokens.color.destructive, borderColor: tokens.color.destructive },
    buttonText: { ...tokens.typography.bodySm, color: tokens.color.foreground, fontWeight: '700' },
    onPrimaryText: { ...tokens.typography.bodySm, color: tokens.color.onPrimary, fontWeight: '700' },
    onDangerText: { ...tokens.typography.bodySm, color: tokens.color.onDestructive, fontWeight: '700' },
  });

  const closeAndReset = () => {
    if (saving) return;
    setJsonText(''); setMode('merge'); setConfirming(false); setError(''); onClose();
  };
  const handleContinue = () => {
    if (!tasks) { setError(t('user_settings_profile.INVALID_BACKUP_JSON')); return; }
    setError(''); setConfirming(true);
  };
  const handleImport = async () => {
    if (saving || importHandledRef.current) return;
    if (!tasks) { setError(t('user_settings_profile.INVALID_BACKUP_RESTORE')); setConfirming(false); return; }
    importHandledRef.current = true;
    setSaving(true); setError('');
    try {
      if (await onImport(tasks, mode)) {
        setJsonText(''); setConfirming(false); onClose();
      } else {
        importHandledRef.current = false;
        setError(t('user_settings_profile.RESTORE_FAILED_UNCONFIRMED'));
      }
    } catch {
      importHandledRef.current = false;
      setError(t('user_settings_profile.RESTORE_FAILED'));
    } finally { setSaving(false); }
  };

  return (
    <Modal visible={visible} transparent animationType={reduceMotion ? 'none' : 'slide'} onRequestClose={closeAndReset} statusBarTranslucent>
      <SafeAreaView style={styles.backdrop}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
          <View style={styles.surface} accessible accessibilityViewIsModal accessibilityLabel={confirming ? t('user_settings_profile.RESTORE_CONFIRM_ACCESSIBILITY') : t('user_settings_profile.RESTORE_MODAL_TITLE')} testID="user_settings-backup-restore-dialog">
            {confirming ? (
              <>
                <Text accessibilityRole="header" style={styles.title}>{mode === 'replace' ? t('user_settings_profile.REPLACE_CONFIRM_TITLE') : t('user_settings_profile.MERGE_CONFIRM_TITLE')}</Text>
                <Text style={styles.body}>{mode === 'replace'
                  ? `This replaces the entire current task list with ${tasks?.length ?? 0} backup tasks. Existing tasks will be removed; this cannot be undone.`
                  : t('user_settings_profile.MERGE_CONFIRM_DESCRIPTION').replace('{count}', String(tasks?.length ?? 0))}</Text>
                <View style={styles.actions}>
                  <Pressable style={styles.button} onPress={() => setConfirming(false)} disabled={saving} accessibilityRole="button" accessibilityLabel={t('user_settings_profile.BACK_TO_PREVIEW')} testID="user_settings-restore-review-cancel"><Text style={styles.buttonText}>{t('user_settings_profile.BACK')}</Text></Pressable>
                  <Pressable style={[styles.button, mode === 'replace' ? styles.danger : styles.primary]} onPress={handleImport} disabled={saving} accessibilityRole="button" accessibilityState={{ disabled: saving, busy: saving }} accessibilityLabel={mode === 'replace' ? t('user_settings_profile.CONFIRM_REPLACE') : t('user_settings_profile.CONFIRM_MERGE')} testID="user_settings-restore-confirm"><Text style={mode === 'replace' ? styles.onDangerText : styles.onPrimaryText}>{saving ? t('user_settings_profile.RESTORING') : mode === 'replace' ? t('user_settings_profile.REPLACE_ALL') : t('user_settings_profile.MERGE_TASKS')}</Text></Pressable>
                </View>
              </>
            ) : (
              <>
                <Text accessibilityRole="header" style={styles.title}>{t('user_settings_profile.RESTORE_MODAL_TITLE')}</Text>
                <Text style={styles.body}>{t('user_settings_profile.RESTORE_DESCRIPTION')}</Text>
                <View style={styles.row}>
                  <Pressable style={[styles.choice, mode === 'merge' ? styles.choiceActive : null]} onPress={() => setMode('merge')} accessibilityRole="button" accessibilityState={{ selected: mode === 'merge' }} testID="user_settings-restore-mode-merge"><Text style={styles.choiceText}>{t('user_settings_profile.MERGE')}</Text></Pressable>
                  <Pressable style={[styles.choice, mode === 'replace' ? styles.choiceActive : null]} onPress={() => setMode('replace')} accessibilityRole="button" accessibilityState={{ selected: mode === 'replace' }} testID="user_settings-restore-mode-replace"><Text style={styles.choiceText}>{t('user_settings_profile.REPLACE_ALL')}</Text></Pressable>
                </View>
                <TextInput style={styles.input} value={jsonText} onChangeText={(value) => { setJsonText(value); setError(''); }} placeholder={t('user_settings_profile.BACKUP_JSON_PLACEHOLDER')} placeholderTextColor={tokens.color.muted} multiline autoCapitalize="none" autoCorrect={false} accessibilityLabel={t('user_settings_profile.BACKUP_JSON_ACCESSIBILITY')} testID="user_settings-restore-json-input" />
                {tasks ? <Text style={styles.body}>{tasks.length} {t('user_settings_profile.VALID_TASKS_READY')}</Text> : null}
                {error ? <Text style={styles.error} accessibilityLiveRegion="polite">{error}</Text> : null}
                <View style={styles.actions}>
                  <Pressable style={styles.button} onPress={closeAndReset} accessibilityRole="button" accessibilityLabel={t('user_settings_profile.CANCEL_RESTORE')} testID="user_settings-restore-cancel"><Text style={styles.buttonText}>{t('user_settings_profile.CANCEL')}</Text></Pressable>
                  <Pressable style={[styles.button, styles.primary]} onPress={handleContinue} accessibilityRole="button" accessibilityLabel={t('user_settings_profile.REVIEW_RESTORE')} testID="user_settings-restore-review"><Text style={styles.onPrimaryText}>{t('user_settings_profile.REVIEW_RESTORE')}</Text></Pressable>
                </View>
              </>
            )}
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );
}
