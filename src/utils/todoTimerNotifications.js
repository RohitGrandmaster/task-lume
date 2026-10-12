import notifee, {
  AndroidImportance,
  TriggerType,
} from '@notifee/react-native';
import {Vibration, Platform} from 'react-native';
import {playAlarmSound, playAlertSound, stopSound} from '../services/soundService';

/* ============================================================ */
/*  CHANNEL IDS                                                 */
/* ============================================================ */
export const TIMER_CHANNEL_ID = 'todo-timers-channel-v2';
export const ALERT_CHANNEL_ID = 'todo-reminders-channel-v2';
export const FOCUS_CHANNEL_ID = 'pomodoro-focus-channel-v2';

/* ============================================================ */
/*  PREPARE — Permission + Channels                             */
/* ============================================================ */
export async function prepareTodoTimerNotifications() {
  try {
    await notifee.requestPermission();

    if (Platform.OS === 'android') {
      // 1. Timer Channel (High Importance heads-up banner)
      await notifee.createChannel({
        id: TIMER_CHANNEL_ID,
        name: 'Todo Timers & Countdown',
        importance: AndroidImportance.HIGH,
        vibration: true,
        vibrationPattern: [300, 400, 200, 400, 200, 500],
        sound: 'alarm',
        lights: true,
        lightColor: '#F97316',
      });

      // 2. Alert / Reminder Channel (High Importance heads-up banner)
      await notifee.createChannel({
        id: ALERT_CHANNEL_ID,
        name: 'Todo Alerts & Reminders',
        importance: AndroidImportance.HIGH,
        vibration: true,
        vibrationPattern: [300, 300, 200, 400],
        sound: 'alert',
        lights: true,
        lightColor: '#3B82F6',
      });

      // 3. Focus / Pomodoro Channel (High Importance heads-up banner)
      await notifee.createChannel({
        id: FOCUS_CHANNEL_ID,
        name: 'Focus & Pomodoro Timers',
        importance: AndroidImportance.HIGH,
        vibration: true,
        vibrationPattern: [400, 300, 400, 300, 600],
        sound: 'alarm',
        lights: true,
        lightColor: '#6366F1',
      });
    }
  } catch (error) {
    console.log('[notifications] prepare error:', error);
  }
}

/* ============================================================ */
/*  TIMER: SCHEDULE                                             */
/* ============================================================ */
export async function scheduleTodoTimer(todo, durationMinutes) {
  try {
    await prepareTodoTimerNotifications();

    if (!todo || !todo.id) {
      console.log('[notifications] schedule: invalid todo');
      return null;
    }

    const notificationId = `todo-timer-${todo.id}`;
    const endAt = Date.now() + durationMinutes * 60 * 1000;

    await notifee.cancelTriggerNotification(notificationId);
    await notifee.cancelNotification(notificationId);

    // 1. Immediate Upper Notification: Timer started banner
    try {
      await notifee.displayNotification({
        id: `todo-timer-start-${todo.id}`,
        title: '⏱️ Timer Started',
        body: `"${todo.title || 'Task'}" ke liye ${durationMinutes} min ka timer shuru hua.`,
        android: {
          channelId: TIMER_CHANNEL_ID,
          pressAction: {id: 'default'},
          smallIcon: 'ic_launcher',
          sound: 'default',
          vibrationPattern: [150, 150],
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
          vibrationPattern: [300, 400, 200, 400, 200, 600],
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

    // 1. Play alarm ring chime and vibrate
    playAlarmSound(true);

    // 2. Display Upper Notification (Heads-up alert)
    await notifee.displayNotification({
      id: `todo-timer-done-${todo.id || Date.now()}`,
      title: '⏱️ Timer Finished!',
      body: `"${todo.title || 'Task'}" ka timer pura ho gaya!`,
      android: {
        channelId: TIMER_CHANNEL_ID,
        pressAction: {id: 'default'},
        smallIcon: 'ic_launcher',
        sound: 'alarm',
        vibrationPattern: [300, 400, 200, 400, 200, 600],
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
export async function cancelTodoTimer(todo) {
  try {
    if (!todo || !todo.id) return;

    const notificationId =
      todo.timerNotificationId || `todo-timer-${todo.id}`;

    await notifee.cancelTriggerNotification(notificationId);
    await notifee.cancelNotification(notificationId);
    await notifee.cancelNotification(`todo-timer-start-${todo.id}`);
    await notifee.cancelNotification(`todo-timer-done-${todo.id}`);
  } catch (error) {
    console.log('[notifications] cancel error:', error);
  }
}

/* ============================================================ */
/*  VIBRATE NOW                                                 */
/* ============================================================ */
export function vibrateNow() {
  try {
    Vibration.vibrate([0, 400, 200, 400, 200, 500]);
  } catch (error) {
    console.log('[notifications] vibrate error:', error);
  }
}

/* ============================================================ */
/*  REMINDERS / ALERTS HELPER                                   */
/* ============================================================ */
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

/**
 * Calculates reminder trigger timestamp.
 * Defaults to 9:00 AM on the due date.
 * If due today and 9:00 AM has passed, schedules in 10 seconds or immediate.
 */
export function calculateReminderTimestamp(todo) {
  const dateObj = parseTaskDueDate(todo.dueDate);
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
    // If today and time has passed, fire in 10 seconds so the alert can be tested/seen
    const isToday =
      dateObj.getFullYear() === new Date().getFullYear() &&
      dateObj.getMonth() === new Date().getMonth() &&
      dateObj.getDate() === new Date().getDate();

    if (isToday) {
      return now + 10 * 1000;
    }
    // Past date (overdue)
    return null;
  }

  return target.getTime();
}

/* ============================================================ */
/*  SCHEDULE REMINDER / ALERT                                   */
/* ============================================================ */
export async function scheduleTodoReminder(todo) {
  try {
    if (!todo || !todo.id || !todo.reminder) return null;

    await prepareTodoTimerNotifications();

    const timestamp = calculateReminderTimestamp(todo);
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
          vibrationPattern: [300, 300, 200, 400],
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

    // 1. Play alert chime sound and vibrate
    playAlertSound(true);

    // 2. Display Upper Notification (Heads-up banner)
    await notifee.displayNotification({
      id: `todo-reminder-alert-${todo.id || Date.now()}`,
      title: '🔔 Task Alert & Reminder',
      body: `"${todo.title || 'Task'}" is due today!`,
      android: {
        channelId: ALERT_CHANNEL_ID,
        pressAction: {id: 'default'},
        smallIcon: 'ic_launcher',
        sound: 'alert',
        vibrationPattern: [300, 300, 200, 400],
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
      const minutesLeft = Math.ceil((task.timerEndAt - now) / 60000);
      if (minutesLeft > 0) {
        try {
          await scheduleTodoTimer(task, minutesLeft);
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
        await scheduleTodoReminder(task);
      } catch (error) {
        console.log('[notifications] reschedule reminder error:', error);
      }
    }
  }
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

    await notifee.cancelTriggerNotification('pomodoro-focus-completion');
    await notifee.cancelNotification('pomodoro-focus-completion');
    await notifee.cancelNotification('pomodoro-active-banner');

    // 1. Immediate Upper Notification: Active status banner
    try {
      await notifee.displayNotification({
        id: 'pomodoro-active-banner',
        title: mode === 'work' ? '🎯 Focus Timer Running' : '☕ Break Timer Running',
        body:
          mode === 'work'
            ? `${taskTitle ? `"${taskTitle}" • ` : ''}${durationMinutes} min focus session in progress.`
            : `${durationMinutes} min break session in progress.`,
        android: {
          channelId: FOCUS_CHANNEL_ID,
          pressAction: {id: 'default'},
          smallIcon: 'ic_launcher',
          sound: 'default',
          importance: AndroidImportance.DEFAULT,
          autoCancel: true,
        },
        ios: {sound: 'default'},
      });
    } catch (bannerErr) {
      console.log('[notifications] focus banner error:', bannerErr);
    }

    // 2. Scheduled Trigger for completion
    await notifee.createTriggerNotification(
      {
        id: 'pomodoro-focus-completion',
        title: mode === 'work' ? '🎯 Focus Session Complete!' : '☕ Break Finished!',
        body:
          mode === 'work'
            ? `${taskTitle ? `"${taskTitle}" • ` : ''}Great job! Your ${durationMinutes} min focus session is done.`
            : 'Break is over! Time to get back into focus.',
        android: {
          channelId: FOCUS_CHANNEL_ID,
          pressAction: {id: 'default'},
          smallIcon: 'ic_launcher',
          sound: 'alarm',
          vibrationPattern: [400, 300, 400, 300, 600],
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

export async function cancelFocusTimerNotification() {
  try {
    await notifee.cancelTriggerNotification('pomodoro-focus-completion');
    await notifee.cancelNotification('pomodoro-focus-completion');
    await notifee.cancelNotification('pomodoro-active-banner');
    stopSound();
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
    // 1. Play Alarm Sound
    if (soundEnabled) {
      if (mode === 'work') {
        playAlarmSound(vibrateEnabled);
      } else {
        playAlertSound(vibrateEnabled);
      }
    } else if (vibrateEnabled) {
      Vibration.vibrate([0, 400, 250, 400, 250, 600]);
    }

    // 2. Clear background trigger & banner
    await notifee.cancelNotification('pomodoro-active-banner');
    await notifee.cancelTriggerNotification('pomodoro-focus-completion');

    // 3. Display Upper Notification (Heads-up alert)
    if (notificationEnabled) {
      await notifee.displayNotification({
        id: `pomodoro-done-${Date.now()}`,
        title: mode === 'work' ? '🎯 Focus Session Complete!' : '☕ Break Finished!',
        body:
          mode === 'work'
            ? `${taskTitle ? `"${taskTitle}" • ` : ''}Your ${durationMinutes} min focus session is complete!`
            : 'Break time is over! Ready for the next focus session?',
        android: {
          channelId: FOCUS_CHANNEL_ID,
          pressAction: {id: 'default'},
          smallIcon: 'ic_launcher',
          sound: 'alarm',
          vibrationPattern: [400, 300, 400, 300, 600],
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