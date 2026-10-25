/**
 * RESPONSIBILITY: Tests validated voice-transcript-to-task conversion feedback.
 * FLOW: Mount hook harness → submit transcript → assert addTodo and matching success/error result.
 */
import React from 'react';
import { Pressable } from 'react-native';
import { act, create, type ReactTestRenderer } from 'react-test-renderer';
import { useUserVoice } from './useUserVoice';
import { showToast } from '../../../../../core/toast/showToast';

jest.mock('../../../../../context/TodoContext', () => {
  const context = { addTodo: jest.fn() };
  return { useTodoContext: () => context, __mockContext: context };
});
jest.mock('../../../../../core/toast/showToast', () => ({ showToast: jest.fn() }));
jest.mock('../../../../../core/i18n/useTranslation', () => ({
  useTranslation: () => ({ t: (key: string) => ({
    'user_voice_memos.TASK_CREATED': 'Task created from voice memo.',
    'user_voice_memos.TASK_CREATE_ERROR': 'Task could not be created from this voice memo.',
    'user_voice_memos.TRANSCRIPT_REQUIRED': 'Add transcript or notes before creating a task.',
  }[key] ?? key) }),
}));
jest.mock('./useUserVoiceMemos', () => ({
  useUserVoiceMemos: () => ({
    memos: [], isLoading: false, storageError: false,
    addMemo: jest.fn(async () => true),
    updateTranscript: jest.fn(async () => true),
    removeMemo: jest.fn(async () => true),
  }),
}));
jest.mock('./useVoicePlayback', () => ({
  useVoicePlayback: () => ({
    activePlayingId: null,
    togglePlayback: jest.fn(async () => undefined),
    stopPlayback: jest.fn(async () => undefined),
  }),
}));
jest.mock('./useVoiceRecorder', () => ({
  useVoiceRecorder: () => ({
    isRecording: false, isProcessing: false, elapsedMs: 0, recordingError: false,
    startRecording: jest.fn(async () => undefined),
    stopRecording: jest.fn(async () => undefined),
  }),
}));
jest.mock('../../../../../core/i18n/useTranslation', () => ({
  useTranslation: () => ({ t: (key: string) => ({
    'user_voice_memos.TASK_CREATED': 'Task created from voice memo.',
    'user_voice_memos.TASK_CREATE_ERROR': 'Task could not be created from this voice memo.',
    'user_voice_memos.TRANSCRIPT_REQUIRED': 'Add transcript or notes before creating a task.',
  }[key] ?? key) }),
}));
jest.mock('./useUserVoiceMemos', () => ({
  useUserVoiceMemos: () => ({
    memos: [], isLoading: false, storageError: false,
    addMemo: jest.fn(async () => true),
    updateTranscript: jest.fn(async () => true),
    removeMemo: jest.fn(async () => true),
  }),
}));
jest.mock('./useVoicePlayback', () => ({
  useVoicePlayback: () => ({
    activePlayingId: null,
    togglePlayback: jest.fn(async () => undefined),
    stopPlayback: jest.fn(async () => undefined),
  }),
}));
jest.mock('./useVoiceRecorder', () => ({
  useVoiceRecorder: () => ({
    isRecording: false, isProcessing: false, elapsedMs: 0, recordingError: false,
    startRecording: jest.fn(async () => undefined),
    stopRecording: jest.fn(async () => undefined),
  }),
}));

const mockTodoContext = jest.requireMock('../../../../../context/TodoContext').__mockContext;

function SaveTaskHarness({ transcript }: { transcript: string }) {
  const { saveAsTask } = useUserVoice();
  return <Pressable testID="user_voice-save-as-task-test" onPress={() => saveAsTask(transcript)} />;
}

describe('useUserVoice saveAsTask', () => {
  beforeEach(() => {
    mockTodoContext.addTodo.mockClear();
    (showToast as jest.Mock).mockClear();
  });

  it('creates a task from non-empty transcript and only then shows success feedback', () => {
    let root!: ReactTestRenderer;
    act(() => { root = create(<SaveTaskHarness transcript="  Call the dentist  " />); });
    act(() => { root.root.findByProps({ testID: 'user_voice-save-as-task-test' }).props.onPress(); });
    expect(mockTodoContext.addTodo).toHaveBeenCalledWith({
      title: 'Call the dentist',
      category: 'Personal',
      priority: 'medium',
    });
    expect(showToast).toHaveBeenCalledWith('Task created from voice memo.', 'success', 'user_voice:task:created');
    act(() => root.unmount());
  });

  it('rejects an empty transcript without creating a task or showing success', () => {
    let root!: ReactTestRenderer;
    act(() => { root = create(<SaveTaskHarness transcript="   " />); });
    act(() => { root.root.findByProps({ testID: 'user_voice-save-as-task-test' }).props.onPress(); });
    expect(mockTodoContext.addTodo).not.toHaveBeenCalled();
    expect(showToast).toHaveBeenCalledWith(
      'A non-empty transcript is required to create a task.',
      'error',
      'user_voice:task:empty',
    );
    act(() => root.unmount());
  });
});
