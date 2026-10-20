import notifee, {
  AndroidImportance,
  TriggerType,
  AndroidVisibility,
} from '@notifee/react-native';
import {
  PermissionsAndroid,
  Vibration,
  Platform,
  AppState,
} from 'react-native';
import {
  playAlarmSound,
  playAlertSound,
  stopSound,
} from '../services/soundService';

export const TIMER_CHANNEL_ID = 'todo-timers-channel-v7';
export const TIMER_RUNNING_CHANNEL_ID = 'todo-timers-running-v11';
export const ALERT_CHANNEL_ID = 'todo-reminders-channel-v7';
export const FOCUS_CHANNEL_ID = 'pomodoro-focus-channel-v7';
export const FOCUS_RUNNING_CHANNEL_ID = 'pomodoro-running-v11';

let channelsReady = false;
let _notificationsEnabled = true;

const SMALL_ICON = 'ic_notification';
const LARGE_ICON = 'ic_launcher';

export function setNotificationsEnabled(enabled) {
  _notificationsEnabled = Boolean(enabled);
}

export function isNotificationsEnabled() {
  return _notificationsEnabled;
}

export function vibrateNow() {
  try {
    Vibration.vibrate([0, 400, 200, 400, 200, 400]);
  } catch (error) {
    console.log('[notifications] vibrate error:', error);
  }
}

export function vibrateStart() {
  try {
    Vibration.vibrate(100);
  } catch (error) {
    console.log('[notifications] vibrateStart error:', error);
  }
}

async function ensureNotificationPermissions() {
  if (Platform.OS !== 'android') {
    await notifee.requestPermission();
    return;
  }
  if (Platform.Version >= 33) {
    try {
      const granted = await PermissionsAndroid.check(
        'android.permission.POST_NOTIFICATIONS',
      );
      if (!granted) {
        await PermissionsAndroid.request(
          'android.permission.POST_NOTIFICATIONS',
        );
      }
    } catch (permErr) {
      console.log('[notifications] permission request error:', permErr);
    }
  }
  await notifee.requestPermission();
  try {
    const settings = await notifee.getNotificationSettings();
    const alarm = settings?.android?.alarm;
    if (alarm !== undefined && alarm !== 1) {
      await notifee.openAlarmPermissionSettings().catch(() => {});
    }
  } catch (alarmErr) {
    console.log('[notifications] alarm permission check error:', alarmErr);
  }
}

async function createChannelSafe(config) {
  try {
    await notifee.createChannel(config);
    return true;
  } catch (err) {
    console.log(
      `[notifications] channel "${config.id}" failed:`,
      err?.message || err,
    );
    if (config.sound && config.sound !== 'default') {
      try {
        await notifee.createChannel({...config, sound: 'default'});
        return true;
      } catch (retryErr) {
        console.log(
          `[notifications] channel "${config.id}" retry failed:`,
          retryErr?.message || retryErr,
        );
      }
    }
    return false;
  }
}

export async function prepareTodoTimerNotifications(force = false) {
  if (channelsReady && !force) return;
  try {
    await ensureNotificationPermissions();
    if (Platform.OS === 'android') {
      try {
        const oldChannels = [
          'todo-timers-channel-v2','todo-reminders-channel-v2','pomodoro-focus-channel-v3',
          'todo-timers-channel-v4','todo-timers-running-v4','todo-reminders-channel-v4',
          'pomodoro-focus-channel-v4','pomodoro-running-channel-v4','todo-timers-channel-v5',
          'todo-timers-running-v5','todo-timers-running-v6','todo-timers-running-v7',
          'todo-timers-running-v8','todo-timers-running-v9','todo-timers-running-v10',
          'todo-reminders-channel-v5','todo-reminders-channel-v6','pomodoro-focus-channel-v5',
          'pomodoro-focus-channel-v6','pomodoro-running-channel-v5','pomodoro-running-channel-v6',
          'pomodoro-running-channel-v7','pomodoro-running-channel-v8','pomodoro-running-v9',
          'pomodoro-running-v10','todo-timers-channel-v6',
        ];
        for (const ch of oldChannels) {
          await notifee.deleteChannel(ch).catch(() => {});
        }
      } catch (_) {}

      await createChannelSafe({
        id: TIMER_CHANNEL_ID,
        name: 'Todo Timer Finished',
        importance: AndroidImportance.HIGH,
        vibration: true,
        vibrationPattern: [0, 500, 250, 500, 250, 500, 250, 500, 250, 500, 250, 500, 250, 500],
        sound: 'alarm',
        lights: true,
        lightColor: '#F97316',
        visibility: AndroidVisibility.PUBLIC,
      });
      await createChannelSafe({
        id: TIMER_RUNNING_CHANNEL_ID,
        name: 'Todo Timer Started',
        importance: AndroidImportance.LOW,
        vibration: false,
        lights: false,
        visibility: AndroidVisibility.PUBLIC,
      });
      await createChannelSafe({
        id: ALERT_CHANNEL_ID,
        name: 'Todo Alerts & Reminders',
        importance: AndroidImportance.HIGH,
        vibration: true,
        vibrationPattern: [0, 200, 100, 200],
        sound: 'alert',
        lights: true,
        lightColor: '#3B82F6',
        visibility: AndroidVisibility.PUBLIC,
      });
      await createChannelSafe({
        id: FOCUS_CHANNEL_ID,
        name: 'Focus Session Completed',
        importance: AndroidImportance.HIGH,
        vibration: true,
        vibrationPattern: [0, 400, 200, 400, 200, 400],
        sound: 'alarm',
        lights: true,
        lightColor: '#F97316',
        visibility: AndroidVisibility.PUBLIC,
      });
      await createChannelSafe({
        id: FOCUS_RUNNING_CHANNEL_ID,
        name: 'Focus Timer Running',
        importance: AndroidImportance.LOW,
        vibration: false,
        lights: false,
        visibility: AndroidVisibility.PUBLIC,
      });
      channelsReady = true;
    } else {
      channelsReady = true;
    }
  } catch (error) {
    console.log('[notifications] prepare error:', error);
  }
}
