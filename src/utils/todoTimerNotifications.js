import {parseTaskDueDate} from './dateUtils';
import notifee, {
  AndroidImportance,
  TriggerType,
} from '@notifee/react-native';
import {Vibration, Platform} from 'react-native';
import Toast from 'react-native-toast-message';
import {
  playAlarmSound,
  playAlertSound,
  playFocusSound,
  stopSound,
} from '../services/soundService';

/* ============================================================ */
/*  CHANNEL IDS (v6: professional sound + vibration arrangement) */
/* ============================================================ */
export const TIMER_CHANNEL_ID = 'todo-timers-channel-v6';
export const TIMER_RUNNING_CHANNEL_ID = 'todo-timers-running-v6';
export const ALERT_CHANNEL_ID = 'todo-reminders-channel-v6';
export const FOCUS_CHANNEL_ID = 'pomodoro-focus-channel-v6';
export const FOCUS_RUNNING_CHANNEL_ID = 'pomodoro-running-channel-v6';

let channelsReady = false;
let _appNotificationsEnabled = true;
let _systemNotificationsEnabled = true;
let _notificationsEnabled = true;

function refreshNotificationEnabledState() {
  _notificationsEnabled = _appNotificationsEnabled && _systemNotificationsEnabled;
}

export function setNotificationsEnabled(enabled) {
  _appNotificationsEnabled = Boolean(enabled);
  refreshNotificationEnabledState();
}

export function setSystemNotificationsEnabled(enabled) {
  _systemNotificationsEnabled = Boolean(enabled);
  refreshNotificationEnabledState();
}

export function isNotificationsEnabled() {
  return _notificationsEnabled;
}

export async function cancelAllTodoNotifications() {
  try {
    await notifee.cancelAllNotifications();
    await notifee.cancelTriggerNotifications();
  } catch (error) {
    console.warn('[notifications] unable to cancel all pending notifications:', error);
  }
}

/* ============================================================ */
/*  PREPARE — Permission + Channels                             */
/* ============================================================ */
export async function prepareTodoTimerNotifications(force = false) {
  const shouldPrepareChannels = !channelsReady || force;

  try {
    const permissionSettings = shouldPrepareChannels
      ? await notifee.requestPermission()
      : typeof notifee.getNotificationSettings === 'function'
      ? await notifee.getNotificationSettings()
      : null;
    if (Number.isFinite(permissionSettings?.authorizationStatus)) {
      // Notifee uses positive values for authorised/provisional notification access.
      setSystemNotificationsEnabled(permissionSettings.authorizationStatus > 0);
    }

    if (!shouldPrepareChannels) return;

    if (Platform.OS === 'android') {
      // Clean up previous cached channels so Android OS resets settings
      try {
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
        ];
        for (const ch of oldChannels) {
          await notifee.deleteChannel(ch).catch(() => {});
        }
      } catch (_) {}

      // 1. Task Timer Finished Channel (3.5s ringing alarm + rhythmic timer vibration)
      await notifee.createChannel({
        id: TIMER_CHANNEL_ID,
        name: 'Todo Timer Finished',
        importance: AndroidImportance.HIGH,
        vibration: true,
        vibrationPattern: [0, 400, 200, 400, 200, 400, 200, 400],
        sound: 'alarm',
        lights: true,
        lightColor: '#F97316',
      });

      // 2. Timer Running Channel (Gentle confirmation banner)
      await notifee.createChannel({
        id: TIMER_RUNNING_CHANNEL_ID,
        name: 'Todo Timer Started',
        importance: AndroidImportance.HIGH,
        vibration: true,
        vibrationPattern: [100, 100],
        sound: 'default',
        lights: true,
        lightColor: '#F97316',
      });

      // 3. Alert / Reminder Channel (0.85s crisp chime + clean double vibration)
      await notifee.createChannel({
        id: ALERT_CHANNEL_ID,
        name: 'Todo Alerts & Reminders',
        importance: AndroidImportance.HIGH,
        vibration: true,
        vibrationPattern: [0, 200, 100, 200],
        sound: 'alert',
        lights: true,
        lightColor: '#3B82F6',
      });

      // 4. Focus Session Completed Channel (5.0s melodic celebration alarm + celebratory vibration)
      await notifee.createChannel({
        id: FOCUS_CHANNEL_ID,
        name: 'Focus Session Completed',
        importance: AndroidImportance.HIGH,
        vibration: true,
        vibrationPattern: [0, 500, 250, 500, 250, 500, 250, 500, 250, 500, 250, 500],
        sound: 'focus',
        lights: true,
        lightColor: '#6366F1',
      });

      // 5. Focus Running Channel (Gentle confirmation banner)
      await notifee.createChannel({
        id: FOCUS_RUNNING_CHANNEL_ID,
        name: 'Focus Timer Running',
        importance: AndroidImportance.HIGH,
        vibration: true,
        vibrationPattern: [100, 100],
        sound: 'default',
        lights: true,
        lightColor: '#6366F1',
      });

      channelsReady = true;
    } else {
      channelsReady = true;
    }
  } catch (error) {
    console.log('[notifications] prepare error:', error);
  }
}

/* ============================================================ */
/*  TIMER: SCHEDULE                                             */
/* ============================================================ */
export async function scheduleTodoTimer(todo, durationMinutes, showStartBanner = true, exactEndAt = null) {
  try {
    await prepareTodoTimerNotifications();

    if (!todo || !todo.id) {
      console.log('[notifications] schedule: invalid todo');
      return null;
    }

    const notificationId = `todo-timer-${todo.id}`;
    const endAt = Number.isFinite(exactEndAt) && exactEndAt > Date.now()
      ? exactEndAt
      : Date.now() + durationMinutes * 60 * 1000;

    await notifee.cancelTriggerNotification(notificationId);
    await notifee.cancelNotification(notificationId);

    if (!_notificationsEnabled) {
      return {
        timerEndAt: endAt,
        timerNotificationId: null,
      };
    }

    // 1. Immediate In-App & Upper Notification: Timer started banner (only when explicitly requested)
    if (showStartBanner) {
      try {
        Toast.show({
          type: 'info',
          position: 'top',
          text1: '⏱️ Timer Started',
          text2: `"${todo.title || 'Task'}" ke liye ${durationMinutes} min ka timer shuru hua.`,
          visibilityTime: 3500,
          autoHide: true,
          topOffset: 45,
          onPress: () => stopSound(),
        });

        await notifee.displayNotification({
          id: `todo-timer-start-${todo.id}`,
          title: '⏱️ Timer Started',
          body: `"${todo.title || 'Task'}" ke liye ${durationMinutes} min ka timer shuru hua.`,
          android: {
            channelId: TIMER_RUNNING_CHANNEL_ID,
            pressAction: {id: 'default'},
            smallIcon: 'ic_launcher',
            sound: 'default',
            vibrationPattern: [100, 100],
            importance: AndroidImportance.HIGH,
            autoCancel: true,
          },
          ios: {
            sound: 'default',
          },
        });
      } catch (startNotifErr) {
        console.log('[notifications] start banner error:', startNotifErr);
      }
    }

    // 2. Scheduled trigger for completion
    await notifee.createTriggerNotification(
      {
        id: notificationId,
        title: '⏱️ Timer Finished!',
        body: `"${todo.title || 'Task'}" ka timer complete ho gaya!`,
        android: {
          channelId: TIMER_CHANNEL_ID,
          pressAction: {id: 'default'},
          smallIcon: 'ic_launcher',
          sound: 'alarm',
          vibrationPattern: [0, 400, 200, 400, 200, 400, 200, 400],
          autoCancel: true,
          importance: AndroidImportance.HIGH,
        },
        ios: {
          sound: 'default',
        },
      },
      {
        type: TriggerType.TIMESTAMP,
        timestamp: endAt,
        alarmManager: {
          allowWhileIdle: true,
        },
      },
    );

    return {
      timerEndAt: endAt,
      timerNotificationId: notificationId,
    };
  } catch (error) {
    console.log('[notifications] schedule error:', error);
    return null;
  }
}

/* ============================================================ */
/*  TIMER: NOTIFY COMPLETION (Upper notification + Alarm sound) */
/* ============================================================ */
export async function notifyTimerCompleted(todo) {
  try {
    if (!todo) return;

    // 1. Play ringing alarm sound (3.5s auto-stop)
    playAlarmSound(true, 3500);

    // 2. Display In-App Top Banner (Toast)
    try {
      Toast.show({
        type: 'success',
        position: 'top',
        text1: '⏱️ Timer Finished!',
        text2: `"${todo.title || 'Task'}" ka timer pura ho gaya!`,
        visibilityTime: 4000,
        autoHide: true,
        topOffset: 45,
        onPress: () => stopSound(),
      });
    } catch (_) {}

    // 3. Display Upper Notification (Heads-up alert)
    await notifee.displayNotification({
      id: `todo-timer-done-${todo.id || Date.now()}`,
      title: '⏱️ Timer Finished!',
      body: `"${todo.title || 'Task'}" ka timer pura ho gaya!`,
      android: {
        channelId: TIMER_CHANNEL_ID,
        pressAction: {id: 'default'},
        smallIcon: 'ic_launcher',
        sound: 'alarm',
        vibrationPattern: [0, 400, 200, 400, 200, 400, 200, 400],
        autoCancel: true,
        importance: AndroidImportance.HIGH,
      },
      ios: {
        sound: 'default',
      },
    });
  } catch (error) {
    console.log('[notifications] notifyTimerCompleted error:', error);
  }
}

/* ============================================================ */
/*  TIMER: CANCEL                                               */
/* ============================================================ */
export async function cancelTodoTimer(todo, cancelDone = false) {
  try {
    if (!todo || !todo.id) return;

    const notificationId =
      todo.timerNotificationId || `todo-timer-${todo.id}`;

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

/* ============================================================ */
/*  VIBRATE NOW                                                 */
/* ============================================================ */
export function vibrateNow() {
  try {
    Vibration.vibrate([0, 300, 150, 300]);
  } catch (error) {
    console.log('[notifications] vibrate error:', error);
  }
}

/* ============================================================ */
/*  REMINDERS / ALERTS HELPER                                   */
/* ============================================================ */
export {parseTaskDueDate} from './dateUtils';

/**
 * Calculates reminder trigger timestamp.
 * Defaults to 9:00 AM on the due date.
 * If isManualToggle is true and time passed today, sets 15s test trigger.
 */
export function calculateReminderTimestamp(todo, isManualToggle = false) {
  const dateObj =
    Number.isFinite(todo?.dueDateTimestamp) && todo.dueDateTimestamp > 0
      ? parseTaskDueDate(todo.dueDateTimestamp)
      : parseTaskDueDate(todo?.dueDate);
  if (!dateObj) return null;

  const target = new Date(dateObj);
  // Default alert time: 9:00 AM
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
      if (isManualToggle) {
        return now + 15 * 1000;
      }
      return null;
    }
    return null;
  }

  return target.getTime();
}

/* ============================================================ */
/*  SCHEDULE REMINDER / ALERT                                   */
/* ============================================================ */
export async function scheduleTodoReminder(todo, isManualToggle = false) {
  try {
    if (!todo || !todo.id || !todo.reminder) return null;
    if (!_notificationsEnabled) return null;

    await prepareTodoTimerNotifications();

    const timestamp = calculateReminderTimestamp(todo, isManualToggle);
    if (!timestamp || timestamp <= Date.now()) {
      return null;
    }

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
          smallIcon: 'ic_launcher',
          sound: 'alert',
          vibrationPattern: [0, 200, 100, 200],
          autoCancel: true,
          importance: AndroidImportance.HIGH,
        },
        ios: {
          sound: 'default',
        },
      },
      {
        type: TriggerType.TIMESTAMP,
        timestamp,
        alarmManager: {
          allowWhileIdle: true,
        },
      },
    );

    return {
      reminderNotificationId: notificationId,
      reminderTimestamp: timestamp,
    };
  } catch (error) {
    console.log('[notifications] schedule reminder error:', error);
    return null;
  }
}

/* ============================================================ */
/*  CANCEL REMINDER / ALERT                                     */
/* ============================================================ */
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

/* ============================================================ */
/*  NOTIFY REMINDER ALERT (Foreground / live alert trigger)     */
/* ============================================================ */
export async function notifyReminderAlert(todo) {
  try {
    if (!todo) return;

    // 1. Play alert chime sound and gentle vibrate
    playAlertSound(true);

    // 2. In-App Banner (Toast)
    try {
      Toast.show({
        type: 'info',
        position: 'top',
        text1: '🔔 Task Alert & Reminder',
        text2: `"${todo.title || 'Task'}" is due today!`,
        visibilityTime: 4000,
        autoHide: true,
        topOffset: 45,
        onPress: () => stopSound(),
      });
    } catch (_) {}

    // 3. Display Upper Notification (Heads-up banner)
    await notifee.displayNotification({
      id: `todo-reminder-alert-${todo.id || Date.now()}`,
      title: '🔔 Task Alert & Reminder',
      body: `"${todo.title || 'Task'}" is due today!`,
      android: {
        channelId: ALERT_CHANNEL_ID,
        pressAction: {id: 'default'},
        smallIcon: 'ic_launcher',
        sound: 'alert',
        vibrationPattern: [0, 200, 100, 200],
        autoCancel: true,
        importance: AndroidImportance.HIGH,
      },
      ios: {
        sound: 'default',
      },
    });
  } catch (error) {
    console.log('[notifications] notifyReminderAlert error:', error);
  }
}

/* ============================================================ */
/*  RESCHEDULE — App restart पर active timers & reminders set   */
/* ============================================================ */
export async function rescheduleActiveTimers(tasks) {
  if (!Array.isArray(tasks) || tasks.length === 0) return;

  const now = Date.now();

  for (const task of tasks) {
    if (task.timerEndAt && task.timerEndAt > now) {
      const millisecondsLeft = task.timerEndAt - now;
      if (millisecondsLeft > 0) {
        try {
          // Pass showStartBanner = false so app restart does NOT fire an extra "Timer Started" Toast/banner
          await scheduleTodoTimer(task, millisecondsLeft / 60000, false, task.timerEndAt);
        } catch (error) {
          console.log('[notifications] reschedule timer error:', error);
        }
      }
    }
  }
}

export async function rescheduleAllReminders(tasks) {
  if (!Array.isArray(tasks) || tasks.length === 0) return [];

  const results = [];
  for (const task of tasks) {
    if (!task?.reminder || task.completed || task.deleted) continue;

    let result = null;
    try {
      // Past or invalid reminders return null; expose that result so callers
      // don't keep showing a reminder as enabled when it is no longer scheduled.
      result = await scheduleTodoReminder(task, false);
    } catch (error) {
      console.log('[notifications] reschedule reminder error:', error);
    }
    results.push({id: task.id, result});
  }
  return results;
}

/* ============================================================ */
/*  POMODORO / FOCUS TIMER NOTIFICATIONS                        */
/* ============================================================ */
export async function scheduleFocusTimerNotification({
  mode = 'work',
  durationMinutes = 25,
  secondsLeft = null,
  taskTitle = null,
}) {
  try {
    await prepareTodoTimerNotifications();

    const actualSec = secondsLeft !== null ? secondsLeft : durationMinutes * 60;
    const endAt = Date.now() + actualSec * 1000;
    const taskName = taskTitle || (mode === 'work' ? 'Focus' : 'Break');

    await notifee.cancelTriggerNotification('focus-timer-completion');
    await notifee.cancelNotification('focus-timer-completion');
    await notifee.cancelNotification('focus-timer-start');
    await notifee.cancelTriggerNotification('pomodoro-focus-completion');
    await notifee.cancelNotification('pomodoro-focus-completion');
    await notifee.cancelNotification('pomodoro-active-banner');

    const startTitle = '⏱️ Timer Started';
    const startBody = `"${taskName}" ke liye ${durationMinutes} min ka timer shuru hua.`;

    // 1. Immediate Upper Notification: Timer started banner
    try {
      await notifee.displayNotification({
        id: 'focus-timer-start',
        title: startTitle,
        body: startBody,
        android: {
          channelId: FOCUS_RUNNING_CHANNEL_ID,
          pressAction: {id: 'default'},
          smallIcon: 'ic_launcher',
          sound: 'default',
          vibrationPattern: [100, 100],
          importance: AndroidImportance.HIGH,
          autoCancel: true,
        },
        ios: {sound: 'default'},
      });
    } catch (bannerErr) {
      console.log('[notifications] focus start banner error:', bannerErr);
    }

    // 2. Scheduled Trigger for completion
    const finishedTitle = mode === 'work' ? '🎯 Focus Completed!' : '☕ Break Finished!';
    const finishedBody = mode === 'work'
      ? `Great job! "${taskName}" session complete ho gaya.`
      : `Break over! Ready for another focus round?`;

    await notifee.createTriggerNotification(
      {
        id: 'focus-timer-completion',
        title: finishedTitle,
        body: finishedBody,
        android: {
          channelId: FOCUS_CHANNEL_ID,
          pressAction: {id: 'default'},
          smallIcon: 'ic_launcher',
          sound: mode === 'work' ? 'focus' : 'alarm',
          vibrationPattern: mode === 'work'
            ? [0, 500, 250, 500, 250, 500, 250, 500, 250, 500, 250, 500]
            : [0, 400, 200, 400, 200, 400],
          autoCancel: true,
          importance: AndroidImportance.HIGH,
        },
        ios: {sound: 'default'},
      },
      {
        type: TriggerType.TIMESTAMP,
        timestamp: endAt,
        alarmManager: {allowWhileIdle: true},
      },
    );
  } catch (error) {
    console.log('[notifications] scheduleFocusTimer error:', error);
  }
}

export async function cancelFocusTimerNotification(stopSounds = true) {
  try {
    await notifee.cancelTriggerNotification('focus-timer-completion');
    await notifee.cancelNotification('focus-timer-completion');
    await notifee.cancelNotification('focus-timer-start');
    await notifee.cancelTriggerNotification('pomodoro-focus-completion');
    await notifee.cancelNotification('pomodoro-focus-completion');
    await notifee.cancelNotification('pomodoro-active-banner');
    if (stopSounds) {
      stopSound();
    }
  } catch (error) {
    console.log('[notifications] cancelFocusTimer error:', error);
  }
}

export async function notifyFocusCompleted({
  mode = 'work',
  durationMinutes = 25,
  taskTitle = null,
  soundEnabled = true,
  vibrateEnabled = true,
  notificationEnabled = true,
} = {}) {
  try {
    const taskName = taskTitle || (mode === 'work' ? 'Focus' : 'Break');

    // 1. Play sound and vibrate according to user preferences
    if (soundEnabled) {
      if (mode === 'work') {
        playFocusSound(vibrateEnabled, 5000);
      } else {
        playAlarmSound(vibrateEnabled, 2500);
      }
    } else if (vibrateEnabled) {
      if (mode === 'work') {
        Vibration.vibrate([0, 500, 250, 500, 250, 500, 250, 500, 250, 500, 250, 500]);
      } else {
        Vibration.vibrate([0, 400, 200, 400, 200, 400]);
      }
    }

    // 2. In-App Banner (Toast)
    const finishedTitle = mode === 'work' ? '🎯 Focus Completed!' : '☕ Break Finished!';
    const finishedBody = mode === 'work'
      ? `Great job! "${taskName}" session complete ho gaya.`
      : `Break over! Ready for another focus round?`;

    if (notificationEnabled) {
      try {
        Toast.show({
          type: 'success',
          position: 'top',
          text1: finishedTitle,
          text2: finishedBody,
          visibilityTime: 5000,
          autoHide: true,
          topOffset: 45,
          onPress: () => stopSound(),
        });
      } catch (_) {}
    }

    // 3. Cancel running banner and pending trigger
    await notifee.cancelNotification('focus-timer-start');
    await notifee.cancelNotification('pomodoro-active-banner');
    await notifee.cancelTriggerNotification('focus-timer-completion');
    await notifee.cancelTriggerNotification('pomodoro-focus-completion');

    // 4. DISPLAY UPPER NOTIFICATION
    if (notificationEnabled) {
      await notifee.displayNotification({
        id: `focus-timer-done-${Date.now()}`,
        title: finishedTitle,
        body: finishedBody,
        android: {
          channelId: FOCUS_CHANNEL_ID,
          pressAction: {id: 'default'},
          smallIcon: 'ic_launcher',
          sound: mode === 'work' ? 'focus' : 'alarm',
          vibrationPattern: mode === 'work'
            ? [0, 500, 250, 500, 250, 500, 250, 500, 250, 500, 250, 500]
            : [0, 400, 200, 400, 200, 400],
          autoCancel: true,
          importance: AndroidImportance.HIGH,
        },
        ios: {sound: 'default'},
      });
    }
  } catch (error) {
    console.log('[notifications] notifyFocusCompleted error:', error);
  }
}

/* ============================================================ */
/*  CANCEL ALL                                                  */
/* ============================================================ */
export async function cancelAllTimers(tasks) {
  if (!Array.isArray(tasks)) return;

  for (const task of tasks) {
    if (task.timerEndAt || task.timerNotificationId) {
      await cancelTodoTimer(task);
    }
    if (task.reminder) {
      await cancelTodoReminder(task);
    }
  }
  await cancelFocusTimerNotification();
}