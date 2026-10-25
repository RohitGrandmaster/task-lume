/**
 * RESPONSIBILITY: Main View component for the User Pomodoro Timer screen.
 * FLOW: Renders countdown timer, mode switcher (Focus/Short/Long), interval chips, and start/pause/reset controls.
 */

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Play, Pause, RotateCcw } from 'lucide-react-native';
import type { PomodoroMode } from '../types/user_pomodoro.types';
import { useThemeTokens } from '../../../../core/theme/useThemeTokens';
import { getMinTouchTarget } from '../../../../core/theme/getMinTouchTarget';
import { triggerLightImpact, triggerSuccessHaptic } from '../../../../core/interaction/haptics';

interface UserPomodoroTimerMainViewProps {
  onSessionComplete?: (mode: PomodoroMode, duration: number) => void;
}

export function UserPomodoroTimerMainView({ onSessionComplete }: UserPomodoroTimerMainViewProps) {
  const tokens = useThemeTokens();
  const minTarget = getMinTouchTarget();

  const [mode, setMode] = useState<PomodoroMode>('work');
  const [selectedMinutes, setSelectedMinutes] = useState(25);
  const [secondsLeft, setSecondsLeft] = useState(25 * 60);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    let interval: any = null;
    if (running && secondsLeft > 0) {
      interval = setInterval(() => {
        setSecondsLeft((prev) => prev - 1);
      }, 1000);
    } else if (running && secondsLeft === 0) {
      setRunning(false);
      triggerSuccessHaptic();
      if (onSessionComplete) {
        onSessionComplete(mode, selectedMinutes);
      }
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [running, secondsLeft, mode, selectedMinutes, onSessionComplete]);

  const handleModeChange = (newMode: PomodoroMode) => {
    triggerLightImpact();
    setMode(newMode);
    const mins = newMode === 'work' ? 25 : newMode === 'shortBreak' ? 5 : 15;
    setSelectedMinutes(mins);
    setSecondsLeft(mins * 60);
    setRunning(false);
  };

  const handleTogglePlay = () => {
    triggerLightImpact();
    setRunning((prev) => !prev);
  };

  const handleReset = () => {
    triggerLightImpact();
    setRunning(false);
    setSecondsLeft(selectedMinutes * 60);
  };

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  const timeString = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: tokens.color.background,
      alignItems: 'center',
      paddingHorizontal: tokens.space[4],
      paddingVertical: tokens.space[6],
    },
    modeRow: {
      flexDirection: 'row',
      gap: tokens.space[2],
      marginBottom: tokens.space[8],
    },
    modePill: {
      height: 38,
      paddingHorizontal: tokens.space[4],
      borderRadius: tokens.radius.full,
      backgroundColor: tokens.color.card,
      borderWidth: 1,
      borderColor: tokens.color.border,
      alignItems: 'center',
      justifyContent: 'center',
    },
    modePillActive: {
      backgroundColor: tokens.color.primary,
      borderColor: tokens.color.primary,
    },
    modeText: {
      ...tokens.typography.caption,
      color: tokens.color.muted,
      fontWeight: '600',
    },
    modeTextActive: {
      color: tokens.color.onPrimary,
    },
    timerCircle: {
      width: 240,
      height: 240,
      borderRadius: 120,
      borderWidth: 6,
      borderColor: tokens.color.primary,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: tokens.color.card,
      marginBottom: tokens.space[8],
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 12,
      elevation: 4,
    },
    timerDigits: {
      ...tokens.typography.kpi,
      fontSize: 52,
      lineHeight: 60,
      color: tokens.color.foreground,
    },
    timerModeLabel: {
      ...tokens.typography.caption,
      color: tokens.color.muted,
      textTransform: 'uppercase',
      letterSpacing: 1,
      marginTop: 4,
    },
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
      shadowColor: '#000000',
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
    <View style={styles.container}>
      <View style={styles.modeRow}>
        <Pressable
          style={[styles.modePill, mode === 'work' ? styles.modePillActive : null]}
          onPress={() => handleModeChange('work')}
          accessibilityRole="button"
          accessibilityLabel="Switch to Focus mode"
        >
          <Text style={[styles.modeText, mode === 'work' ? styles.modeTextActive : null]}>Focus</Text>
        </Pressable>

        <Pressable
          style={[styles.modePill, mode === 'shortBreak' ? styles.modePillActive : null]}
          onPress={() => handleModeChange('shortBreak')}
          accessibilityRole="button"
          accessibilityLabel="Switch to Short Break mode"
        >
          <Text style={[styles.modeText, mode === 'shortBreak' ? styles.modeTextActive : null]}>Short Break</Text>
        </Pressable>

        <Pressable
          style={[styles.modePill, mode === 'longBreak' ? styles.modePillActive : null]}
          onPress={() => handleModeChange('longBreak')}
          accessibilityRole="button"
          accessibilityLabel="Switch to Long Break mode"
        >
          <Text style={[styles.modeText, mode === 'longBreak' ? styles.modeTextActive : null]}>Long Break</Text>
        </Pressable>
      </View>

      <View style={styles.timerCircle}>
        <Text style={styles.timerDigits}>{timeString}</Text>
        <Text style={styles.timerModeLabel}>{mode === 'work' ? 'Stay Focused' : 'Rest'}</Text>
      </View>

      <View style={styles.controlsRow}>
        <Pressable
          style={styles.iconButton}
          onPress={handleReset}
          accessibilityRole="button"
          accessibilityLabel="Reset timer"
        >
          <RotateCcw size={20} color={tokens.color.muted} />
        </Pressable>

        <Pressable
          style={styles.playButton}
          onPress={handleTogglePlay}
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
    </View>
  );
}
