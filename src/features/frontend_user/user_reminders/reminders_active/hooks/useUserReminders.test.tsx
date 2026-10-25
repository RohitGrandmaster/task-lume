/**
 * RESPONSIBILITY: Tests that the reminder snooze interaction reschedules task date/time instead of faking success.
 * FLOW: Mount hook harness → tap Snooze → assert TodoContext receives the new schedule and feedback is emitted.
 */
import React from 'react';
import { Pressable } from 'react-native';
import { act, create, type ReactTestRenderer } from 'react-test-renderer';
import { useUserReminders } from './useUserReminders';
import { showToast } from '../../../../../core/toast/showToast';

jest.mock('../../../../../context/TodoContext', () => {
  const context = {
    tasks: [
      {
        id: 'reminder-1',
        title: 'Test reminder',
        reminder: true,
        reminderTime: '09:00',
        dueDate: '2026-10-25',
        completed: false,
        deleted: false,
      },
    ],
    updateTodo: jest.fn(),
  };
  return {
    useTodoContext: () => context,
    __mockContext: context,
  };
});

const mockTodoContext = jest.requireMock('../../../../../context/TodoContext').__mockContext;

jest.mock('../../../../../core/toast/showToast', () => ({
  showToast: jest.fn(),
}));

function ReminderSnoozeHarness() {
  const { snoozeReminder } = useUserReminders();
  return <Pressable testID="reminders-snooze-test-action" onPress={() => snoozeReminder('reminder-1', 10)} />;
}

describe('useUserReminders snooze behavior', () => {
  beforeEach(() => {
    mockTodoContext.updateTodo.mockClear();
    (showToast as jest.Mock).mockClear();
  });

  it('updates the selected reminder date and time and reports the real state change', () => {
    let root!: ReactTestRenderer;
    act(() => { root = create(<ReminderSnoozeHarness />); });
    act(() => { root.root.findByProps({ testID: 'reminders-snooze-test-action' }).props.onPress(); });

    expect(mockTodoContext.updateTodo).toHaveBeenCalledTimes(1);
    expect(mockTodoContext.updateTodo).toHaveBeenCalledWith(
      'reminder-1',
      expect.objectContaining({
        reminder: true,
        dueDate: expect.stringMatching(/^\d{4}-\d{2}-\d{2}$/),
        reminderTime: expect.stringMatching(/^\d{2}:\d{2}$/),
      }),
    );
    expect(showToast).toHaveBeenCalledWith(
      'Reminder time updated.',
      'success',
      expect.stringMatching(/^user_reminders:snooze:reminder-1:/),
    );
    act(() => root.unmount());
  });

  it('does not report a successful snooze if the reminder is missing', () => {
    mockTodoContext.tasks = [];
    let root!: ReactTestRenderer;
    act(() => { root = create(<ReminderSnoozeHarness />); });
    act(() => { root.root.findByProps({ testID: 'reminders-snooze-test-action' }).props.onPress(); });

    expect(mockTodoContext.updateTodo).not.toHaveBeenCalled();
    expect(showToast).toHaveBeenCalledWith(
      'Reminder could not be rescheduled.',
      'error',
      'user_reminders:snooze:unavailable:reminder-1',
    );
    act(() => root.unmount());
  });
});
