/**
 * RESPONSIBILITY: Behavioral tests for the Todo destructive-action confirmation dialog.
 * FLOW: Mount dialog → press Cancel or Confirm testID → assert only the selected callback fires.
 */
import React from 'react';
import { act, create, type ReactTestRenderer } from 'react-test-renderer';
import { UserTodosConfirmDialog } from './UserTodosConfirmDialog';

jest.mock('../../../../../core/theme/useThemeTokens', () => ({
  useThemeTokens: () => ({
    color: {
      overlayBackdrop: 'rgba(0,0,0,0.6)',
      card: '#FFFFFF',
      border: '#E4E4E7',
      foreground: '#111111',
      muted: '#52525B',
      destructive: '#B91C1C',
      onDestructive: '#FFFFFF',
    },
    space: { 2: 8, 4: 16, 5: 20 },
    radius: { md: 8, xl: 16 },
    typography: {
      headingSm: { fontSize: 18, lineHeight: 22, letterSpacing: -0.5, fontWeight: '600' },
      bodySm: { fontSize: 14, lineHeight: 21, letterSpacing: 0, fontWeight: '400' },
      body: { fontSize: 16, lineHeight: 24, letterSpacing: 0, fontWeight: '400' },
    },
    layout: { buttonMinWidth: 120 },
    opacity: { loading: 0.7 },
  }),
}));

jest.mock('../../../../../core/i18n/useTranslation', () => ({ useTranslation: () => ({ t: (key: string) => key }) }));

describe('UserTodosConfirmDialog', () => {
  it('does not run the destructive callback unless Confirm is explicitly pressed', () => {
    const onCancel = jest.fn();
    const onConfirm = jest.fn();
    let root!: ReactTestRenderer;

    act(() => {
      root = create(
        <UserTodosConfirmDialog
          visible
          title="Delete task?"
          description="This cannot be undone."
          confirmLabel="Delete Task"
          onCancel={onCancel}
          onConfirm={onConfirm}
        />,
      );
    });

    expect(onConfirm).not.toHaveBeenCalled();

    act(() => {
      root.root.findByProps({ testID: 'user_todos-confirm-submit' }).props.onPress();
    });

    expect(onConfirm).toHaveBeenCalledTimes(1);
    expect(onCancel).not.toHaveBeenCalled();
    act(() => root.unmount());
  });

  it('cancels without invoking the destructive callback', () => {
    const onCancel = jest.fn();
    const onConfirm = jest.fn();
    let root!: ReactTestRenderer;

    act(() => {
      root = create(
        <UserTodosConfirmDialog
          visible
          title="Delete task?"
          description="This cannot be undone."
          confirmLabel="Delete Task"
          onCancel={onCancel}
          onConfirm={onConfirm}
        />,
      );
    });

    act(() => {
      root.root.findByProps({ testID: 'user_todos-confirm-cancel' }).props.onPress();
    });

    expect(onCancel).toHaveBeenCalledTimes(1);
    expect(onConfirm).not.toHaveBeenCalled();
    act(() => root.unmount());
  });
});
