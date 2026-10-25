/**
 * RESPONSIBILITY: Owns one active native audio player and safely tears it down on route unmount.
 * FLOW: Memo card action → togglePlayback(memo) → Nitro Sound → active memo ID.
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import Sound from 'react-native-nitro-sound';
import { useTranslation } from '../../../../../core/i18n/useTranslation';
import { showToast } from '../../../../../core/toast/showToast';
import type { VoiceMemoEntity } from '../types/user_voice.types';

/**
 * Provides single-player playback for locally stored memo files.
 * @returns Current playing memo ID, play/pause toggle and a targeted stop function.
 * @sideEffects Starts/stops native audio playback.
 */
export function useVoicePlayback() {
  const { t } = useTranslation();
  const [activePlayingId, setActivePlayingId] = useState<string | null>(null);
  const activeRef = useRef<string | null>(null);

  const stopPlayback = useCallback(async (onlyId?: string) => {
    if (!activeRef.current || (onlyId && onlyId !== activeRef.current)) return;
    await Sound.stopPlayer().catch(() => undefined);
    Sound.removePlayBackListener();
    Sound.removePlaybackEndListener();
    activeRef.current = null;
    setActivePlayingId(null);
  }, []);

  useEffect(() => () => {
    if (activeRef.current) {
      Sound.stopPlayer().catch(() => undefined);
      Sound.removePlayBackListener();
      Sound.removePlaybackEndListener();
    }
  }, []);

  const togglePlayback = useCallback(async (memo: VoiceMemoEntity) => {
    if (!memo.audioPath) return;
    if (activeRef.current === memo.id) {
      await stopPlayback(memo.id);
      return;
    }
    await stopPlayback();
    try {
      Sound.addPlaybackEndListener(() => {
        activeRef.current = null;
        setActivePlayingId(null);
      });
      await Sound.startPlayer(memo.audioPath);
      activeRef.current = memo.id;
      setActivePlayingId(memo.id);
    } catch {
      activeRef.current = null;
      setActivePlayingId(null);
      showToast(t('user_voice_memos.PLAYBACK_FAILED'), 'error', `user_voice:playback:failed:${memo.id}`);
    }
  }, [stopPlayback, t]);

  return { activePlayingId, togglePlayback, stopPlayback };
}
