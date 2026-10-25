/**
 * RESPONSIBILITY: Behavioral tests ensuring permanent trash actions require explicit confirmation.
 * FLOW: Tap Delete/Empty Trash → callbacks stay untouched → tap Confirm → only the selected callback fires.
 */
import React from 'react';
import { act, create, type ReactTestRenderer } from 'react-test-renderer';
import type { TodoEntity } from '../types/user_todos.types';
import { UserTodosTrashMainView } from './UserTodosTrashMainView';

jest.mock('../../../../../core/theme/useThemeTokens', () => ({
  useThemeTokens: () => ({
    color: {
      background: '#F4F4F5',
      card: '#FFFFFF',
      foreground: '#000000',
      muted: '#52525B',
      border: '#E4E4E7',
      primary: '#EAB308',
      destructive: '#B91C1C',
      statusDangerBg: '#FEE2E2',
      statusDangerText: '#7F1D1D',
      overlayBackdrop: 'rgba(0,0,0,0.6)',
      onDestructive: '#FFFFFF',
    },
    space: { 2: 8, 3: 12, 4: 16, 8: 40 },
    radius: { md: 8, lg: 12, xl: 16 },
    typography: {
      caption: { fontSize: 12, lineHeight: 18, letterSpacing: 0.5, fontWeight: '400' },
      bodySm: { fontSize: 14, lineHeight: 21, letterSpacing: 0, fontWeight: '400' },
      body: { fontSize: 16, lineHeight: 24, letterSpacing: 0, fontWeight: '400' },
      headingLg: { fontSize: 22, lineHeight: 28, letterSpacing: -0.5, fontWeight: '700' },
      headingSm: { fontSize: 18, lineHeight: 22, letterSpacing: -0.5, fontWeight: '600' },
    },
    layout: { buttonMinWidth: 120 },
    opacity: { loading: 0.7 },
    zIndex: { fab: 20 },
  }),
}));

const trashedTodo: TodoEntity = {
  id: 'todo-1',
  title: 'Test task',
  completed: false,
  category: 'Personal',
  priority: 'medium',
  dueDate: '',
  reminder: false,
  favorite: false,
  deleted: true,
  pinned: false,
  createdAt: 1,
};

describe('UserTodosTrashMainView destructive actions', () => {
  it('requires confirmation before permanently deleting one task', () => {
    const onPermanentDelete = jest.fn();
    const onEmptyTrash = jest.fn();
    let root!: ReactTestRenderer;

    act(() => {
      root = create(
        <UserTodosTrashMainView
          trashTodos={[trashedTodo]}
          onRestore={jest.fn()}
          onPermanentDelete={onPermanentDelete}
          onEmptyTrash={onEmptyTrash}
        />,
      );
    });

    act(() => {
      root.root.findByProps({ testID: 'user_todos-delete-trash-item-open' }).props.onPress();
    });
    expect(onPermanentDelete).not.toHaveBeenCalled();

    act(() => {
      root.root.findByProps({ testID: 'user_todos-confirm-submit' }).props.onPress();
    });
    expect(onPermanentDelete).toHaveBeenCalledTimes(1);
    expect(onPermanentDelete).toHaveBeenCalledWith('todo-1');
    expect(onEmptyTrash).not.toHaveBeenCalled();
    act(() => root.unmount());
  });

  it('requires confirmation before emptying the trash', () => {
    const onPermanentDelete = jest.fn();
    const onEmptyTrash = jest.fn();
    let root!: ReactTestRenderer;

    act(() => {
      root = create(
        <UserTodosTrashMainView
          trashTodos={[trashedTodo]}
          onRestore={jest.fn()}
          onPermanentDelete={onPermanentDelete}
          onEmptyTrash={onEmptyTrash}
        />,
      );
    });

    act(() => {
      root.root.findByProps({ testID: 'user_todos-empty-trash-open' }).props.onPress();
    });
    expect(onEmptyTrash).not.toHaveBeenCalled();

    act(() => {
      root.root.findByProps({ testID: 'user_todos-confirm-submit' }).props.onPress();
    });
    expect(onEmptyTrash).toHaveBeenCalledTimes(1);
    expect(onPermanentDelete).not.toHaveBeenCalled();
    act(() => root.unmount());
  });
});
