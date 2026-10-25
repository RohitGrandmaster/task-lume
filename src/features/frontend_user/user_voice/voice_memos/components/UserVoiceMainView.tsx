/**
 * RESPONSIBILITY: Composes the live audio recorder, persisted memo list, playback, and transcript-to-task actions.
 * FLOW: Screen → this view → useUserVoice → native recording/playback + local memo metadata.
 */
import React from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { Menu } from 'lucide-react-native';
import { useThemeTokens } from '../../../../../core/theme/useThemeTokens';
import { useTranslation } from '../../../../../core/i18n/useTranslation';
import { getMinTouchTarget } from '../../../../../core/theme/getMinTouchTarget';
import { UserVoiceAudioRecorder } from './UserVoiceAudioRecorder';
import { UserVoiceEmptyState } from './UserVoiceEmptyState';
import { UserVoiceErrorFallback } from './UserVoiceErrorFallback';
import { UserVoiceMemoCard } from './UserVoiceMemoCard';
import { UserVoiceSkeleton } from './UserVoiceSkeleton';
import { useUserVoice } from '../hooks/useUserVoice';

interface UserVoiceMainViewProps {
  onOpenDrawer?: () => void;
}

/**
 * Renders working recording/playback controls and accurately labels manual transcript entry.
 * @param props - Optional navigation drawer action.
 * @returns Voice recorder, persisted memo list and task conversion UI.
 * @sideEffects Starts/stops native audio and persists memo metadata through feature hooks.
 */
export function UserVoiceMainView({ onOpenDrawer }: UserVoiceMainViewProps) {
  const tokens = useThemeTokens();
  const { t } = useTranslation();
  const minTarget = getMinTouchTarget();
  const voice = useUserVoice();

  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: tokens.color.background, paddingHorizontal: tokens.space[4] },
    header: { width: '100%', minHeight: tokens.layout.headerHeight, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: tokens.space[2] },
    iconButton: { width: minTarget, height: minTarget, borderRadius: tokens.radius.md, backgroundColor: tokens.color.card, borderWidth: 1, borderColor: tokens.color.border, alignItems: 'center', justifyContent: 'center' },
    title: { ...tokens.typography.headingLg, color: tokens.color.foreground },
    subtitle: { ...tokens.typography.bodySm, color: tokens.color.muted, marginTop: tokens.space[2], textAlign: 'center' },
    sectionTitle: { ...tokens.typography.headingSm, color: tokens.color.foreground, marginTop: tokens.space[4], marginBottom: tokens.space[2] },
    loading: { paddingVertical: tokens.space[4], alignItems: 'center' },
    error: { ...tokens.typography.bodySm, color: tokens.color.statusDangerText, padding: tokens.space[3], textAlign: 'center' },
    list: { paddingTop: tokens.space[2], paddingBottom: tokens.space[7] },
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        {onOpenDrawer ? (
          <Pressable style={styles.iconButton} onPress={onOpenDrawer} accessibilityRole="button" accessibilityLabel={t('user_voice_memos.OPEN_DRAWER')} testID="user_voice-open-drawer">
            <Menu size={tokens.icon.md} color={tokens.color.foreground} />
          </Pressable>
        ) : <View style={{ width: minTarget }} />}
        <Text style={styles.title}>{t('user_voice_memos.PAGE_TITLE')}</Text>
        <View style={{ width: minTarget }} />
      </View>

      <UserVoiceAudioRecorder
        isRecording={voice.isRecording}
        isProcessing={voice.isProcessing}
        elapsedMs={voice.elapsedMs}
        onStart={() => { void voice.startRecording(); }}
        onStop={() => { void voice.stopRecording(); }}
      />
      <Text style={styles.subtitle}>{t('user_voice_memos.VOICE_CAPTURE_CONTRACT')}</Text>
      {voice.recordingError && (
        <UserVoiceErrorFallback
          message={t('user_voice_memos.RECORDING_ERROR')}
          onRetry={() => { void voice.startRecording(); }}
        />
      )}
      {voice.storageError && <Text style={styles.error}>{t('user_voice_memos.STORAGE_ERROR')}</Text>}
      <Text style={styles.sectionTitle}>{t('user_voice_memos.SAVED_MEMOS')}</Text>
      {voice.isLoading ? (
        <View style={styles.loading}><ActivityIndicator color={tokens.color.primary} /></View>
      ) : voice.isLoading ? (
        <UserVoiceSkeleton />
      ) : (
        <FlatList
          data={voice.memos}
          keyExtractor={(memo) => memo.id}
          renderItem={({ item }) => (
            <UserVoiceMemoCard
              memo={item}
              isPlaying={voice.activePlayingId === item.id}
              onPlayback={(memo) => { void voice.togglePlayback(memo); }}
              onSaveTranscript={voice.updateTranscript}
              onSaveAsTask={voice.saveAsTask}
              onDelete={voice.deleteMemo}
            />
          )}
          ListEmptyComponent={<UserVoiceEmptyState title={t('user_voice_memos.EMPTY_TITLE')} description={t('user_voice_memos.EMPTY_DESCRIPTION')} />}
          contentContainerStyle={styles.list}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          testID="user_voice-memo-list"
        />
      )}
    </View>
  );
}
