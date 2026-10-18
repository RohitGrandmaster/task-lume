/**
 * @format
 *
 * App-shell smoke test. Native service integrations are mocked so this test
 * can run in a Linux/Jest environment without native iOS/Android modules.
 */

import React from 'react';
import ReactTestRenderer from 'react-test-renderer';

jest.mock('@notifee/react-native', () => ({
  __esModule: true,
  default: {
    onForegroundEvent: jest.fn(() => jest.fn()),
    requestPermission: jest.fn(async () => ({authorizationStatus: 1})),
  },
  EventType: {DELIVERED: 3, PRESS: 1, DISMISSED: 2, ACTION_PRESS: 4},
}));

jest.mock('react-native-toast-message', () => ({
  __esModule: true,
  default: () => null,
}));

jest.mock('../src/utils/todoTimerNotifications', () => ({
  prepareTodoTimerNotifications: jest.fn(async () => undefined),
}));

jest.mock('../src/services/soundService', () => ({
  initSoundService: jest.fn(async () => undefined),
  playAlarmSound: jest.fn(),
  playAlertSound: jest.fn(),
  playFocusSound: jest.fn(),
  stopSound: jest.fn(),
}));

jest.mock('../src/navigation/RootNavigator', () => ({
  __esModule: true,
  default: () => null,
}));

jest.mock('../src/components/common/LockScreen', () => ({
  __esModule: true,
  default: () => null,
}));

jest.mock('../src/context/AuthContext', () => ({
  AuthProvider: ({children}) => children,
}));

jest.mock('../src/context/TodoContext', () => ({
  TodoProvider: ({children}) => children,
}));

jest.mock('../src/context/NotesContext', () => ({
  NotesProvider: ({children}) => children,
}));

jest.mock('../src/context/ThemeContext', () => ({
  ThemeProvider: ({children}) => children,
}));

jest.mock('../src/context/SettingsContext', () => ({
  SettingsProvider: ({children}) => children,
}));

jest.mock('../src/context/AppLockContext', () => ({
  AppLockProvider: ({children}) => children,
}));

import App from '../App';

test('renders the application provider shell', async () => {
  let renderer;
  await ReactTestRenderer.act(async () => {
    renderer = ReactTestRenderer.create(<App />);
  });

  expect(renderer.toJSON()).toBeTruthy();
  await ReactTestRenderer.act(async () => {
    renderer.unmount();
  });
});
