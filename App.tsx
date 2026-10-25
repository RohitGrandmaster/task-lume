import React from 'react';

import {
  SafeAreaProvider,
} from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import notifee, {EventType} from '@notifee/react-native';

import {
  AuthProvider,
} from './src/context/AuthContext';

import {
  TodoProvider,
} from './src/context/TodoContext';

import {
  ThemeProvider,
} from './src/context/ThemeContext';

import {
  SettingsProvider,
} from './src/context/SettingsContext';

import RootNavigator from './src/core/navigation/RootNavigator';
import { I18nProvider } from './src/core/i18n/useTranslation';

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
import LockScreen from './src/core/ui/LockScreen';
import ErrorBoundary from './src/core/ui/ErrorBoundary';

import {
  ThemeProvider as CoreThemeProvider,
} from './src/core/theme/ThemeProvider';

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

        if (!isStartOrRunning && !isDoneBanner) {
          if (notifId.startsWith('todo-timer') && !notifId.includes('start') && !notifId.includes('running')) {
            playAlarmSound(true, 5000);
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
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ErrorBoundary>
        <SafeAreaProvider>
          <CoreThemeProvider>
            <I18nProvider>
              <ThemeProvider>
              <SettingsProvider>
                <AppLockProvider>
                  <AuthProvider>
                    <TodoProvider>
                      <RootNavigator />
                      <LockScreen />
                      <Toast />
                    </TodoProvider>
                  </AuthProvider>
                </AppLockProvider>
              </SettingsProvider>
              </ThemeProvider>
            </I18nProvider>
          </CoreThemeProvider>
        </SafeAreaProvider>
      </ErrorBoundary>
    </GestureHandlerRootView>
  );
}

export default App;
