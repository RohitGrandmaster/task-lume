import notifee, {
  AndroidImportance,
  TriggerType,
  AndroidVisibility,
  AlarmType,
} from '@notifee/react-native';
import {PermissionsAndroid, Vibration, Platform} from 'react-native';
import {
  playAlarmSound,
  playAlertSound,
  stopSound,
} from '../services/soundService';

export const TIMER_CHANNEL_ID = 'todo-timers-channel-v12';
export const TIMER_RUNNING_CHANNEL_ID = 'todo-timers-running-v12';
export const ALERT_CHANNEL_ID = 'todo-reminders-channel-v12';
export const FOCUS_CHANNEL_ID = 'pomodoro-focus-channel-v12';
export const FOCUS_RUNNING_CHANNEL_ID = 'pomodoro-running-v12';

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

// ✅ NEW HELPER: ek channel fail ho to baaki na rukein,
// aur custom sound missing ho to default sound ke saath retry kare
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
        console.log(
          `[notifications] channel "${config.id}" created with default sound (custom "${config.sound}" missing?)`,
        );
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

export async function showNotificationSafe(notification) {
  try {
    return await notifee.displayNotification(notification);
  } catch (err) {
    console.log('[notifications] displayNotification error:', err?.message || err);
    try {
      const sanitized = {
        ...notification,
        android: {
          ...notification.android,
        },
      };
      if (sanitized.android?.sound) {
        delete sanitized.android.sound;
      }
      return await notifee.displayNotification(sanitized);
    } catch (fallbackErr) {
      console.log('[notifications] displayNotification fallback error:', fallbackErr?.message || fallbackErr);
    }
  }
}

export async function prepareTodoTimerNotifications(force = false) {
  if (channelsReady && !force) return;
  try {
    await ensureNotificationPermissions();
    if (Platform.OS === 'android') {
      try {
        const oldChannels = [
          'todo-timers-channel-v1','todo-timers-channel-v2','todo-timers-channel-v3',
          'todo-timers-channel-v4','todo-timers-channel-v5','todo-timers-channel-v6',
          'todo-timers-channel-v7','todo-timers-channel-v8','todo-timers-channel-v9',
          'todo-timers-channel-v10','todo-timers-channel-v11',
          'todo-timers-running-v1','todo-timers-running-v2','todo-timers-running-v3',
          'todo-timers-running-v4','todo-timers-running-v5','todo-timers-running-v6',
          'todo-timers-running-v7','todo-timers-running-v8','todo-timers-running-v9',
          'todo-timers-running-v10','todo-timers-running-v11',
          'todo-reminders-channel-v1','todo-reminders-channel-v2','todo-reminders-channel-v3',
          'todo-reminders-channel-v4','todo-reminders-channel-v5','todo-reminders-channel-v6',
          'todo-reminders-channel-v7','todo-reminders-channel-v8','todo-reminders-channel-v9',
          'todo-reminders-channel-v10','todo-reminders-channel-v11',
          'pomodoro-focus-channel-v1','pomodoro-focus-channel-v2','pomodoro-focus-channel-v3',
          'pomodoro-focus-channel-v4','pomodoro-focus-channel-v5','pomodoro-focus-channel-v6',
          'pomodoro-focus-channel-v7','pomodoro-focus-channel-v8','pomodoro-focus-channel-v9',
          'pomodoro-focus-channel-v10','pomodoro-focus-channel-v11',
          'pomodoro-running-channel-v1','pomodoro-running-channel-v2','pomodoro-running-channel-v3',
          'pomodoro-running-channel-v4','pomodoro-running-channel-v5','pomodoro-running-channel-v6',
          'pomodoro-running-channel-v7','pomodoro-running-channel-v8','pomodoro-running-channel-v9',
          'pomodoro-running-channel-v10','pomodoro-running-channel-v11',
        ];
        for (const ch of oldChannels) {
          await notifee.deleteChannel(ch).catch(() => {});
        }
      } catch (_) {}

      // ✅ Channels configured with fresh IDs
      await createChannelSafe({
        id: TIMER_CHANNEL_ID,
        name: 'Todo Timer Finished',
        importance: AndroidImportance.HIGH,
        vibration: true,
        vibrationPattern: [0, 400, 200, 400, 200, 400],
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

export async function scheduleTodoTimer(todo, durationMinutes, showStartBanner = true) {
  const mins = Math.max(1, Number(durationMinutes) || 1);
  const endAt = Date.now() + mins * 60 * 1000;
  try {
    await prepareTodoTimerNotifications();
    if (!todo || !todo.id) {
      return {timerEndAt: endAt, timerNotificationId: null};
    }
    const notificationId = `todo-timer-${todo.id}`;
    try {
      await notifee.cancelTriggerNotification(notificationId).catch(() => {});
      await notifee.cancelNotification(notificationId).catch(() => {});
      await notifee.cancelNotification(`todo-timer-start-${todo.id}`).catch(() => {});
    } catch (_) {}
    try { vibrateStart(); } catch (_) {}
    if (!_notificationsEnabled) {
      return {timerEndAt: endAt, timerNotificationId: null};
    }
    if (showStartBanner) {
      try {
        await notifee.displayNotification({
          id: `todo-timer-start-${todo.id}`,
          title: '⏱️ Timer Started',
          body: `"${todo.title || 'Task'}" ke liye ${mins} min ka timer shuru hua.`,
          android: {
            channelId: TIMER_RUNNING_CHANNEL_ID,
            pressAction: {id: 'default'},
            smallIcon: SMALL_ICON,
            largeIcon: LARGE_ICON,
            importance: AndroidImportance.LOW,
            visibility: AndroidVisibility.PUBLIC,
            autoCancel: true,
            onlyAlertOnce: true,
          },
        });
      } catch (e) {
        console.log('[notifications] start notification error:', e);
      }
    }
    let scheduledId = notificationId;
    const triggerPayload = {
      id: notificationId,
      title: '⏱️ Timer Finished!',
      body: `"${todo.title || 'Task'}" ka timer complete ho gaya!`,
      android: {
        channelId: TIMER_CHANNEL_ID,
        pressAction: {id: 'default'},
        smallIcon: SMALL_ICON,
        largeIcon: LARGE_ICON,
        vibrationPattern: [0, 400, 200, 400, 200, 400],
        autoCancel: true,
        importance: AndroidImportance.HIGH,
        visibility: AndroidVisibility.PUBLIC,
      },
      ios: {sound: 'default'},
    };

    try {
      await notifee.createTriggerNotification(
        triggerPayload,
        {
          type: TriggerType.TIMESTAMP,
          timestamp: endAt,
          alarmManager: {
            type: AlarmType.SET_EXACT_AND_ALLOW_WHILE_IDLE,
            allowWhileIdle: true,
          },
        },
      );
    } catch (triggerErr) {
      console.log('[notifications] exact alarm trigger failed, trying allowWhileIdle:', triggerErr?.message || triggerErr);
      try {
        await notifee.createTriggerNotification(
          triggerPayload,
          {
            type: TriggerType.TIMESTAMP,
            timestamp: endAt,
            alarmManager: {allowWhileIdle: true},
          },
        );
      } catch (fallbackErr) {
        console.log('[notifications] alarmManager trigger failed, trying timestamp only:', fallbackErr?.message || fallbackErr);
        try {
          await notifee.createTriggerNotification(
            triggerPayload,
            {type: TriggerType.TIMESTAMP, timestamp: endAt},
          );
        } catch (finalErr) {
          console.log('[notifications] createTriggerNotification all attempts failed:', finalErr?.message || finalErr);
          scheduledId = null;
        }
      }
    }
    return {timerEndAt: endAt, timerNotificationId: scheduledId};
  } catch (error) {
    try { vibrateStart(); } catch (_) {}
    return {timerEndAt: endAt, timerNotificationId: null};
  }
}

export async function notifyTimerCompleted(todo, playAudio = true) {
  try {
    if (!todo || !todo.id) return;
    await prepareTodoTimerNotifications();
    try {
      // 1. Cancel the start notification so it doesn't linger in notification center
      await notifee.cancelNotification(`todo-timer-start-${todo.id}`).catch(() => {});
      // 2. Cancel pending trigger notification so it doesn't duplicate
      const triggerId = todo.timerNotificationId || `todo-timer-${todo.id}`;
      await notifee.cancelTriggerNotification(triggerId).catch(() => {});
    } catch (_) {}

    if (playAudio) {
      playAlarmSound(false, 3000);
      try { vibrateNow(); } catch (_) {}
    }

    if (_notificationsEnabled) {
      await showNotificationSafe({
        id: `todo-timer-done-${todo.id}`,
        title: '⏱️ Timer Finished!',
        body: `"${todo.title || 'Task'}" ka timer pura ho gaya!`,
        android: {
          channelId: TIMER_CHANNEL_ID,
          pressAction: {id: 'default'},
          smallIcon: SMALL_ICON,
          largeIcon: LARGE_ICON,
          autoCancel: true,
          importance: AndroidImportance.HIGH,
          visibility: AndroidVisibility.PUBLIC,
        },
        ios: {sound: 'default'},
      });
    }
  } catch (error) {
    console.log('[notifications] notifyTimerCompleted error:', error);
  }
}

export async function cancelTodoTimer(todo, cancelDone = false) {
  try {
    if (!todo || !todo.id) return;
    const notificationId = todo.timerNotificationId || `todo-timer-${todo.id}`;
    await notifee.cancelTriggerNotification(notificationId).catch(() => {});
    await notifee.cancelNotification(`todo-timer-start-${todo.id}`).catch(() => {});
    if (cancelDone) {
      await notifee.cancelNotification(notificationId).catch(() => {});
      await notifee.cancelNotification(`todo-timer-done-${todo.id}`).catch(() => {});
      stopSound();
    }
  } catch (error) {
    console.log('[notifications] cancel error:', error);
  }
}

export function parseTaskDueDate(dueDate) {
  if (!dueDate || dueDate === 'No date') return null;
  const dd = String(dueDate).trim();
  if (!dd) return null;
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const lower = dd.toLowerCase();
  if (lower === 'today') return today;
  if (lower === 'tomorrow') {
    const t = new Date(today);
    t.setDate(t.getDate() + 1);
    return t;
  }
  if (lower === 'next week' || lower === 'nextweek') {
    const t = new Date(today);
    t.setDate(t.getDate() + 7);
    return t;
  }
  if (/^\d{4}-\d{2}-\d{2}$/.test(dd)) {
    const [y, m, d] = dd.split('-').map(Number);
    return new Date(y, m - 1, d);
  }
  const parsed = new Date(dd);
  if (!isNaN(parsed.getTime())) return parsed;
  return null;
}

export function calculateReminderTimestamp(todo, isManualToggle = false) {
  const dateObj = parseTaskDueDate(todo.dueDate);
  if (!dateObj) return null;
  const target = new Date(dateObj);
  let targetHour = 9;
  let targetMinute = 0;
  if (todo.reminderTime && typeof todo.reminderTime === 'string') {
    const [h, m] = todo.reminderTime.split(':').map(Number);
    if (!isNaN(h) && !isNaN(m)) {
      targetHour = h;
      targetMinute = m;
    }
  }
  target.setHours(targetHour, targetMinute, 0, 0);
  const now = Date.now();
  if (target.getTime() <= now) {
    const isToday =
      dateObj.getFullYear() === new Date().getFullYear() &&
      dateObj.getMonth() === new Date().getMonth() &&
      dateObj.getDate() === new Date().getDate();
    if (isToday) {
      if (isManualToggle) return now + 15 * 1000;
      return null;
    }
    return null;
  }
  return target.getTime();
}

export async function scheduleTodoReminder(todo, isManualToggle = false) {
  try {
    if (!todo || !todo.id || !todo.reminder) return null;
    if (!_notificationsEnabled) return null;
    await prepareTodoTimerNotifications();
    const timestamp = calculateReminderTimestamp(todo, isManualToggle);
    if (!timestamp || timestamp <= Date.now()) return null;
    const notificationId = `todo-reminder-${todo.id}`;
    await notifee.cancelTriggerNotification(notificationId);
    await notifee.cancelNotification(notificationId);
    await notifee.createTriggerNotification(
      {
        id: notificationId,
        title: '🔔 Task Alert & Reminder',
        body: `"${todo.title || 'Task'}" is scheduled for today!`,
        android: {
          channelId: ALERT_CHANNEL_ID,
          pressAction: {id: 'default'},
          smallIcon: SMALL_ICON,
          largeIcon: LARGE_ICON,
          sound: 'alert',
          vibrationPattern: [0, 200, 100, 200],
          autoCancel: true,
          importance: AndroidImportance.HIGH,
          visibility: AndroidVisibility.PUBLIC,
        },
        ios: {sound: 'default'},
      },
      {type: TriggerType.TIMESTAMP, timestamp, alarmManager: {allowWhileIdle: true}},
    );
    return {reminderNotificationId: notificationId, reminderTimestamp: timestamp};
  } catch (error) {
    console.log('[notifications] schedule reminder error:', error);
    return null;
  }
}

export async function cancelTodoReminder(todo) {
  try {
    if (!todo || !todo.id) return;
    const notificationId = `todo-reminder-${todo.id}`;
    await notifee.cancelTriggerNotification(notificationId);
    await notifee.cancelNotification(notificationId);
  } catch (error) {
    console.log('[notifications] cancel reminder error:', error);
  }
}

export async function notifyReminderAlert(todo) {
  try {
    if (!todo) return;
    await prepareTodoTimerNotifications();
    playAlertSound(false);
    if (_notificationsEnabled) {
      await showNotificationSafe({
        id: `todo-reminder-alert-${todo.id || Date.now()}`,
        title: '🔔 Task Alert & Reminder',
        body: `"${todo.title || 'Task'}" is due today!`,
        android: {
          channelId: ALERT_CHANNEL_ID,
          pressAction: {id: 'default'},
          smallIcon: SMALL_ICON,
          largeIcon: LARGE_ICON,
          vibrationPattern: [0, 200, 100, 200],
          autoCancel: true,
          importance: AndroidImportance.HIGH,
          visibility: AndroidVisibility.PUBLIC,
        },
        ios: {sound: 'default'},
      });
    }
  } catch (error) {
    console.log('[notifications] notifyReminderAlert error:', error);
  }
}

export async function rescheduleActiveTimers(tasks) {
  if (!Array.isArray(tasks) || tasks.length === 0) return;
  const now = Date.now();
  for (const task of tasks) {
    if (task.timerEndAt && task.timerEndAt > now) {
      const minutesLeft = Math.ceil((task.timerEndAt - now) / 60000);
      if (minutesLeft > 0) {
        try {
          await scheduleTodoTimer(task, minutesLeft, false);
        } catch (error) {
          console.log('[notifications] reschedule timer error:', error);
        }
      }
    }
  }
}

export async function rescheduleAllReminders(tasks) {
  if (!Array.isArray(tasks) || tasks.length === 0) return;
  for (const task of tasks) {
    if (task.reminder && !task.completed && !task.deleted) {
      try {
        await scheduleTodoReminder(task, false);
      } catch (error) {
        console.log('[notifications] reschedule reminder error:', error);
      }
    }
  }
}

function formatFocusDuration(totalSec) {
  const sec = Math.max(0, Math.floor(Number(totalSec) || 0));
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  if (m >= 60) {
    const h = Math.floor(m / 60);
    const mm = m % 60;
    return `${h}h ${String(mm).padStart(2, '0')}m`;
  }
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export function vibrateFocusStart() {
  try {
    Vibration.vibrate(100);
  } catch (error) {
    console.log('[notifications] vibrateFocusStart error:', error);
  }
}

export function vibrateFocusComplete() {
  try {
    Vibration.vibrate([0, 400, 200, 400, 200, 400]);
  } catch (error) {
    console.log('[notifications] vibrateFocusComplete error:', error);
  }
}

export async function scheduleFocusTimerNotification({
  mode = 'work',
  durationMinutes = 25,
  secondsLeft = null,
  taskTitle = null,
}) {
  const actualSec =
    secondsLeft !== null && secondsLeft !== undefined
      ? Math.max(1, Math.floor(Number(secondsLeft)))
      : Math.max(1, Math.round(Number(durationMinutes) || 25) * 60);
  const endAt = Date.now() + actualSec * 1000;
  const minsLabel = actualSec >= 60 ? `${Math.round(actualSec / 60)} min` : `${actualSec} sec`;
  const timeLabel = formatFocusDuration(actualSec);
  const taskName = taskTitle || (mode === 'work' || mode === 'focus' ? 'Focus' : 'Break');
  const modeLabel =
    mode === 'work' || mode === 'focus'
      ? 'Focus'
      : mode === 'shortBreak'
      ? 'Short Break'
      : mode === 'longBreak'
      ? 'Long Break'
      : 'Timer';
  vibrateFocusStart();
  try {
    await prepareTodoTimerNotifications();
    try {
      await notifee.cancelTriggerNotification('focus-timer-completion');
      await notifee.cancelNotification('focus-timer-completion');
      await notifee.cancelNotification('focus-timer-start');
      await notifee.cancelNotification('focus-timer-running');
    } catch (_) {}
    if (_notificationsEnabled) {
      try {
        await notifee.displayNotification({
          id: 'focus-timer-running',
          title: `🎯 ${modeLabel} · ${timeLabel} left`,
          body: `"${taskName}" in progress`,
          android: {
            channelId: FOCUS_RUNNING_CHANNEL_ID,
            pressAction: {id: 'default'},
            smallIcon: SMALL_ICON,
            largeIcon: LARGE_ICON,
            importance: AndroidImportance.LOW,
            visibility: AndroidVisibility.PUBLIC,
            ongoing: true,
            autoCancel: false,
            onlyAlertOnce: true,
            asForegroundService: false,
          },
        });
      } catch (runErr) {
        console.log('[notifications] focus running banner error:', runErr);
      }
      const finishedTitle =
        mode === 'work' || mode === 'focus' ? '🎯 Focus Completed!' : '☕ Break Finished!';
      const finishedBody =
        mode === 'work' || mode === 'focus'
          ? `"${taskName}" · ${minsLabel} focus complete!`
          : `Break over (${minsLabel}) — back to focus!`;
      const focusTriggerPayload = {
        id: 'focus-timer-completion',
        title: finishedTitle,
        body: finishedBody,
        android: {
          channelId: FOCUS_CHANNEL_ID,
          pressAction: {id: 'default'},
          smallIcon: SMALL_ICON,
          largeIcon: LARGE_ICON,
          vibrationPattern: [0, 400, 200, 400, 200, 400],
          autoCancel: true,
          importance: AndroidImportance.HIGH,
          visibility: AndroidVisibility.PUBLIC,
        },
        ios: {sound: 'default'},
      };
      try {
        await notifee.createTriggerNotification(
          focusTriggerPayload,
          {
            type: TriggerType.TIMESTAMP,
            timestamp: endAt,
            alarmManager: {
              type: AlarmType.SET_EXACT_AND_ALLOW_WHILE_IDLE,
              allowWhileIdle: true,
            },
          },
        );
      } catch (triggerErr) {
        try {
          await notifee.createTriggerNotification(
            focusTriggerPayload,
            {type: TriggerType.TIMESTAMP, timestamp: endAt, alarmManager: {allowWhileIdle: true}},
          );
        } catch (fallbackErr) {
          try {
            await notifee.createTriggerNotification(
              focusTriggerPayload,
              {type: TriggerType.TIMESTAMP, timestamp: endAt},
            );
          } catch (finalErr) {
            console.log('[notifications] focus trigger error:', finalErr);
          }
        }
      }
    }
    return {endAt, durationSec: actualSec, timeLabel};
  } catch (error) {
    console.log('[notifications] scheduleFocusTimer error:', error);
    return {endAt, durationSec: actualSec, timeLabel};
  }
}

export async function cancelFocusTimerNotification() {
  try {
    await notifee.cancelTriggerNotification('focus-timer-completion');
    await notifee.cancelNotification('focus-timer-completion');
    await notifee.cancelNotification('focus-timer-start');
    await notifee.cancelNotification('focus-timer-running');
    stopSound();
  } catch (error) {
    console.log('[notifications] cancel focus error:', error);
  }
}

export async function notifyFocusCompleted(modeOrOpts = 'work', taskTitleArg = null) {
  try {
    let mode = 'work';
    let taskTitle = null;
    let durationMinutes = null;
    if (modeOrOpts && typeof modeOrOpts === 'object') {
      mode = modeOrOpts.mode || 'work';
      taskTitle = modeOrOpts.taskTitle || null;
      durationMinutes = modeOrOpts.durationMinutes ?? null;
    } else {
      mode = modeOrOpts || 'work';
      taskTitle = taskTitleArg;
    }
    try {
      await notifee.cancelTriggerNotification('focus-timer-completion');
      await notifee.cancelNotification('focus-timer-completion');
      await notifee.cancelNotification('focus-timer-running');
      await notifee.cancelNotification('focus-timer-start');
    } catch (_) {}
    vibrateFocusComplete();
    const minsPart = durationMinutes != null ? ` · ${durationMinutes} min` : '';
    const title =
      mode === 'work' || mode === 'focus' ? '🎯 Focus Completed!' : '☕ Break Finished!';
    const body = taskTitle
      ? `"${taskTitle}"${minsPart} session complete!`
      : mode === 'work' || mode === 'focus'
      ? `Great work${minsPart} — take a break!`
      : `Break over${minsPart} — back to focus!`;
    if (_notificationsEnabled) {
      await prepareTodoTimerNotifications();
      await showNotificationSafe({
        id: `focus-done-${Date.now()}`,
        title,
        body,
        android: {
          channelId: FOCUS_CHANNEL_ID,
          pressAction: {id: 'default'},
          smallIcon: SMALL_ICON,
          largeIcon: LARGE_ICON,
          autoCancel: true,
          importance: AndroidImportance.HIGH,
          visibility: AndroidVisibility.PUBLIC,
        },
        ios: {sound: 'default'},
      });
    }
  } catch (error) {
    console.log('[notifications] notifyFocusCompleted error:', error);
  }
}