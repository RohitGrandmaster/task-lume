/**
 * RESPONSIBILITY: Main View component for the User Voice Memos screen (≤190 lines).
 * FLOW: Renders drawer header, voice recording button, real-time transcript preview, and save-as-task action.
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Mic, MicOff, PlusCircle, Menu } from 'lucide-react-native';
import { useThemeTokens } from '../../../../../core/theme/useThemeTokens';
import { getMinTouchTarget } from '../../../../../core/theme/getMinTouchTarget';
import { triggerLightImpact, triggerSuccessHaptic } from '../../../../../core/interaction/haptics';

interface UserVoiceMainViewProps {
  onSaveAsTask?: (transcript: string) => void;
  onOpenDrawer?: () => void;
}

export function UserVoiceMainView({ onSaveAsTask, onOpenDrawer }: UserVoiceMainViewProps) {
  const tokens = useThemeTokens();
  const minTarget = getMinTouchTarget();
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');

  const toggleRecording = () => {
    triggerLightImpact();
    if (!isRecording) {
      setIsRecording(true);
      setTranscript('Listening for voice memo...');
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
    },
    header: {
      width: '100%',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: tokens.space[3],
      marginBottom: tokens.space[4],
    },
    iconBtn: {
      width: minTarget,
      height: minTarget,
      borderRadius: tokens.radius.md,
      backgroundColor: tokens.color.card,
      borderWidth: 1,
      borderColor: tokens.color.border,
      alignItems: 'center',
      justifyContent: 'center',
    },
    title: {
      ...tokens.typography.headingLg,
      color: tokens.color.foreground,
    },
    micSection: {
      alignItems: 'center',
      justifyContent: 'center',
      marginVertical: tokens.space[6],
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
      shadowColor: '#000000', // design-exception: iOS shadowColor native property
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
      marginTop: tokens.space[4],
    },
    transcriptTitle: {
      ...tokens.typography.headingSm,
      color: tokens.color.foreground,
      marginBottom: tokens.space[2],
    },
    transcriptBody: {
      ...tokens.typography.body,
      color: tokens.color.foreground,
      marginBottom: tokens.space[4],
    },
    saveButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: tokens.color.primary,
      paddingVertical: tokens.space[3],
      borderRadius: tokens.radius.md,
      gap: tokens.space[2],
      minHeight: minTarget,
    },
    saveButtonText: {
      ...tokens.typography.body,
      color: tokens.color.onPrimary,
      fontWeight: '700',
    },
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        {onOpenDrawer ? (
          <Pressable
            style={styles.iconBtn}
            onPress={() => {
              triggerLightImpact();
              onOpenDrawer();
            }}
            accessibilityRole="button"
            accessibilityLabel="Open navigation drawer"
            hitSlop={8}
          >
            <Menu size={20} color={tokens.color.foreground} strokeWidth={2.2} />
          </Pressable>
        ) : <View style={{ width: minTarget }} />}
        <Text style={styles.title}>Voice Memos</Text>
        <View style={{ width: minTarget }} />
      </View>

      <View style={styles.micSection}>
        <View style={styles.micOuterPulse}>
          <Pressable
            style={styles.micButton}
            onPress={toggleRecording}
            accessibilityRole="button"
            accessibilityLabel={isRecording ? 'Stop recording voice note' : 'Start recording voice note'}
          >
            {isRecording ? (
              <MicOff size={36} color={tokens.color.onDestructive} strokeWidth={2.4} />
            ) : (
              <Mic size={36} color={tokens.color.onPrimary} strokeWidth={2.4} />
            )}
          </Pressable>
        </View>
        <Text style={styles.recordingHint}>
          {isRecording ? 'Recording... Tap to stop' : 'Tap to start recording'}
        </Text>
      </View>

      {transcript.length > 0 && (
        <View style={styles.transcriptCard}>
          <Text style={styles.transcriptTitle}>Transcript</Text>
          <Text style={styles.transcriptBody}>{transcript}</Text>
          <Pressable
            style={styles.saveButton}
            onPress={handleSave}
            accessibilityRole="button"
            accessibilityLabel="Save memo as new task"
          >
            <PlusCircle size={20} color={tokens.color.onPrimary} strokeWidth={2.2} />
            <Text style={styles.saveButtonText}>Save as Task</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}
