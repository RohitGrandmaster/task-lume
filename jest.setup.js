/* eslint-disable no-undef */
// Jest setup for React Native environment

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => {
  const store = {};
  return {
    getItem: jest.fn(key => Promise.resolve(store[key] || null)),
    setItem: jest.fn((key, value) => {
      store[key] = String(value);
      return Promise.resolve(true);
    }),
    removeItem: jest.fn(key => {
      delete store[key];
      return Promise.resolve(true);
    }),
    clear: jest.fn(() => {
      Object.keys(store).forEach(k => delete store[k]);
      return Promise.resolve(true);
    }),
    getAllKeys: jest.fn(() => Promise.resolve(Object.keys(store))),
    multiGet: jest.fn(keys =>
      Promise.resolve(keys.map(k => [k, store[k] || null])),
    ),
    multiSet: jest.fn(pairs => {
      pairs.forEach(([k, v]) => {
        store[k] = String(v);
      });
      return Promise.resolve(true);
    }),
  };
});

// Mock Notifee
jest.mock('@notifee/react-native', () => ({
  __esModule: true,
  default: {
    displayNotification: jest.fn(() => Promise.resolve('mock-notification-id')),
    createChannel: jest.fn(() => Promise.resolve('mock-channel-id')),
    cancelNotification: jest.fn(() => Promise.resolve()),
    cancelAllNotifications: jest.fn(() => Promise.resolve()),
    onForegroundEvent: jest.fn(() => () => {}),
    onBackgroundEvent: jest.fn(),
    requestPermission: jest.fn(() => Promise.resolve({authorizationStatus: 1})),
    getTriggerNotifications: jest.fn(() => Promise.resolve([])),
    createTriggerNotification: jest.fn(() => Promise.resolve('mock-trigger-id')),
  },
  EventType: {
    DELIVERED: 3,
    PRESS: 1,
    DISMISSED: 2,
    ACTION_PRESS: 7,
  },
  TriggerType: {
    TIMESTAMP: 0,
    INTERVAL: 1,
  },
  AndroidImportance: {
    HIGH: 4,
    DEFAULT: 3,
  },
  AndroidCategory: {
    ALARM: 'alarm',
    REMINDER: 'reminder',
  },
}));

// Mock Nitro Sound
jest.mock('react-native-nitro-sound', () => ({
  __esModule: true,
  default: {
    startRecorder: jest.fn(() => Promise.resolve('file:///mock/path/recording.aac')),
    stopRecorder: jest.fn(() => Promise.resolve('file:///mock/path/recording.aac')),
    startPlayer: jest.fn(() => Promise.resolve('mock-player-token')),
    stopPlayer: jest.fn(() => Promise.resolve()),
    addRecordBackListener: jest.fn(),
    removeRecordBackListener: jest.fn(),
    addPlayBackListener: jest.fn(),
    removePlayBackListener: jest.fn(),
    addPlaybackEndListener: jest.fn(),
    removePlaybackEndListener: jest.fn(),
    deleteFile: jest.fn(() => Promise.resolve()),
  },
  AudioEncoderAndroidType: {AAC: 3},
  AudioSourceAndroidType: {MIC: 1},
  OutputFormatAndroidType: {MPEG_4: 2},
  AVEncoderAudioQualityIOSType: {high: 96},
}));

// Mock react-native-sound
jest.mock('react-native-sound', () => {
  function SoundMock(filename, basePath, onError) {
    if (typeof onError === 'function') onError(null);
  }
  SoundMock.setCategory = jest.fn();
  SoundMock.setMode = jest.fn();
  SoundMock.setActive = jest.fn();
  SoundMock.MAIN_BUNDLE = 'MAIN_BUNDLE';
  SoundMock.DOCUMENT = 'DOCUMENT';
  SoundMock.LIBRARY = 'LIBRARY';
  SoundMock.CACHES = 'CACHES';
  SoundMock.prototype.play = jest.fn(cb => {
    if (cb) cb(true);
  });
  SoundMock.prototype.stop = jest.fn(cb => {
    if (cb) cb();
  });
  SoundMock.prototype.release = jest.fn();
  SoundMock.prototype.setVolume = jest.fn();
  SoundMock.prototype.setNumberOfLoops = jest.fn();
  return {
    __esModule: true,
    default: SoundMock,
  };
});

// Mock react-native-haptic-feedback
jest.mock('react-native-haptic-feedback', () => ({
  __esModule: true,
  default: {
    trigger: jest.fn(),
  },
}));

// Mock react-native-fs
jest.mock('react-native-fs', () => ({
  __esModule: true,
  default: {
    exists: jest.fn(() => Promise.resolve(true)),
    writeFile: jest.fn(() => Promise.resolve()),
    readFile: jest.fn(() => Promise.resolve('')),
    unlink: jest.fn(() => Promise.resolve()),
    DocumentDirectoryPath: '/mock/documents',
    CachesDirectoryPath: '/mock/caches',
  },
}));

// Mock Safe Area Context
jest.mock('react-native-safe-area-context', () => {
  const inset = {top: 0, right: 0, bottom: 0, left: 0};
  return {
    SafeAreaProvider: ({children}) => children,
    SafeAreaConsumer: ({children}) => children(inset),
    useSafeAreaInsets: () => inset,
    useSafeAreaFrame: () => ({x: 0, y: 0, width: 390, height: 844}),
    SafeAreaView: ({children}) => children,
  };
});

// Mock Toast Message
jest.mock('react-native-toast-message', () => {
  const React = require('react');
  const ToastComponent = () => React.createElement(React.Fragment, null);
  ToastComponent.show = jest.fn();
  ToastComponent.hide = jest.fn();
  return {
    __esModule: true,
    default: ToastComponent,
  };
});

// Mock react-native PermissionsAndroid
jest.mock('react-native/Libraries/PermissionsAndroid/PermissionsAndroid', () => ({
  check: jest.fn(() => Promise.resolve(true)),
  request: jest.fn(() => Promise.resolve('granted')),
  requestMultiple: jest.fn(() => Promise.resolve({'android.permission.RECORD_AUDIO': 'granted'})),
  PERMISSIONS: {
    RECORD_AUDIO: 'android.permission.RECORD_AUDIO',
    WRITE_EXTERNAL_STORAGE: 'android.permission.WRITE_EXTERNAL_STORAGE',
    POST_NOTIFICATIONS: 'android.permission.POST_NOTIFICATIONS',
  },
  RESULTS: {
    GRANTED: 'granted',
    DENIED: 'denied',
    NEVER_ASK_AGAIN: 'never_ask_again',
  },
}));

// Mock react-native-worklets
jest.mock('react-native-worklets', () => ({
  __esModule: true,
  default: {},
  createWorklet: jest.fn(),
  runOnUI: jest.fn(fn => fn),
  runOnUISync: jest.fn(fn => fn),
  runOnJS: jest.fn(fn => fn),
  useWorkletCallback: jest.fn(fn => fn),
}));

// Mock react-native-drawer-layout
jest.mock('react-native-drawer-layout', () => {
  const React = require('react');
  const {View} = require('react-native');
  return {
    Drawer: ({children}) => React.createElement(View, null, children),
  };
});

// Mock @react-navigation/drawer
jest.mock('@react-navigation/drawer', () => {
  const React = require('react');
  const {View} = require('react-native');
  return {
    createDrawerNavigator: () => ({
      Navigator: ({children}) => React.createElement(View, null, children),
      Screen: ({children}) => React.createElement(View, null, children),
    }),
  };
});

// Mock lucide-react-native
jest.mock('lucide-react-native', () => {
  const React = require('react');
  const {View} = require('react-native');
  return new Proxy(
    {},
    {
      get: (target, prop) => {
        return props => React.createElement(View, props);
      },
    },
  );
});

// Mock @react-native-voice/voice
jest.mock('@react-native-voice/voice', () => ({
  __esModule: true,
  default: {
    onSpeechStart: jest.fn(),
    onSpeechRecognized: jest.fn(),
    onSpeechEnd: jest.fn(),
    onSpeechError: jest.fn(),
    onSpeechResults: jest.fn(),
    onSpeechPartialResults: jest.fn(),
    start: jest.fn(() => Promise.resolve()),
    stop: jest.fn(() => Promise.resolve()),
    cancel: jest.fn(() => Promise.resolve()),
    destroy: jest.fn(() => Promise.resolve()),
    removeAllListeners: jest.fn(),
    isAvailable: jest.fn(() => Promise.resolve(1)),
    isRecognizing: jest.fn(() => Promise.resolve(0)),
  },
}));
