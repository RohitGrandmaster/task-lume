/**
 * RESPONSIBILITY: Main View component for the User Voice Memos screen.
 * FLOW: Renders voice recording button, real-time transcript preview, and save-as-task action.
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Mic, MicOff, PlusCircle } from 'lucide-react-native';
import { useThemeTokens } from '../../../../core/theme/useThemeTokens';
import { getMinTouchTarget } from '../../../../core/theme/getMinTouchTarget';
import { triggerLightImpact, triggerSuccessHaptic } from '../../../../core/interaction/haptics';

interface UserVoiceMainViewProps {
  onSaveAsTask?: (transcript: string) => void;
}

export function UserVoiceMainView({ onSaveAsTask }: UserVoiceMainViewProps) {
  const tokens = useThemeTokens();
  const minTarget = getMinTouchTarget();
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');

  const toggleRecording = () => {
    triggerLightImpact();
    if (!isRecording) {
      setIsRecording(true);
      setTranscript('Listening for voice memo...');
      // Simulated voice recognition feedback
      setTimeout(() => {
        setTranscript('Remember to submit weekly project deliverables by Friday evening.');
      }, 2000);
    } else {
      setIsRecording(false);
    }
  };

  const handleSave = () => {
    if (transcript.trim().length > 0 && onSaveAsTask) {
      triggerSuccessHaptic();
      onSaveAsTask(transcript);
      setTranscript('');
    }
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: tokens.color.background,
      alignItems: 'center',
      paddingHorizontal: tokens.space[4],
      paddingVertical: tokens.space[6],
    },
    header: {
      alignSelf: 'stretch',
      marginBottom: tokens.space[6],
    },
    title: {
      ...tokens.typography.headingLg,
      color: tokens.color.foreground,
      marginBottom: 2,
    },
    subtitle: {
      ...tokens.typography.bodySm,
      color: tokens.color.muted,
    },
    micSection: {
      alignItems: 'center',
      justifyContent: 'center',
      marginVertical: tokens.space[8],
    },
    micOuterPulse: {
      width: 140,
      height: 140,
      borderRadius: 70,
      backgroundColor: isRecording ? tokens.color.primarySubtle : 'transparent',
      alignItems: 'center',
      justifyContent: 'center',
    },
    micButton: {
      width: 88,
      height: 88,
      borderRadius: 44,
      backgroundColor: isRecording ? tokens.color.destructive : tokens.color.primary,
      alignItems: 'center',
      justifyContent: 'center',
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.25,
      shadowRadius: 10,
      elevation: 6,
    },
    recordingHint: {
      ...tokens.typography.caption,
      color: tokens.color.muted,
      marginTop: tokens.space[3],
    },
    transcriptCard: {
      alignSelf: 'stretch',
      backgroundColor: tokens.color.card,
      borderRadius: tokens.radius.lg,
      borderWidth: 1,
      borderColor: tokens.color.border,
      padding: tokens.space[4],
      minHeight: 100,
      marginBottom: tokens.space[5],
    },
    transcriptText: {
      ...tokens.typography.body,
      color: transcript ? tokens.color.foreground : tokens.color.muted,
      lineHeight: 22,
    },
    saveButton: {
      height: minTarget,
      paddingHorizontal: tokens.space[6],
      backgroundColor: tokens.color.primary,
      borderRadius: tokens.radius.md,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: tokens.space[2],
      minWidth: tokens.layout.buttonMinWidth,
    },
    saveButtonText: {
      ...tokens.typography.bodySm,
      color: tokens.color.onPrimary,
      fontWeight: '700',
    },
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Voice Memos</Text>
        <Text style={styles.subtitle}>Tap the microphone and speak your task</Text>
      </View>

      <View style={styles.micSection}>
        <View style={styles.micOuterPulse}>
          <Pressable
            style={styles.micButton}
            onPress={toggleRecording}
            accessibilityRole="button"
            accessibilityLabel={isRecording ? 'Stop recording' : 'Start voice recording'}
          >
            {isRecording ? (
              <MicOff size={36} color={tokens.color.onDestructive} />
            ) : (
              <Mic size={36} color={tokens.color.onPrimary} />
            )}
          </Pressable>
        </View>
        <Text style={styles.recordingHint}>
          {isRecording ? 'Recording... Tap to stop' : 'Tap to start speaking'}
        </Text>
      </View>

      <View style={styles.transcriptCard}>
        <Text style={styles.transcriptText}>
          {transcript || 'Your transcribed speech will appear here...'}
        </Text>
      </View>

      {Boolean(transcript && transcript !== 'Listening for voice memo...') && (
        <Pressable
          style={styles.saveButton}
          onPress={handleSave}
          accessibilityRole="button"
          accessibilityLabel="Convert transcript to task"
        >
          <PlusCircle size={18} color={tokens.color.onPrimary} />
          <Text style={styles.saveButtonText}>Convert to Task</Text>
        </Pressable>
      )}
    </View>
  );
}
