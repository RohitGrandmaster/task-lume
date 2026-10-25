/**
 * RESPONSIBILITY: Composes local voice memo storage, recording/playback hooks, and optional task conversion.
 * FLOW: UserVoiceMainView → useUserVoice → local memo state + native recorder/player + Todo task action.
 */
import { useCallback } from 'react';
import RNFS from 'react-native-fs';
import { useTodoContext } from '../../../../../context/TodoContext';
import { useTranslation } from '../../../../../core/i18n/useTranslation';
import { showToast } from '../../../../../core/toast/showToast';
import type { VoiceMemoEntity } from '../types/user_voice.types';
import { useUserVoiceMemos } from './useUserVoiceMemos';
import { useVoicePlayback } from './useVoicePlayback';
import { useVoiceRecorder } from './useVoiceRecorder';

/**
 * Exposes the complete local audio memo workflow and transcript-to-task action.
 * @returns Memo persistence, recorder/player actions and task conversion feedback.
 * @sideEffects Reads/writes device storage and audio files; task creation uses the current host TodoContext.
 */
export function useUserVoice() {
  const { t } = useTranslation();
  const todoCtx = useTodoContext();
  const addTodo = todoCtx?.addTodo;
  const memoState = useUserVoiceMemos();
  const playback = useVoicePlayback();
  const recorder = useVoiceRecorder(memoState.addMemo, playback.stopPlayback);

  const updateTranscript = useCallback(async (id: string, transcript: string) => {
    const saved = await memoState.updateTranscript(id, transcript.trim());
    if (!saved) showToast(t('user_voice_memos.TRANSCRIPT_SAVE_FAILED'), 'error', `user_voice:transcript:failed:${id}`);
    return saved;
  }, [memoState.updateTranscript, t]);

  const deleteMemo = useCallback(async (id: string) => {
    const memo = memoState.memos.find((item) => item.id === id);
    if (!memo) return false;
    await playback.stopPlayback(id);
    const removed = await memoState.removeMemo(id);
    if (!removed) {
      showToast(t('user_voice_memos.MEMO_DELETE_FAILED'), 'error', `user_voice:memo:delete-failed:${id}`);
      return false;
    }
    if (memo.audioPath && await RNFS.exists(memo.audioPath)) await RNFS.unlink(memo.audioPath).catch(() => undefined);
    showToast(t('user_voice_memos.MEMO_DELETED'), 'success', `user_voice:memo:deleted:${id}`);
    return true;
  }, [memoState.memos, memoState.removeMemo, playback.stopPlayback, t]);

  const saveAsTask = useCallback(async (memo: VoiceMemoEntity): Promise<boolean> => {
    const title = memo.transcript.trim();
    if (!title) {
      showToast(t('user_voice_memos.TRANSCRIPT_REQUIRED'), 'error', `user_voice:task:empty:${memo.id}`);
      return false;
    }
    if (typeof addTodo !== 'function') {
      showToast(t('user_voice_memos.TASK_CREATE_ERROR'), 'error', 'user_voice:task:unavailable');
      return false;
    }
    try {
      await Promise.resolve(addTodo({ title, category: 'Personal', priority: 'medium' }));
      showToast(t('user_voice_memos.TASK_CREATED'), 'success', `user_voice:task:created:${memo.id}`);
      return true;
    } catch {
      showToast(t('user_voice_memos.TASK_CREATE_ERROR'), 'error', `user_voice:task:failed:${memo.id}`);
      return false;
    }
  }, [addTodo, t]);

  return {
    ...memoState,
    ...recorder,
    ...playback,
    updateTranscript,
    deleteMemo,
    saveAsTask,
  };
}
