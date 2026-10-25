/**
 * RESPONSIBILITY: Main View component for the User Pomodoro Timer screen (≤180 lines).
 * FLOW: Renders drawer header, countdown timer, mode switcher (Focus/Short/Long), and UserPomodoroControls.
 */

import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Menu } from 'lucide-react-native';
import type { PomodoroMode } from '../types/user_pomodoro.types';
import { UserPomodoroControls } from './UserPomodoroControls';
import { UserPomodoroModeSelector } from './UserPomodoroModeSelector';
import { useThemeTokens } from '../../../../../core/theme/useThemeTokens';
import { getMinTouchTarget } from '../../../../../core/theme/getMinTouchTarget';
import { useUserPomodoro } from '../hooks/useUserPomodoro';
import { triggerLightImpact } from '../../../../../core/interaction/haptics';

interface UserPomodoroTimerMainViewProps {
  onSessionComplete?: (mode: PomodoroMode, duration: number) => void;
  onOpenDrawer?: () => void;
}

export function UserPomodoroTimerMainView({
  onSessionComplete,
  onOpenDrawer,
}: UserPomodoroTimerMainViewProps) {
  const tokens = useThemeTokens();
  const minTarget = getMinTouchTarget();

  const { timer, setMode, startTimer, pauseTimer, resetTimer } = useUserPomodoro(onSessionComplete);
  const { mode, secondsLeft, running } = timer;

  const handleModeChange = (newMode: PomodoroMode) => setMode(newMode);
  const handleTogglePlay = () => (running ? pauseTimer() : startTimer());
  const handleReset = () => resetTimer();

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  const timeString = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: tokens.color.background,
      alignItems: 'center',
      paddingHorizontal: tokens.space[4],
    },
    topHeader: {
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
    timerCircle: {
      width: 240,
      height: 240,
      borderRadius: 120,
      borderWidth: 8,
      borderColor: tokens.color.primary,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: tokens.color.card,
      marginBottom: tokens.space[8],
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
  });

  return (
    <View style={styles.container}>
      <View style={styles.topHeader}>
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
        <Text style={styles.title}>Focus Timer</Text>
        <View style={{ width: minTarget }} />
      </View>

      <UserPomodoroModeSelector
        currentMode={mode}
        onSelectMode={handleModeChange}
      />

      <View style={styles.timerCircle}>
        <Text style={styles.timerDigits}>{timeString}</Text>
        <Text style={styles.timerModeLabel}>{mode === 'work' ? 'Stay Focused' : 'Rest'}</Text>
      </View>

      <UserPomodoroControls
        running={running}
        onTogglePlay={handleTogglePlay}
        onReset={handleReset}
      />
    </View>
  );
}
