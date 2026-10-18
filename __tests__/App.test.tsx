/**
 * @format
 */

import React from 'react';
import ReactTestRenderer from 'react-test-renderer';

jest.mock('@notifee/react-native', () => {
  const notifee = {
    requestPermission: jest.fn(async () => ({authorizationStatus: 1})),
    deleteChannel: jest.fn(async () => undefined),
    createChannel: jest.fn(async ({id}) => id),
    cancelTriggerNotification: jest.fn(async () => undefined),
    cancelNotification: jest.fn(async () => undefined),
    displayNotification: jest.fn(async () => undefined),
    createTriggerNotification: jest.fn(async ({id}) => id),
    onForegroundEvent: jest.fn(() => jest.fn()),
    onBackgroundEvent: jest.fn(),
  };
  return {
    __esModule: true,
    default: notifee,
    EventType: {DELIVERED: 3, PRESS: 1, ACTION_PRESS: 2},
    AndroidImportance: {HIGH: 4, DEFAULT: 3},
    TriggerType: {TIMESTAMP: 0},
  };
});

import App from '../App';

test('renders correctly', async () => {
  let renderer;
  await ReactTestRenderer.act(async () => {
    renderer = ReactTestRenderer.create(<App />);
  });
  expect(renderer.toJSON()).toBeTruthy();
});
