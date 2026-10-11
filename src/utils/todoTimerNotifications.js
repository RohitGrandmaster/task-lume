
import notifee, {
  AndroidImportance,
  TriggerType,
} from '@notifee/react-native';

const CHANNEL_ID = 'todo-timers';

export async function prepareTodoTimerNotifications() {
  await notifee.requestPermission();

  await notifee.createChannel({
    id: CHANNEL_ID,
    name: 'Todo timers',
    importance: AndroidImportance.HIGH,
  });
}

export async function scheduleTodoTimer(todo, durationMinutes) {
  await prepareTodoTimerNotifications();

  const notificationId = `todo-timer-${todo.id}`;
  const endAt = Date.now() + durationMinutes * 60 * 1000;

  await notifee.cancelNotification(notificationId);

  await notifee.createTriggerNotification(
    {
      id: notificationId,
      title: 'Todo timer finished',
      body: `"${todo.title}" ka timer complete ho gaya.`,
      android: {
        channelId: CHANNEL_ID,
        pressAction: {id: 'default'},
      },
    },
    {
      type: TriggerType.TIMESTAMP,
      timestamp: endAt,
    },
  );

  return {
    timerEndAt: endAt,
    timerNotificationId: notificationId,
  };
}

export async function cancelTodoTimer(todo) {
  const notificationId =
    todo.timerNotificationId || `todo-timer-${todo.id}`;

  await notifee.cancelNotification(notificationId);
}
