/**
 * RESPONSIBILITY: Behavioral tests for confirmation-gated Settings cleanup actions.
 * FLOW: Tap cleanup button → assert no mutation → confirm → assert only the intended callback fires.
 */
import React from 'react';
import { act, create, type ReactTestRenderer } from 'react-test-renderer';
import { UserSettingsDataSection } from './UserSettingsDataSection';

jest.mock('../../../../../core/theme/useThemeTokens', () => ({
  useThemeTokens: () => ({
    color: {
      card: '#FFFFFF', border: '#E4E4E7', foreground: '#000000',
      muted: '#52525B', primary: '#EAB308', destructive: '#B91C1C',
    },
    space: { 3: 12, 4: 16 },
    radius: { md: 8, lg: 12 },
    typography: {
      body: { fontSize: 16, lineHeight: 24, letterSpacing: 0, fontWeight: '400' },
    },
  }),
}));

jest.mock('../../../../../core/interaction/haptics', () => ({
  triggerLightImpact: jest.fn(),
  triggerWarningNotification: jest.fn(),
}));

jest.mock('./UserSettingsConfirmDialog', () => {
  const ReactMock = require('react');
  const { View, Text, Pressable } = require('react-native');
  return {
    UserSettingsConfirmDialog: ({ visible, title, onCancel, onConfirm }: {
      visible: boolean; title: string; onCancel: () => void; onConfirm: () => void;
    }) => visible
      ? ReactMock.createElement(View, null,
          ReactMock.createElement(Text, null, title),
          ReactMock.createElement(Pressable, { testID: 'user_settings-confirm-cancel', onPress: onCancel },
            ReactMock.createElement(Text, null, 'Cancel')),
          ReactMock.createElement(Pressable, { testID: 'user_settings-confirm-submit', onPress: onConfirm },
            ReactMock.createElement(Text, null, 'Confirm')))
      : null,
  };
});

jest.mock('./UserSettingsBackupRestoreDialog', () => ({
  UserSettingsBackupRestoreDialog: () => null,
}));

jest.mock('../../../../../core/i18n/useTranslation', () => ({ useTranslation: () => ({ t: (key: string) => key }) }));

describe('UserSettingsDataSection destructive actions', () => {
  it('does not clear completed tasks until the user confirms', () => {
    const onClearCompleted = jest.fn();
    const onEmptyTrash = jest.fn();
    let root!: ReactTestRenderer;

    act(() => {
      root = create(
        <UserSettingsDataSection
          onExport={jest.fn()}
          onImport={jest.fn(async () => true)}
          onClearCompleted={onClearCompleted}
          onEmptyTrash={onEmptyTrash}
        />,
      );
    });

    act(() => {
      root.root.findByProps({ testID: 'user_settings-clear-completed-open' }).props.onPress();
    });
    expect(onClearCompleted).not.toHaveBeenCalled();

    act(() => {
      root.root.findByProps({ testID: 'user_settings-confirm-submit' }).props.onPress();
    });
    expect(onClearCompleted).toHaveBeenCalledTimes(1);
    expect(onEmptyTrash).not.toHaveBeenCalled();
    act(() => root.unmount());
  });

  it('does not empty Trash until the user confirms', () => {
    const onClearCompleted = jest.fn();
    const onEmptyTrash = jest.fn();
    let root!: ReactTestRenderer;

    act(() => {
      root = create(
        <UserSettingsDataSection
          onExport={jest.fn()}
          onImport={jest.fn(async () => true)}
          onClearCompleted={onClearCompleted}
          onEmptyTrash={onEmptyTrash}
        />,
      );
    });

    act(() => {
      root.root.findByProps({ testID: 'user_settings-empty-trash-open' }).props.onPress();
    });
    expect(onEmptyTrash).not.toHaveBeenCalled();

    act(() => {
      root.root.findByProps({ testID: 'user_settings-confirm-submit' }).props.onPress();
    });
    expect(onEmptyTrash).toHaveBeenCalledTimes(1);
    expect(onClearCompleted).not.toHaveBeenCalled();
    act(() => root.unmount());
  });
});
