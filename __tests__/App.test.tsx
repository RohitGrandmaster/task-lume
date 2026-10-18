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

jest.mock('@react-native-async-storage/async-storage', () => ({
  __esModule: true,
  default: {
    getItem: jest.fn(async () => null),
    setItem: jest.fn(async () => undefined),
    removeItem: jest.fn(async () => undefined),
    clear: jest.fn(async () => undefined),
    getAllKeys: jest.fn(async () => []),
    multiGet: jest.fn(async () => []),
    multiSet: jest.fn(async () => undefined),
    multiRemove: jest.fn(async () => undefined),
    mergeItem: jest.fn(async () => undefined),
  },
}));

jest.mock('react-native-keychain', () => ({
  __esModule: true,
  ACCESS_CONTROL: {BIOMETRY_ANY_OR_DEVICE_PASSCODE: 'biometryOrPasscode'},
  getGenericPassword: jest.fn(async () => false),
  setGenericPassword: jest.fn(async () => ({service: 'test'})),
  resetGenericPassword: jest.fn(async () => true),
  getSupportedBiometryType: jest.fn(async () => null),
}));

jest.mock('react-native-fs', () => ({
  __esModule: true,
  default: {
    DocumentDirectoryPath: '/tmp/tasklume-test',
    exists: jest.fn(async () => true),
    mkdir: jest.fn(async () => undefined),
    stat: jest.fn(async () => ({size: 1})),
    writeFile: jest.fn(async () => undefined),
    unlink: jest.fn(async () => undefined),
  },
}));

jest.mock('react-native-haptic-feedback', () => ({
  __esModule: true,
  default: {trigger: jest.fn()},
}));

jest.mock('react-native-sound', () => {
  const Sound = jest.fn((name, bundle, callback) => {
    const instance = {
      stop: jest.fn(callbackFn => callbackFn?.()),
      setCurrentTime: jest.fn(),
      setVolume: jest.fn(),
      setNumberOfLoops: jest.fn(),
      play: jest.fn(callbackFn => callbackFn?.(true)),
      reset: jest.fn(),
      release: jest.fn(),
    };
    Promise.resolve().then(() => callback?.(null));
    return instance;
  });
  Sound.MAIN_BUNDLE = 'main';
  Sound.setCategory = jest.fn();
  return {__esModule: true, default: Sound};
});

jest.mock('@react-native-voice/voice', () => ({
  __esModule: true,
  default: {
    start: jest.fn(async () => undefined),
    stop: jest.fn(async () => undefined),
    destroy: jest.fn(async () => undefined),
    removeAllListeners: jest.fn(),
  },
}));

jest.mock('react-native-nitro-sound', () => ({
  __esModule: true,
  default: {
    stopRecorder: jest.fn(async () => undefined),
    removeRecordBackListener: jest.fn(),
    stopPlayer: jest.fn(async () => undefined),
    removePlayBackListener: jest.fn(),
    removePlaybackEndListener: jest.fn(),
    startRecorder: jest.fn(async () => '/tmp/tasklume-test/memo.m4a'),
    addRecordBackListener: jest.fn(),
    startPlayer: jest.fn(async () => undefined),
    addPlayBackListener: jest.fn(),
    addPlaybackEndListener: jest.fn(),
    pausePlayer: jest.fn(async () => undefined),
    resumePlayer: jest.fn(async () => undefined),
    seekToPlayer: jest.fn(async () => undefined),
    setVolume: jest.fn(async () => undefined),
  },
  AudioEncoderAndroidType: {AAC: 3},
  AudioSourceAndroidType: {MIC: 1},
  OutputFormatAndroidType: {MPEG_4: 2},
  AVEncoderAudioQualityIOSType: {high: 0x60},
}));

import App from '../App';

test('renders correctly', async () => {
  let renderer;
  await ReactTestRenderer.act(async () => {
    renderer = ReactTestRenderer.create(<App />);
  });
  expect(renderer.toJSON()).toBeTruthy();
});
