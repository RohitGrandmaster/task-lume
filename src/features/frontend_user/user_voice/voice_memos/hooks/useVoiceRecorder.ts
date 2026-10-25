/**
 * RESPONSIBILITY: Owns native microphone permission, recording lifecycle, and durable audio-file creation.
 * FLOW: useUserVoice injects the metadata persistence callback; this hook returns recording state/actions.
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import { PermissionsAndroid, Platform } from 'react-native';
import RNFS from 'react-native-fs';
import Sound from 'react-native-nitro-sound';
import { useTranslation } from '../../../../../core/i18n/useTranslation';
import { showToast } from '../../../../../core/toast/showToast';
import type { VoiceMemoEntity } from '../types/user_voice.types';

const RECORDINGS_DIRECTORY = `${RNFS.DocumentDirectoryPath}/tasklume-voice-memos`;
type SaveMemo = (memo: VoiceMemoEntity) => Promise<boolean>;

/**
 * Requests microphone permission where Android requires an explicit runtime prompt.
 * @returns True only when audio recording permission is granted.
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

/** Creates a per-recording ID that is stable for the local audio file and metadata record. */
function createVoiceMemoId(): string {
  return `voice-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

/**
 * Owns start/stop, progress events, and moving audio into the app's document directory.
 * @param saveMemo - Persists the new memo metadata and returns whether the write succeeded.
 * @returns Recording state, error state and safe start/stop handlers.
 * @sideEffects Requests microphone access, captures audio and writes a private app file.
 */
export function useVoiceRecorder(saveMemo: SaveMemo, stopPlayback: () => Promise<void>) {
  const { t } = useTranslation();
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [elapsedMs, setElapsedMs] = useState(0);
  const [recordingError, setRecordingError] = useState(false);
  const operationRef = useRef(false);
  const recordingRef = useRef(false);
  const startTimeRef = useRef<number | null>(null);
  const elapsedRef = useRef(0);

  useEffect(() => () => {
    if (recordingRef.current) {
      Sound.stopRecorder().catch(() => undefined);
      Sound.removeRecordBackListener();
    }
  }, []);

  const startRecording = useCallback(async () => {
    if (operationRef.current || recordingRef.current) return;
    operationRef.current = true;
    setIsProcessing(true);
    setRecordingError(false);
    try {
      const permitted = await requestMicrophonePermission();
      if (!permitted) {
        setRecordingError(true);
        showToast(t('user_voice_memos.MIC_PERMISSION_DENIED'), 'error', 'user_voice:permission:denied');
        return;
      }
      await stopPlayback();
      elapsedRef.current = 0;
      setElapsedMs(0);
      Sound.addRecordBackListener((event) => {
        const next = Math.max(0, Number(event.currentPosition) || 0);
        elapsedRef.current = next;
        setElapsedMs(next);
      });
      await Sound.startRecorder();
      startTimeRef.current = Date.now();
      recordingRef.current = true;
      setIsRecording(true);
      showToast(t('user_voice_memos.RECORDING_STARTED'), 'info', 'user_voice:recording:started');
    } catch {
      Sound.removeRecordBackListener();
      setRecordingError(true);
      showToast(t('user_voice_memos.RECORDING_START_FAILED'), 'error', 'user_voice:recording:start-failed');
    } finally {
      operationRef.current = false;
      setIsProcessing(false);
    }
  }, [stopPlayback, t]);

  const stopRecording = useCallback(async () => {
    if (operationRef.current || !recordingRef.current) return;
    operationRef.current = true;
    setIsProcessing(true);
    try {
      const sourcePath = await Sound.stopRecorder();
      recordingRef.current = false;
      setIsRecording(false);
      Sound.removeRecordBackListener();
      if (!sourcePath || sourcePath === 'recorder already stopped') throw new Error('Audio path was not returned.');
      const source = sourcePath.replace(/^file:\/\//, '');
      if (!(await RNFS.exists(source))) throw new Error('Recorded audio file is missing.');
      if (!(await RNFS.exists(RECORDINGS_DIRECTORY))) await RNFS.mkdir(RECORDINGS_DIRECTORY);

      const extension = source.match(/\.(m4a|mp4|caf|wav|aac)$/i)?.[1] ?? (Platform.OS === 'ios' ? 'm4a' : 'mp4');
      const id = createVoiceMemoId();
      const audioPath = `${RECORDINGS_DIRECTORY}/${id}.${extension}`;
      await RNFS.moveFile(source, audioPath);
      const durationMs = Math.max(elapsedRef.current, Date.now() - (startTimeRef.current ?? Date.now()), 1);
      const saved = await saveMemo({
        id,
        title: new Date().toLocaleString(),
        transcript: '',
        audioPath,
        durationMs,
        createdAt: Date.now(),
      });
      if (!saved) {
        await RNFS.unlink(audioPath).catch(() => undefined);
        throw new Error('Local memo metadata could not be saved.');
      }
      elapsedRef.current = 0;
      startTimeRef.current = null;
      setElapsedMs(0);
      showToast(t('user_voice_memos.RECORDING_SAVED'), 'success', `user_voice:recording:saved:${id}`);
    } catch {
      setRecordingError(true);
      showToast(t('user_voice_memos.RECORDING_SAVE_FAILED'), 'error', 'user_voice:recording:save-failed');
    } finally {
      recordingRef.current = false;
      setIsRecording(false);
      operationRef.current = false;
      setIsProcessing(false);
    }
  }, [saveMemo, t]);

  return { isRecording, isProcessing, elapsedMs, recordingError, startRecording, stopRecording };
}
