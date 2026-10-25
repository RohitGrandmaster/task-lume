/**
 * RESPONSIBILITY: Serializes and shares a versioned JSON backup of locally stored user tasks.
 * FLOW: UserSettingsDataSection → useUserSettings.exportData → this feature-local backup utility.
 */

import { Share } from 'react-native';
import { showToast } from '../../../../../core/toast/showToast';

export interface UserSettingsBackupEnvelope {
  format: 'tasklume-backup';
  version: 1;
  exportedAt: string;
  tasks: unknown[];
}

/**
 * Creates the portable JSON representation used by the settings backup action.
 *
 * @param tasks - Locally stored task records selected by the caller.
 * @returns A versioned JSON envelope containing the task records.
 */
export function serializeUserSettingsBackup(tasks: unknown[]): string {
  const backup: UserSettingsBackupEnvelope = {
    format: 'tasklume-backup',
    version: 1,
    exportedAt: new Date().toISOString(),
    tasks,
  };
  return JSON.stringify(backup, null, 2);
}

/**
 * Opens the native share sheet for a portable JSON backup.
 *
 * @param tasks - The current user's task records.
 * @returns True when the native share flow returns a share action, otherwise false.
 */
export async function exportUserSettingsBackup(tasks: unknown[]): Promise<boolean> {
  try {
    const json = serializeUserSettingsBackup(tasks);
    const result = await Share.share({ title: 'TaskLume task backup (JSON)', message: json });
    if (result.action === Share.dismissedAction) {
      showToast('Backup sharing cancelled', 'info', 'settings-export-cancelled');
      return false;
    }
    showToast('JSON backup is ready in the selected share destination', 'success', 'settings-export-ready');
    return true;
  } catch {
    showToast('Backup export failed', 'error', 'settings-export-failed');
    return false;
  }
}
