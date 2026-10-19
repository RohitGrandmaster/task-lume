import notifee, {
  AndroidImportance,
  AndroidVisibility,
  AuthorizationStatus,
  TriggerType,
} from '@notifee/react-native';
import {Vibration, Platform} from 'react-native';
import {
  playAlarmSound,
  playAlertSound,
  playFocusSound,
  stopSound,
} from '../services/soundService';

/* Channels v7 — force Android to recreate with HIGH importance (heads-up) */
export const TIMER_CHANNEL_ID = 'todo-timers-channel-v7';
export const TIMER_RUNNING_CHANNEL_ID = 'todo-timers-running-v7';
export const ALERT_CHANNEL_ID = 'todo-reminders-channel-v7';
export const FOCUS_CHANNEL_ID = 'pomodoro-focus-channel-v7';
export const FOCUS_RUNNING_CHANNEL_ID = 'pomodoro-running-channel-v7';

let channelsReady = false;
let _notificationsEnabled = true;

/** White silhouette status-bar icon in res/drawable (NOT mipmap) */
const SMALL_ICON = 'ic_notification';

export function setNotificationsEnabled(enabled) {
  _notificationsEnabled = Boolean(enabled);
}

export function isNotificationsEnabled() {
  return _notificationsEnabled;
}

export function vibrateNow() {
  try {
    Vibration.vibrate([0, 300, 150, 300]);
  } catch (error) {
    console.log('[notifications] vibrate error:', error);
  }
}

export function vibrateFocusStart() {
  try {
    Vibration.vibrate([0, 220, 120, 220]);
  } catch (_) {}
}

export function vibrateFocusComplete() {
  try {
    Vibration.vibrate([0, 400, 180, 400, 180, 400, 180, 500]);
  } catch (_) {}
}

function androidBase(channelId, extras = {}) {
  return {
    channelId,
    pressAction: {id: 'default'},
    smallIcon: SMALL_ICON,
    importance: AndroidImportance.HIGH,
    visibility: AndroidVisibility.PUBLIC,
    ...extras,
  };
}

export async function prepareTodoTimerNotifications(force = false) {
  if (channelsReady && !force) return true;

  try {
    const settings = await notifee.requestPermission();
    const auth =
      settings?.authorizationStatus ?? AuthorizationStatus.AUTHORIZED;
    if (
      auth === AuthorizationStatus.DENIED ||
      auth === AuthorizationStatus.NOT_DETERMINED
    ) {
      console.log('[notifications] permission status:', auth);
    }

    if (Platform.OS === 'android') {
      const oldChannels = [
        'todo-timers-channel-v2',
        'todo-reminders-channel-v2',
        'pomodoro-focus-channel-v3',
        'todo-timers-channel-v4',
        'todo-timers-running-v4',
        'todo-reminders-channel-v4',
        'pomodoro-focus-channel-v4',
        'pomodoro-running-channel-v4',
        'todo-timers-channel-v5',
        'todo-timers-running-v5',
        'todo-reminders-channel-v5',
        'pomodoro-focus-channel-v5',
        'pomodoro-running-channel-v5',
        'todo-timers-channel-v6',
        'todo-timers-running-v6',
        'todo-reminders-channel-v6',
        'pomodoro-focus-channel-v6',
        'pomodoro-running-channel-v6',
      ];
      for (const ch of oldChannels) {
        await notifee.deleteChannel(ch).catch(() => {});
      }

      await notifee.createChannel({
        id: TIMER_CHANNEL_ID,
        name: 'Todo Timer Finished',
        importance: AndroidImportance.HIGH,
        vibration: true,
        vibrationPattern: [0, 400, 200, 400, 200, 400, 200, 400],
        sound: 'alarm',
        lights: true,
        lightColor: '#F97316',
        visibility: AndroidVisibility.PUBLIC,
      });

      await notifee.createChannel({
        id: TIMER_RUNNING_CHANNEL_ID,
        name: 'Todo Timer Started',
        importance: AndroidImportance.HIGH,
        vibration: true,
        vibrationPattern: [0, 220, 120, 220],
        sound: 'default',
        lights: true,
        lightColor: '#F97316',
        visibility: AndroidVisibility.PUBLIC,
      });

      await notifee.createChannel({
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

      await notifee.createChannel({
        id: FOCUS_CHANNEL_ID,
        name: 'Focus Session Completed',
        importance: AndroidImportance.HIGH,
        vibration: true,
        vibrationPattern: [0, 400, 180, 400, 180, 400, 180, 500],
        sound: 'focus',
        lights: true,
        lightColor: '#6366F1',
        visibility: AndroidVisibility.PUBLIC,
      });

      await notifee.createChannel({
        id: FOCUS_RUNNING_CHANNEL_ID,
        name: 'Focus Timer Running',
        importance: AndroidImportance.HIGH,
        vibration: true,
        vibrationPattern: [0, 220, 120, 220],
        sound: 'default',
        lights: true,
        lightColor: '#6366F1',
        visibility: AndroidVisibility.PUBLIC,
      });

      channelsReady = true;
    } else {
      channelsReady = true;
    }
    return true;
  } catch (error) {
    console.log('[notifications] prepare error:', error);
    return false;
  }
}

async function showSystemNotification(payload) {
  try {
    await prepareTodoTimerNotifications();
    await notifee.displayNotification(payload);
    return true;
  } catch (e1) {
    console.log('[notifications] display error:', e1?.message || e1);
    try {
      const fallback = {
        ...payload,
        android: {
          ...(payload.android || {}),
          sound: 'default',
          smallIcon: SMALL_ICON,
          importance: AndroidImportance.HIGH,
          pressAction: {id: 'default'},
        },
        ios: {sound: 'default'},
      };
      delete fallback.android.vibrationPattern;
      await notifee.displayNotification(fallback);
      return true;
    } catch (e2) {
      console.log('[notifications] display fallback error:', e2?.message || e2);
      return false;
    }
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
    const title = todo.title || 'Task';

    try {
      await notifee.cancelTriggerNotification(notificationId);
      await notifee.cancelNotification(notificationId);
      await notifee.cancelNotification(`todo-timer-start-${todo.id}`);
    } catch (_) {}

    vibrateNow();

    if (!_notificationsEnabled) {
      return {timerEndAt: endAt, timerNotificationId: null};
    }

    if (showStartBanner) {
      await showSystemNotification({
        id: `todo-timer-start-${todo.id}`,
        title: '⏱️ Timer Started',
        body: `"${title}" — ${mins} min running`,
        android: androidBase(TIMER_RUNNING_CHANNEL_ID, {
          sound: 'default',
          vibrationPattern: [0, 220, 120, 220],
          autoCancel: true,
        }),
        ios: {sound: 'default'},
      });
    }

    let scheduledId = notificationId;
    try {
      await notifee.createTriggerNotification(
        {
          id: notificationId,
          title: '⏱️ Timer Finished!',
          body: `"${title}" — ${mins} min complete`,
          android: androidBase(TIMER_CHANNEL_ID, {
            sound: 'alarm',
            vibrationPattern: [0, 400, 200, 400, 200, 400, 200, 400],
            autoCancel: true,
          }),
          ios: {sound: 'default'},
        },
        {
          type: TriggerType.TIMESTAMP,
          timestamp: endAt,
          alarmManager: {allowWhileIdle: true},
        },
      );
    } catch (triggerErr) {
      console.log('[notifications] trigger schedule error:', triggerErr);
      scheduledId = null;
    }

    return {timerEndAt: endAt, timerNotificationId: scheduledId};
  } catch (error) {
    console.log('[notifications] schedule error:', error);
    vibrateNow();
    return {timerEndAt: endAt, timerNotificationId: null};
  }
}

export async function notifyTimerCompleted(todo) {
  try {
    if (!todo) return;
    playAlarmSound(true, 3500);
    vibrateNow();

    await showSystemNotification({
      id: `todo-timer-done-${todo.id || Date.now()}`,
      title: '⏱️ Timer Finished!',
      body: `"${todo.title || 'Task'}" timer complete`,
      android: androidBase(TIMER_CHANNEL_ID, {
        sound: 'alarm',
        vibrationPattern: [0, 400, 200, 400, 200, 400, 200, 400],
        autoCancel: true,
      }),
      ios: {sound: 'default'},
    });
  } catch (error) {
    console.log('[notifications] notifyTimerCompleted error:', error);
  }
}

export async function cancelTodoTimer(todo, cancelDone = false) {
  try {
    if (!todo || !todo.id) return;
    const notificationId = todo.timerNotificationId || `todo-timer-${todo.id}`;
    await notifee.cancelTriggerNotification(notificationId);
    await notifee.cancelNotification(notificationId);
    await notifee.cancelNotification(`todo-timer-start-${todo.id}`);
    if (cancelDone) {
      await notifee.cancelNotification(`todo-timer-done-${todo.id}`);
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
    if (isToday && isManualToggle) return now + 15 * 1000;
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
        title: '🔔 Task Reminder',
        body: `"${todo.title || 'Task'}" is due today`,
        android: androidBase(ALERT_CHANNEL_ID, {
          sound: 'alert',
          vibrationPattern: [0, 200, 100, 200],
          autoCancel: true,
        }),
        ios: {sound: 'default'},
      },
      {
        type: TriggerType.TIMESTAMP,
        timestamp,
        alarmManager: {allowWhileIdle: true},
      },
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
    playAlertSound(true);
    vibrateNow();
    await showSystemNotification({
      id: `todo-reminder-alert-${todo.id || Date.now()}`,
      title: '🔔 Task Reminder',
      body: `"${todo.title || 'Task'}" is due today`,
      android: androidBase(ALERT_CHANNEL_ID, {
        sound: 'alert',
        vibrationPattern: [0, 200, 100, 200],
        autoCancel: true,
      }),
      ios: {sound: 'default'},
    });
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
  const minsLabel =
    actualSec >= 60 ? `${Math.round(actualSec / 60)} min` : `${actualSec} sec`;
  const timeLabel = formatFocusDuration(actualSec);
  const taskName =
    taskTitle || (mode === 'work' || mode === 'focus' ? 'Focus' : 'Break');
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
      await showSystemNotification({
        id: 'focus-timer-start',
        title: `⏱️ ${modeLabel} started · ${timeLabel}`,
        body: `"${taskName}" — ${minsLabel}`,
        android: androidBase(FOCUS_RUNNING_CHANNEL_ID, {
          sound: 'default',
          vibrationPattern: [0, 220, 120, 220],
          autoCancel: true,
          onlyAlertOnce: false,
        }),
        ios: {sound: 'default'},
      });

      try {
        await notifee.displayNotification({
          id: 'focus-timer-running',
          title: `🎯 ${modeLabel} · ${timeLabel}`,
          body: `"${taskName}" in progress`,
          android: androidBase(FOCUS_RUNNING_CHANNEL_ID, {
            importance: AndroidImportance.DEFAULT,
            ongoing: true,
            autoCancel: false,
            onlyAlertOnce: true,
          }),
        });
      } catch (runErr) {
        console.log('[notifications] focus running error:', runErr);
      }

      const finishedTitle =
        mode === 'work' || mode === 'focus'
          ? '🎯 Focus Completed!'
          : '☕ Break Finished!';
      const finishedBody =
        mode === 'work' || mode === 'focus'
          ? `"${taskName}" · ${minsLabel} complete`
          : `Break over (${minsLabel})`;

      try {
        await notifee.createTriggerNotification(
          {
            id: 'focus-timer-completion',
            title: finishedTitle,
            body: finishedBody,
            android: androidBase(FOCUS_CHANNEL_ID, {
              sound: 'focus',
              vibrationPattern: [0, 400, 180, 400, 180, 400, 180, 500],
              autoCancel: true,
            }),
            ios: {sound: 'default'},
          },
          {
            type: TriggerType.TIMESTAMP,
            timestamp: endAt,
            alarmManager: {allowWhileIdle: true},
          },
        );
      } catch (triggerErr) {
        console.log('[notifications] focus trigger error:', triggerErr);
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

    playFocusSound(true, 5000);
    vibrateFocusComplete();

    const minsPart =
      durationMinutes != null ? ` · ${durationMinutes} min` : '';
    const title =
      mode === 'work' || mode === 'focus'
        ? '🎯 Focus Completed!'
        : '☕ Break Finished!';
    const body = taskTitle
      ? `"${taskTitle}"${minsPart} complete`
      : mode === 'work' || mode === 'focus'
      ? `Session complete${minsPart}`
      : `Break over${minsPart}`;

    try {
      await notifee.cancelNotification('focus-timer-running');
      await notifee.cancelNotification('focus-timer-start');
    } catch (_) {}

    if (_notificationsEnabled) {
      await showSystemNotification({
        id: `focus-done-${Date.now()}`,
        title,
        body,
        android: androidBase(FOCUS_CHANNEL_ID, {
          sound: 'focus',
          vibrationPattern: [0, 400, 180, 400, 180, 400, 180, 500],
          autoCancel: true,
        }),
        ios: {sound: 'default'},
      });
    }
  } catch (error) {
    console.log('[notifications] notifyFocusCompleted error:', error);
  }
}
