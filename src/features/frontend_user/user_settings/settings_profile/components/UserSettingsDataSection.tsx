/**
 * RESPONSIBILITY: Backup/restore, completed-task cleanup and Trash maintenance controls.
 * FLOW: Settings MainView → this section → explicit restore review or destructive confirmation → hook callback.
 */
import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Download, Upload, Trash2, RotateCcw } from 'lucide-react-native';
import { useThemeTokens } from '../../../../../core/theme/useThemeTokens';
import { useTranslation } from '../../../../../core/i18n/useTranslation';
import { getMinTouchTarget } from '../../../../../core/theme/getMinTouchTarget';
import { triggerLightImpact, triggerWarningNotification } from '../../../../../core/interaction/haptics';
import { UserSettingsConfirmDialog } from './UserSettingsConfirmDialog';
import { UserSettingsBackupRestoreDialog } from './UserSettingsBackupRestoreDialog';
import type { BackupRestoreMode, BackupTask } from '../types/user_settings.types';

type PendingDataAction = 'clear-completed' | 'empty-trash';

interface UserSettingsDataSectionProps {
  onExport: () => void | Promise<boolean>;
  onImport: (tasks: BackupTask[], mode: BackupRestoreMode) => Promise<boolean>;
  onClearCompleted: () => void;
  onEmptyTrash: () => void;
}

/**
 * Renders task backup actions and prevents single-tap destructive cleanup.
 * @param props - Export/import actions and confirmation-gated cleanup callbacks.
 * @returns Settings data controls with backup validation and explicit confirmations.
 */
export function UserSettingsDataSection({ onExport, onImport, onClearCompleted, onEmptyTrash }: UserSettingsDataSectionProps) {
  const tokens = useThemeTokens();
  const { t } = useTranslation();
  const minTarget = getMinTouchTarget();
  const [backupVisible, setBackupVisible] = useState(false);
  const [pendingAction, setPendingAction] = useState<PendingDataAction | null>(null);

  const styles = StyleSheet.create({
    section: { backgroundColor: tokens.color.card, borderRadius: tokens.radius.lg, borderWidth: 1, borderColor: tokens.color.border, marginBottom: tokens.space[4], overflow: 'hidden' },
    row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: tokens.space[4], minHeight: minTarget, borderBottomWidth: 1, borderBottomColor: tokens.color.border },
    lastRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: tokens.space[4], minHeight: minTarget },
    leftContent: { flexDirection: 'row', alignItems: 'center', gap: tokens.space[3] },
    label: { ...tokens.typography.body, color: tokens.color.foreground, fontWeight: '500' },
    dangerLabel: { ...tokens.typography.body, color: tokens.color.destructive, fontWeight: '600' },
  });

  const handleExport = () => { triggerLightImpact(); void onExport(); };
  const handleConfirm = () => {
    const action = pendingAction;
    setPendingAction(null);
    triggerWarningNotification();
    if (action === 'clear-completed') onClearCompleted();
    if (action === 'empty-trash') onEmptyTrash();
  };

  return (
    <>
      <View style={styles.section}>
        <Pressable style={styles.row} onPress={handleExport} accessibilityRole="button" accessibilityLabel={t('user_settings_profile.BACKUP_EXPORT_ACCESSIBILITY')} testID="user_settings-backup-export">
          <View style={styles.leftContent}><Download size={18} color={tokens.color.primary} /><Text style={styles.label}>{t('user_settings_profile.BACKUP_TASKS')}</Text></View>
        </Pressable>
        <Pressable style={styles.row} onPress={() => setBackupVisible(true)} accessibilityRole="button" accessibilityLabel={t('user_settings_profile.BACKUP_IMPORT_ACCESSIBILITY')} testID="user_settings-backup-import">
          <View style={styles.leftContent}><Upload size={18} color={tokens.color.primary} /><Text style={styles.label}>{t('user_settings_profile.RESTORE_TASKS')}</Text></View>
        </Pressable>
        <Pressable style={styles.row} onPress={() => setPendingAction('clear-completed')} accessibilityRole="button" accessibilityLabel={t('user_settings_profile.CLEAR_COMPLETED')} testID="user_settings-clear-completed-open">
          <View style={styles.leftContent}><Trash2 size={18} color={tokens.color.muted} /><Text style={styles.label}>{t('user_settings_profile.CLEAR_COMPLETED')}</Text></View>
        </Pressable>
        <Pressable style={styles.lastRow} onPress={() => setPendingAction('empty-trash')} accessibilityRole="button" accessibilityLabel={t('user_settings_profile.EMPTY_TRASH')} testID="user_settings-empty-trash-open">
          <View style={styles.leftContent}><RotateCcw size={18} color={tokens.color.destructive} /><Text style={styles.dangerLabel}>{t('user_settings_profile.EMPTY_TRASH')}</Text></View>
        </Pressable>
      </View>
      <UserSettingsConfirmDialog
        visible={pendingAction !== null}
        title={pendingAction === 'clear-completed' ? t('user_settings_profile.DELETE_COMPLETED_CONFIRM_TITLE') : t('user_settings_profile.EMPTY_TRASH_CONFIRM_TITLE')}
        description={pendingAction === 'clear-completed'
          ? t('user_settings_profile.DELETE_COMPLETED_CONFIRM_DESCRIPTION')
          : t('user_settings_profile.EMPTY_TRASH_CONFIRM_DESCRIPTION')}
        confirmLabel={pendingAction === 'clear-completed' ? 'Delete Completed' : 'Empty Trash'}
        onCancel={() => setPendingAction(null)}
        onConfirm={handleConfirm}
      />
      <UserSettingsBackupRestoreDialog visible={backupVisible} onClose={() => setBackupVisible(false)} onImport={onImport} />
    </>
  );
}
