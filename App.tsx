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
  playFocusSound,
  stopSound,
} from './src/services/soundService';

import Toast from 'react-native-toast-message';

import {
  AppLockProvider,
} from './src/context/AppLockContext';
import LockScreen from './src/components/common/LockScreen';

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
        const isStartBanner = notif?.id?.includes('start');
        const isDoneBanner =
          notif?.id?.includes('done') || notif?.id?.includes('alert');

        // Only play sound for background trigger completions delivered in foreground,
        // preventing duplicate audio if an in-app banner already triggered playback
        if (!isStartBanner && !isDoneBanner) {
          if (notif?.id?.startsWith('todo-timer')) {
            playAlarmSound(true, 3500);
          } else if (
            notif?.id?.startsWith('focus-timer') ||
            notif?.id?.startsWith('pomodoro-done') ||
            notif?.id === 'pomodoro-focus-completion'
          ) {
            playFocusSound(true, 5000);
          } else if (notif?.id?.startsWith('todo-reminder')) {
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
  );
}

export default App;