/**
 * RESPONSIBILITY: Canonical permissions service managing platform audio, notification, and camera access.
 * FLOW: Queries platform permission status, prompts user via native dialogs, and reports grants.
 */

import { Platform, PermissionsAndroid, PermissionStatus } from 'react-native';

export type AppPermissionType = 'audio_recording' | 'notifications';

export async function checkPermission(permission: AppPermissionType): Promise<boolean> {
  if (Platform.OS === 'android') {
    if (permission === 'audio_recording') {
      const status = await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.RECORD_AUDIO);
      return status;
    }
    if (permission === 'notifications' && Platform.Version >= 33) {
      const status = await PermissionsAndroid.check('android.permission.POST_NOTIFICATIONS' as any);
      return status;
    }
    return true;
  }
  // iOS permissions are handled dynamically on access
  return true;
}

export async function requestPermission(permission: AppPermissionType): Promise<boolean> {
  if (Platform.OS === 'android') {
    if (permission === 'audio_recording') {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
        {
          title: 'Microphone Permission',
          message: 'TaskLume requires microphone access to record voice memos.',
          buttonPositive: 'Allow',
          buttonNegative: 'Deny',
        }
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    }
    if (permission === 'notifications' && Platform.Version >= 33) {
      const granted = await PermissionsAndroid.request('android.permission.POST_NOTIFICATIONS' as any, {
        title: 'Notification Permission',
        message: 'TaskLume requires notification permissions to alert you for due tasks and timer completions.',
        buttonPositive: 'Allow',
        buttonNegative: 'Deny',
      });
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    }
    return true;
  }
  return true;
}

export default { checkPermission, requestPermission };
