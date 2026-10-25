/**
 * RESPONSIBILITY: Owns local voice-memo metadata persistence and mutations; contains no recording/player controls.
 * FLOW: useUserVoice calls this hook after a recording is moved into the app's document directory.
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { VoiceMemoEntity } from '../types/user_voice.types';

const STORAGE_KEY = '@tasklume/voice-memos/v1';

function isVoiceMemo(value: unknown): value is VoiceMemoEntity {
  if (!value || typeof value !== 'object') return false;
  const memo = value as Partial<VoiceMemoEntity>;
  return typeof memo.id === 'string'
    && typeof memo.title === 'string'
    && typeof memo.transcript === 'string'
    && typeof memo.audioPath === 'string'
    && typeof memo.durationMs === 'number'
    && Number.isFinite(memo.durationMs)
    && typeof memo.createdAt === 'number'
    && Number.isFinite(memo.createdAt);
}

/**
 * Loads and persists recordings locally so audio never depends on a guessed server contract.
 * @returns Memo records and serialized update operations.
 * @sideEffects Reads/writes the voice-memo metadata key in AsyncStorage.
 */
export function useUserVoiceMemos() {
  const [memos, setMemos] = useState<VoiceMemoEntity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [storageError, setStorageError] = useState(false);
  const memosRef = useRef<VoiceMemoEntity[]>([]);
  const writeQueue = useRef<Promise<boolean>>(Promise.resolve(true));

  useEffect(() => {
    let mounted = true;
    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => {
        const parsed: unknown = raw ? JSON.parse(raw) : [];
        const valid = Array.isArray(parsed) ? parsed.filter(isVoiceMemo) : [];
        if (mounted) {
          memosRef.current = valid;
          setMemos(valid);
        }
      })
      .catch(() => {
        if (mounted) setStorageError(true);
      })
      .finally(() => {
        if (mounted) setIsLoading(false);
      });
    return () => { mounted = false; };
  }, []);

  const persist = useCallback((update: (current: VoiceMemoEntity[]) => VoiceMemoEntity[]) => {
    const work = writeQueue.current.then(async () => {
      const next = update(memosRef.current);
      try {
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
        memosRef.current = next;
        setMemos(next);
        setStorageError(false);
        return true;
      } catch {
        setStorageError(true);
        return false;
      }
    });
    writeQueue.current = work;
    return work;
  }, []);

  const addMemo = useCallback(
    (memo: VoiceMemoEntity) => persist((current) => [memo, ...current]),
    [persist],
  );

  const updateTranscript = useCallback(
    (id: string, transcript: string) => persist((current) =>
      current.map((memo) => memo.id === id ? { ...memo, transcript } : memo)),
    [persist],
  );

  const removeMemo = useCallback(
    (id: string) => persist((current) => current.filter((memo) => memo.id !== id)),
    [persist],
  );

  return { memos, isLoading, storageError, addMemo, updateTranscript, removeMemo };
}
