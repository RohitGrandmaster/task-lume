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
  ThemeProvider,
} from './src/context/ThemeContext';

import RootNavigator from './src/navigation/RootNavigator';

import {
  prepareTodoTimerNotifications,
} from './src/utils/todoTimerNotifications';
import {
  initSoundService,
  playAlarmSound,
  playAlertSound,
} from './src/services/soundService';

/* ============================================================ */
/*  NOTIFEE BACKGROUND EVENT HANDLER                            */
/*  ⚠️ यह App component के बाहर होना ज़रूरी है                  */
/*  App बंद होने पर भी notification events यहाँ आते हैं         */
/* ============================================================ */
notifee.onBackgroundEvent(async ({type, detail}) => {
  const {notification} = detail;

  if (type === EventType.PRESS) {
    console.log('[bg] Notification pressed:', notification?.id);
  }

  if (type === EventType.DISMISSED) {
    console.log('[bg] Notification dismissed:', notification?.id);
  }
});

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
        if (
          notif?.id?.startsWith('todo-timer') &&
          !notif?.id?.includes('start')
        ) {
          playAlarmSound(true);
        } else if (notif?.id?.startsWith('todo-reminder')) {
          playAlertSound(true);
        }
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <AppLockProvider>
          <AuthProvider>
            <TodoProvider>
              <RootNavigator />
              <LockScreen />
            </TodoProvider>
          </AuthProvider>
        </AppLockProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

export default App;