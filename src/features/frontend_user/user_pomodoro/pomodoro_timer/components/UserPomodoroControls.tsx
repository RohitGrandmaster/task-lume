/**
 * RESPONSIBILITY: Interactive play/pause and reset control buttons for Pomodoro timer.
 * FLOW: Rendered in UserPomodoroTimerMainView; emits toggle play and reset events.
 */

import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { Play, Pause, RotateCcw } from 'lucide-react-native';
import { useThemeTokens } from '../../../../core/theme/useThemeTokens';
import { getMinTouchTarget } from '../../../../core/theme/getMinTouchTarget';

interface UserPomodoroControlsProps {
  running: boolean;
  onTogglePlay: () => void;
  onReset: () => void;
}

export function UserPomodoroControls({
  running,
  onTogglePlay,
  onReset,
}: UserPomodoroControlsProps) {
  const tokens = useThemeTokens();
  const minTarget = getMinTouchTarget();

  const styles = StyleSheet.create({
    controlsRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: tokens.space[5],
    },
    playButton: {
      width: 68,
      height: 68,
      borderRadius: 34,
      backgroundColor: tokens.color.primary,
      alignItems: 'center',
      justifyContent: 'center',
      shadowColor: '#000000', // design-exception: iOS shadowColor native property
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.2,
      shadowRadius: 8,
      elevation: 6,
    },
    iconButton: {
      width: minTarget,
      height: minTarget,
      borderRadius: tokens.radius.full,
      backgroundColor: tokens.color.card,
      borderWidth: 1,
      borderColor: tokens.color.border,
      alignItems: 'center',
      justifyContent: 'center',
    },
  });

  return (
    <View style={styles.controlsRow}>
      <Pressable
        style={styles.iconButton}
        onPress={onReset}
        accessibilityRole="button"
        accessibilityLabel="Reset timer"
      >
        <RotateCcw size={20} color={tokens.color.muted} />
      </Pressable>

      <Pressable
        style={styles.playButton}
        onPress={onTogglePlay}
        accessibilityRole="button"
        accessibilityLabel={running ? 'Pause timer' : 'Start timer'}
      >
        {running ? (
          <Pause size={28} color={tokens.color.onPrimary} fill={tokens.color.onPrimary} />
        ) : (
          <Play size={28} color={tokens.color.onPrimary} fill={tokens.color.onPrimary} style={{ marginLeft: 3 }} />
        )}
      </Pressable>
    </View>
  );
}
