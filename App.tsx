import React from 'react';

import {
  SafeAreaProvider,
} from 'react-native-safe-area-context';

import notifee, {EventType} from '@notifee/react-native';

import {
  AuthProvider,
} from './src/context/AuthContext';

import {
  TodoProvider,
} from './src/context/TodoContext';

import {
  NotesProvider,
} from './src/context/NotesContext';

import {
  ThemeProvider,
} from './src/context/ThemeContext';

import {
  SettingsProvider,
} from './src/context/SettingsContext';

import RootNavigator from './src/navigation/RootNavigator';

import {
  prepareTodoTimerNotifications,
} from './src/utils/todoTimerNotifications';
import {
  initSoundService,
  playAlarmSound,
  playAlertSound,
  stopSound,
} from './src/services/soundService';

import Toast from 'react-native-toast-message';

import {
  AppLockProvider,
} from './src/context/AppLockContext';
import LockScreen from './src/components/common/LockScreen';
import ErrorBoundary from './src/components/common/ErrorBoundary';

/* ============================================================ */
/*  APP COMPONENT                                               */
/* ============================================================ */
function App() {
  React.useEffect(() => {
    initSoundService().catch(() => {});
    prepareTodoTimerNotifications().catch(() => {});

    // Foreground notification sound + vibration trigger
    const unsubscribe = notifee.onForegroundEvent(({type, detail}) => {
      if (type === EventType.DELIVERED) {
        const notif = detail.notification;
        const notifId = String(notif?.id || '');
        const isStartOrRunning =
          notifId.includes('start') || notifId.includes('running');
        const isDoneBanner =
          notifId.includes('done') || notifId.includes('alert');

        // Only play sound for trigger completions delivered in foreground,
        // preventing duplicate audio if an in-app banner or running banner is displayed
        if (!isStartOrRunning && !isDoneBanner) {
          if (notifId.startsWith('todo-timer') && !notifId.includes('start') && !notifId.includes('running')) {
            playAlarmSound(true, 3500);
          } else if (
            notifId === 'focus-timer-completion' ||
            notifId === 'pomodoro-focus-completion'
          ) {
            playAlarmSound(true, 3000);
          } else if (notifId.startsWith('todo-reminder')) {
            playAlertSound(true);
          }
        }
      } else if (
        type === EventType.PRESS ||
        type === EventType.DISMISSED ||
        type === EventType.ACTION_PRESS
      ) {
        stopSound();
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <ErrorBoundary>
      <SafeAreaProvider>
        <ThemeProvider>
          <SettingsProvider>
            <AppLockProvider>
              <AuthProvider>
                <TodoProvider>
                  <NotesProvider>
                    <RootNavigator />
                    <LockScreen />
                    <Toast />
                  </NotesProvider>
                </TodoProvider>
              </AuthProvider>
            </AppLockProvider>
          </SettingsProvider>
        </ThemeProvider>
      </SafeAreaProvider>
    </ErrorBoundary>
  );
}

export default App;
