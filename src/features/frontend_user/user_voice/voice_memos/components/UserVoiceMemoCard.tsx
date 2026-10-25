/**
 * RESPONSIBILITY: Displays one saved voice memo, manual transcript/notes editing, playback, conversion and confirmed deletion.
 * FLOW: Props are supplied by UserVoiceMainView; audio/storage/task operations remain in hooks.
 */
import React, { useEffect, useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Play, Pause, Trash2, ListTodo } from 'lucide-react-native';
import { useThemeTokens } from '../../../../../core/theme/useThemeTokens';
import { useTranslation } from '../../../../../core/i18n/useTranslation';
import { getMinTouchTarget } from '../../../../../core/theme/getMinTouchTarget';
import type { VoiceMemoEntity } from '../types/user_voice.types';

interface UserVoiceMemoCardProps {
  memo: VoiceMemoEntity;
  isPlaying: boolean;
  onPlayback: (memo: VoiceMemoEntity) => void;
  onSaveTranscript: (id: string, transcript: string) => Promise<boolean>;
  onSaveAsTask: (memo: VoiceMemoEntity) => Promise<boolean>;
  onDelete: (id: string) => Promise<boolean>;
}

/**
 * Presents an audio memo and an explicitly manual transcript field (no fake speech recognition).
 * @param props - Memo metadata and operations from the owning screen hook.
 * @returns Playback/edit/task-conversion actions with confirmation-gated deletion.
 */
export function UserVoiceMemoCard({
  memo,
  isPlaying,
  onPlayback,
  onSaveTranscript,
  onSaveAsTask,
  onDelete,
}: UserVoiceMemoCardProps) {
  const tokens = useThemeTokens();
  const { t } = useTranslation();
  const minTarget = getMinTouchTarget();
  const [transcript, setTranscript] = useState(memo.transcript);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => setTranscript(memo.transcript), [memo.id, memo.transcript]);

  const totalSeconds = Math.floor(memo.durationMs / 1000);
  const duration = `${String(Math.floor(totalSeconds / 60)).padStart(2, '0')}:${String(totalSeconds % 60).padStart(2, '0')}`;
  const styles = StyleSheet.create({
    card: { backgroundColor: tokens.color.card, borderColor: tokens.color.border, borderWidth: 1, borderRadius: tokens.radius.lg, padding: tokens.space[4], marginBottom: tokens.space[3] },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: tokens.space[2] },
    title: { ...tokens.typography.body, color: tokens.color.foreground, fontWeight: '600', flex: 1, marginRight: tokens.space[2] },
    muted: { ...tokens.typography.caption, color: tokens.color.muted },
    actions: { flexDirection: 'row', alignItems: 'center', gap: tokens.space[2], marginTop: tokens.space[3], flexWrap: 'wrap' },
    button: { minHeight: minTarget, minWidth: minTarget, borderRadius: tokens.radius.md, borderColor: tokens.color.border, borderWidth: 1, paddingHorizontal: tokens.space[3], flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: tokens.space[2] },
    primaryButton: { backgroundColor: tokens.color.primary, borderColor: tokens.color.primary },
    buttonText: { ...tokens.typography.caption, color: tokens.color.foreground, fontWeight: '600' },
    primaryText: { ...tokens.typography.caption, color: tokens.color.onPrimary, fontWeight: '700' },
    input: { minHeight: tokens.space[8] * 2, borderColor: tokens.color.border, borderWidth: 1, borderRadius: tokens.radius.md, padding: tokens.space[3], color: tokens.color.foreground, backgroundColor: tokens.color.cardElevated, textAlignVertical: 'top', ...tokens.typography.bodySm },
    modalBackdrop: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: tokens.color.overlayBackdrop, padding: tokens.space[4] },
    modal: { width: '100%', backgroundColor: tokens.color.card, borderRadius: tokens.radius.lg, padding: tokens.space[4], borderWidth: 1, borderColor: tokens.color.border },
    modalTitle: { ...tokens.typography.headingSm, color: tokens.color.foreground, marginBottom: tokens.space[2] },
    modalBody: { ...tokens.typography.bodySm, color: tokens.color.muted, marginBottom: tokens.space[4] },
  });

  const saveTranscript = async () => { await onSaveTranscript(memo.id, transcript); };

  return (
    <View style={styles.card} testID={`user_voice-memo-${memo.id}`}>
      <View style={styles.header}>
        <Text style={styles.title} numberOfLines={2}>{memo.title}</Text>
        <Text style={styles.muted}>{duration}</Text>
      </View>
      <Text style={styles.muted}>{new Date(memo.createdAt).toLocaleString()}</Text>
      <Text style={[styles.title, { marginTop: tokens.space[3], marginBottom: tokens.space[2] }]}>
        {t('user_voice_memos.TRANSCRIPT_LABEL')}
      </Text>
      <TextInput
        value={transcript}
        onChangeText={setTranscript}
        onBlur={() => { if (transcript !== memo.transcript) void saveTranscript(); }}
        style={styles.input}
        multiline
        placeholder={t('user_voice_memos.TRANSCRIPT_PLACEHOLDER')}
        placeholderTextColor={tokens.color.muted}
        accessibilityLabel={t('user_voice_memos.TRANSCRIPT_LABEL')}
        accessibilityHint={t('user_voice_memos.TRANSCRIPT_HINT')}
        testID={`user_voice-transcript-${memo.id}`}
      />
      <View style={styles.actions}>
        <Pressable style={styles.button} onPress={() => onPlayback(memo)} accessibilityRole="button" accessibilityLabel={t(isPlaying ? 'user_voice_memos.PAUSE_AUDIO' : 'user_voice_memos.PLAY_AUDIO')} testID={`user_voice-play-${memo.id}`}>
          {isPlaying ? <Pause size={tokens.icon.sm} color={tokens.color.foreground} /> : <Play size={tokens.icon.sm} color={tokens.color.foreground} />}
          <Text style={styles.buttonText}>{t(isPlaying ? 'user_voice_memos.PAUSE_AUDIO' : 'user_voice_memos.PLAY_AUDIO')}</Text>
        </Pressable>
        <Pressable style={[styles.button, styles.primaryButton]} onPress={() => onSaveAsTask(memo)} disabled={!transcript.trim() || busy} accessibilityRole="button" accessibilityLabel={t('user_voice_memos.CONVERT_TO_TASK')} testID={`user_voice-convert-${memo.id}`}>
          <ListTodo size={tokens.icon.sm} color={tokens.color.onPrimary} />
          <Text style={styles.primaryText}>{t('user_voice_memos.CONVERT_TO_TASK')}</Text>
        </Pressable>
        <Pressable style={styles.button} onPress={() => setConfirmDelete(true)} accessibilityRole="button" accessibilityLabel={t('user_voice_memos.DELETE_MEMO')} testID={`user_voice-delete-${memo.id}`}>
          <Trash2 size={tokens.icon.sm} color={tokens.color.destructive} />
        </Pressable>
      </View>
      <Modal visible={confirmDelete} transparent animationType="none" onRequestClose={() => setConfirmDelete(false)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modal} accessible accessibilityViewIsModal accessibilityLabel={t('user_voice_memos.DELETE_MEMO_CONFIRM_TITLE')}>
            <Text accessibilityRole="header" style={styles.modalTitle}>{t('user_voice_memos.DELETE_MEMO_CONFIRM_TITLE')}</Text>
            <Text style={styles.modalBody}>{t('user_voice_memos.DELETE_MEMO_CONFIRM_BODY')}</Text>
            <View style={styles.actions}>
              <Pressable style={styles.button} disabled={busy} onPress={() => setConfirmDelete(false)} accessibilityRole="button" accessibilityLabel={t('user_voice_memos.CANCEL')}>
                <Text style={styles.buttonText}>{t('user_voice_memos.CANCEL')}</Text>
              </Pressable>
              <Pressable
                style={[styles.button, styles.primaryButton]}
                disabled={busy}
                onPress={async () => { setBusy(true); const deleted = await onDelete(memo.id); setBusy(false); if (deleted) setConfirmDelete(false); }}
                accessibilityRole="button"
                accessibilityLabel={t('user_voice_memos.CONFIRM_DELETE')}
                testID={`user_voice-confirm-delete-${memo.id}`}
              >
                <Text style={styles.primaryText}>{t('user_voice_memos.CONFIRM_DELETE')}</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}
