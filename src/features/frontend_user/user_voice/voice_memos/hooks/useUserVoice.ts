/**
 * RESPONSIBILITY: Controls native audio recording/playback, local memo files, and explicit transcript-to-task conversion.
 * FLOW: UserVoiceMainView → this hook → Nitro Sound + document storage + useUserVoiceMemos → optional Todo task conversion.
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import { PermissionsAndroid, Platform } from 'react-native';
import RNFS from 'react-native-fs';
import Sound from 'react-native-nitro-sound';
import { useTodoContext } from '../../../../../context/TodoContext';
import { useTranslation } from '../../../../../core/i18n/useTranslation';
import { showToast } from '../../../../../core/toast/showToast';
import type { VoiceMemoEntity } from '../types/user_voice.types';
import { useUserVoiceMemos } from './useUserVoiceMemos';

const RECORDINGS_DIRECTORY = `${RNFS.DocumentDirectoryPath}/tasklume-voice-memos`;

/**
 * Requests microphone permission where Android requires an explicit runtime prompt.
 * @returns True only when recording permission is granted.
 */
async function requestMicrophonePermission(): Promise<boolean> {
  if (Platform.OS !== 'android') return true;
  const result = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.RECORD_AUDIO, {
    title: 'Microphone permission',
    message: 'TaskLume uses your microphone only while you record a voice memo.',
    buttonPositive: 'Allow',
    buttonNegative: 'Not now',
  });
  return result === PermissionsAndroid.RESULTS.GRANTED;
}

/** Creates a unique local recording identifier without another package dependency. */
function createVoiceMemoId(): string {
  return `voice-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

/**
 * Manages actual local audio capture/playback and transcript-based task conversion.
 * @returns Recording state, memo list, playback/edit/delete actions, and the task conversion action.
 * @sideEffects Requests microphone permission, writes audio files and local metadata, and updates TodoContext on task conversion.
 */
export function useUserVoice() {
  const { t } = useTranslation();
  const todoCtx = useTodoContext();
  const addTodo = todoCtx?.addTodo;
  const memoState = useUserVoiceMemos();
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [elapsedMs, setElapsedMs] = useState(0);
  const [activePlayingId, setActivePlayingId] = useState<string | null>(null);
  const [recordingError, setRecordingError] = useState(false);
  const processingRef = useRef(false);
  const recordingRef = useRef(false);
  const recordingStartRef = useRef<number | null>(null);
  const elapsedRef = useRef(0);
  const playingIdRef = useRef<string | null>(null);

  useEffect(() => {
    return () => {
      if (recordingRef.current) {
        Sound.stopRecorder().catch(() => undefined);
        Sound.removeRecordBackListener();
      }
      if (playingIdRef.current) {
        Sound.stopPlayer().catch(() => undefined);
        Sound.removePlayBackListener();
        Sound.removePlaybackEndListener();
      }
    };
  }, []);

  const startRecording = useCallback(async () => {
    if (processingRef.current || recordingRef.current || memoState.isLoading) return;
    processingRef.current = true;
    setIsProcessing(true);
    setRecordingError(false);
    try {
      const hasPermission = await requestMicrophonePermission();
      if (!hasPermission) {
        setRecordingError(true);
        showToast(t('user_voice_memos.MIC_PERMISSION_DENIED'), 'error', 'user_voice:permission:denied');
        return;
      }
      if (playingIdRef.current) {
        await Sound.stopPlayer().catch(() => undefined);
        Sound.removePlayBackListener();
        Sound.removePlaybackEndListener();
        playingIdRef.current = null;
        setActivePlayingId(null);
      }
      elapsedRef.current = 0;
      setElapsedMs(0);
      Sound.addRecordBackListener((event) => {
        const nextMs = Math.max(0, Number(event.currentPosition) || 0);
        elapsedRef.current = nextMs;
        setElapsedMs(nextMs);
      });
      await Sound.startRecorder();
      recordingStartRef.current = Date.now();
      recordingRef.current = true;
      setIsRecording(true);
      showToast(t('user_voice_memos.RECORDING_STARTED'), 'info', 'user_voice:recording:started');
    } catch {
      Sound.removeRecordBackListener();
      setRecordingError(true);
      showToast(t('user_voice_memos.RECORDING_START_FAILED'), 'error', 'user_voice:recording:start-failed');
    } finally {
      processingRef.current = false;
      setIsProcessing(false);
    }
  }, [memoState.isLoading, t]);

  const stopRecording = useCallback(async () => {
    if (processingRef.current || !recordingRef.current) return;
    processingRef.current = true;
    setIsProcessing(true);
    try {
      const sourcePath = await Sound.stopRecorder();
      recordingRef.current = false;
      Sound.removeRecordBackListener();
      if (!sourcePath || sourcePath === 'recorder already stopped') {
        throw new Error('Recorder did not return an audio file.');
      }
      const normalizedSource = sourcePath.replace(/^file:\/\//, '');
      if (!(await RNFS.exists(normalizedSource))) {
        throw new Error('Recorded audio file is missing.');
      }
      if (!(await RNFS.exists(RECORDINGS_DIRECTORY))) {
        await RNFS.mkdir(RECORDINGS_DIRECTORY);
      }
      const extension = normalizedSource.match(/\.(m4a|mp4|caf|wav|aac)$/i)?.[1] ?? (Platform.OS === 'ios' ? 'm4a' : 'mp4');
      const id = createVoiceMemoId();
      const destination = `${RECORDINGS_DIRECTORY}/${id}.${extension}`;
      await RNFS.moveFile(normalizedSource, destination);
      const durationMs = Math.max(elapsedRef.current, Date.now() - (recordingStartRef.current ?? Date.now()), 1);
      const memo: VoiceMemoEntity = {
        id,
        title: new Date().toLocaleString(),
        transcript: '',
        audioPath: destination,
        durationMs,
        createdAt: Date.now(),
      };
      const saved = await memoState.addMemo(memo);
      if (!saved) {
        await RNFS.unlink(destination).catch(() => undefined);
        throw new Error('Memo metadata could not be saved.');
      }
      setElapsedMs(0);
      elapsedRef.current = 0;
      recordingStartRef.current = null;
      showToast(t('user_voice_memos.RECORDING_SAVED'), 'success', `user_voice:recording:saved:${id}`);
    } catch {
      recordingRef.current = false;
      setIsRecording(false);
      setRecordingError(true);
      showToast(t('user_voice_memos.RECORDING_SAVE_FAILED'), 'error', 'user_voice:recording:save-failed');
    } finally {
      setIsRecording(false);
      processingRef.current = false;
      setIsProcessing(false);
    }
  }, [memoState.addMemo, t]);

  const togglePlayback = useCallback(async (memo: VoiceMemoEntity) => {
    if (processingRef.current || recordingRef.current || !memo.audioPath) return;
    try {
      if (playingIdRef.current === memo.id) {
        await Sound.stopPlayer();
        Sound.removePlayBackListener();
        Sound.removePlaybackEndListener();
        playingIdRef.current = null;
        setActivePlayingId(null);
        return;
      }
      if (playingIdRef.current) {
        await Sound.stopPlayer().catch(() => undefined);
        Sound.removePlayBackListener();
        Sound.removePlaybackEndListener();
      }
      Sound.addPlaybackEndListener(() => {
        playingIdRef.current = null;
        setActivePlayingId(null);
      });
      await Sound.startPlayer(memo.audioPath);
      playingIdRef.current = memo.id;
      setActivePlayingId(memo.id);
    } catch {
      playingIdRef.current = null;
      setActivePlayingId(null);
      showToast(t('user_voice_memos.PLAYBACK_FAILED'), 'error', `user_voice:playback:failed:${memo.id}`);
    }
  }, [t]);

  const updateTranscript = useCallback(async (id: string, transcript: string) => {
    const saved = await memoState.updateTranscript(id, transcript.trim());
    if (!saved) showToast(t('user_voice_memos.TRANSCRIPT_SAVE_FAILED'), 'error', `user_voice:transcript:failed:${id}`);
    return saved;
  }, [memoState.updateTranscript, t]);

  const deleteMemo = useCallback(async (id: string) => {
    const memo = memoState.memos.find((item) => item.id === id);
    if (!memo) return false;
    if (playingIdRef.current === id) {
      await Sound.stopPlayer().catch(() => undefined);
      Sound.removePlayBackListener();
      Sound.removePlaybackEndListener();
      playingIdRef.current = null;
      setActivePlayingId(null);
    }
    const removed = await memoState.removeMemo(id);
    if (!removed) {
      showToast(t('user_voice_memos.MEMO_DELETE_FAILED'), 'error', `user_voice:memo:delete-failed:${id}`);
      return false;
    }
    if (memo.audioPath && await RNFS.exists(memo.audioPath)) {
      await RNFS.unlink(memo.audioPath).catch(() => undefined);
    }
    showToast(t('user_voice_memos.MEMO_DELETED'), 'success', `user_voice:memo:deleted:${id}`);
    return true;
  }, [memoState.memos, memoState.removeMemo, t]);

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
    isRecording,
    isProcessing,
    elapsedMs,
    activePlayingId,
    recordingError,
    startRecording,
    stopRecording,
    togglePlayback,
    updateTranscript,
    deleteMemo,
    saveAsTask,
  };
}
