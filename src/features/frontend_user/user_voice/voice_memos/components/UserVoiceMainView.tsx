/**
 * RESPONSIBILITY: Shows the Voice Memo entry point and clearly communicates when native speech recognition is unavailable.
 * FLOW: UserVoiceScreen → UserVoiceMainView; no fabricated transcript, recording timer, or save-success state is generated.
 */
import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Mic, Menu } from 'lucide-react-native';
import { useThemeTokens } from '../../../../../core/theme/useThemeTokens';
import { getMinTouchTarget } from '../../../../../core/theme/getMinTouchTarget';

interface UserVoiceMainViewProps {
  onOpenDrawer?: () => void;
}

/**
 * Displays a truthful unavailable state until an approved speech-recognition implementation exists.
 * @param props - Optional navigation drawer handler.
 * @returns An accessible screen that does not simulate recording or manufacture transcript content.
 */
export function UserVoiceMainView({ onOpenDrawer }: UserVoiceMainViewProps) {
  const tokens = useThemeTokens();
  const minTarget = getMinTouchTarget();

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
    iconButton: {
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
    micButton: {
      width: tokens.layout.fabSize,
      height: tokens.layout.fabSize,
      borderRadius: tokens.radius.full,
      backgroundColor: tokens.color.cardElevated,
      borderWidth: 1,
      borderColor: tokens.color.border,
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: tokens.space[8],
      marginBottom: tokens.space[4],
      opacity: tokens.opacity.disabled,
    },
    message: {
      ...tokens.typography.body,
      color: tokens.color.foreground,
      textAlign: 'center',
      marginBottom: tokens.space[2],
    },
    detail: {
      ...tokens.typography.bodySm,
      color: tokens.color.muted,
      textAlign: 'center',
    },
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        {onOpenDrawer ? (
          <Pressable
            style={styles.iconButton}
            onPress={() => {
              onOpenDrawer();
            }}
            accessibilityRole="button"
            accessibilityLabel="Open navigation drawer"
            testID="user_voice-open-drawer"
          >
            <Menu size={tokens.icon.md} color={tokens.color.foreground} />
          </Pressable>
        ) : <View style={{ width: minTarget }} />}
        <Text style={styles.title}>Voice Memos</Text>
        <View style={{ width: minTarget }} />
      </View>

      <View
        style={styles.micButton}
        accessible
        accessibilityRole="image"
        accessibilityLabel="Voice recording unavailable"
        testID="user_voice-recording-unavailable"
      >
        <Mic size={tokens.icon.lg} color={tokens.color.muted} />
      </View>
      <Text style={styles.message}>Voice recording is unavailable in this build.</Text>
      <Text style={styles.detail}>
        The configured speech-recognition dependency is archived. Recording and transcription must be connected to an approved, supported native integration before this action can be enabled.
      </Text>
    </View>
  );
}
