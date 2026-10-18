import 'react-native-gesture-handler';

import {AppRegistry, LogBox} from 'react-native';
import notifee, {EventType} from '@notifee/react-native';

import App from './App';
import {name as appName} from './app.json';
import {stopSound} from './src/services/soundService';

// Ignore harmless New Architecture & Reanimated warnings
LogBox.ignoreLogs([
  'setLayoutAnimationEnabledExperimental is currently a no-op',
  '[Reanimated] Dependencies should only be used on the web',
]);

/* ============================================================ */
/*  NOTIFEE BACKGROUND EVENT HANDLER                            */
/*  Registered at the root level before React components mount  */
/* ============================================================ */
notifee.onBackgroundEvent(async ({type, detail}) => {
  const {notification} = detail;

  if (
    type === EventType.PRESS ||
    type === EventType.DISMISSED ||
    type === EventType.ACTION_PRESS
  ) {
    try {
      stopSound();
    } catch (_) {}
  }
});

AppRegistry.registerComponent(appName, () => App);