/**
 * RESPONSIBILITY: Renders accessible start/stop recording controls and truthful elapsed-time feedback.
 * FLOW: User action → callback from UserVoiceMainView → native recorder hook; this component owns no recording side effects.
 */
import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { Mic, Square } from 'lucide-react-native';
import { useThemeTokens } from '../../../../../core/theme/useThemeTokens';
import { useTranslation } from '../../../../../core/i18n/useTranslation';
import { getMinTouchTarget } from '../../../../../core/theme/getMinTouchTarget';

interface UserVoiceAudioRecorderProps {
  isRecording: boolean;
  isProcessing: boolean;
  elapsedMs: number;
  onStart: () => void;
  onStop: () => void;
}

/**
 * Presents recording status without simulating capture or inventing progress.
 * @param props - Native recorder state and start/stop actions.
 * @returns Accessible microphone control and elapsed recording time.
 */
export function UserVoiceAudioRecorder({
  isRecording,
  isProcessing,
  elapsedMs,
  onStart,
  onStop,
}: UserVoiceAudioRecorderProps) {
  const tokens = useThemeTokens();
  const { t } = useTranslation();
  const minTarget = getMinTouchTarget();
  const totalSeconds = Math.floor(elapsedMs / 1000);
  const elapsed = `${String(Math.floor(totalSeconds / 60)).padStart(2, '0')}:${String(totalSeconds % 60).padStart(2, '0')}`;

  const styles = StyleSheet.create({
    container: { alignItems: 'center', paddingVertical: tokens.space[4] },
    button: {
      minWidth: minTarget * 2,
      minHeight: minTarget * 2,
      borderRadius: tokens.radius.full,
      backgroundColor: isRecording ? tokens.color.destructive : tokens.color.primary,
      alignItems: 'center',
      justifyContent: 'center',
      opacity: isProcessing ? tokens.opacity.loading : 1,
    },
    time: { ...tokens.typography.headingSm, color: tokens.color.foreground, marginTop: tokens.space[3] },
    status: { ...tokens.typography.bodySm, color: tokens.color.muted, marginTop: tokens.space[1] },
  });

  return (
    <View style={styles.container}>
      <Pressable
        style={styles.button}
        onPress={isRecording ? onStop : onStart}
        disabled={isProcessing}
        accessibilityRole="button"
        accessibilityLabel={isRecording ? t('user_voice_memos.STOP_RECORDING') : t('user_voice_memos.START_RECORDING')}
        accessibilityHint={t('user_voice_memos.RECORDING_CONTROL_HINT')}
        testID="user_voice-record-toggle"
      >
        {isProcessing ? (
          <ActivityIndicator color={tokens.color.onPrimary} />
        ) : isRecording ? (
          <Square size={tokens.icon.lg} color={tokens.color.onDestructive} />
        ) : (
          <Mic size={tokens.icon.lg} color={tokens.color.onPrimary} />
        )}
      </Pressable>
      <Text style={styles.time} accessibilityLiveRegion="polite">{elapsed}</Text>
      <Text style={styles.status}>
        {isProcessing
          ? t('user_voice_memos.PROCESSING_RECORDING')
          : isRecording
            ? t('user_voice_memos.RECORDING_IN_PROGRESS')
            : t('user_voice_memos.RECORDING_IDLE')}
      </Text>
    </View>
  );
}
