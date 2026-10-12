import 'react-native-gesture-handler';

import {AppRegistry, LogBox} from 'react-native';

import App from './App';

import {name as appName} from './app.json';

// Ignore harmless New Architecture & Reanimated warnings
LogBox.ignoreLogs([
  'setLayoutAnimationEnabledExperimental is currently a no-op',
  '[Reanimated] Dependencies should only be used on the web',
]);

AppRegistry.registerComponent(appName, () => App);