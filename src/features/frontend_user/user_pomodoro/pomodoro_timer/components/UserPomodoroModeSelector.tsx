/**
 * RESPONSIBILITY: Mode selector pill buttons for User Pomodoro Timer (≤60 lines).
 * FLOW: Renders Focus, Short Break, and Long Break pills with active state.
 */

import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import type { PomodoroMode } from '../types/user_pomodoro.types';
import { useThemeTokens } from '../../../../../core/theme/useThemeTokens';
import { triggerLightImpact } from '../../../../../core/interaction/haptics';

interface UserPomodoroModeSelectorProps {
  currentMode: PomodoroMode;
  onSelectMode: (mode: PomodoroMode) => void;
}

export function UserPomodoroModeSelector({
  currentMode,
  onSelectMode,
}: UserPomodoroModeSelectorProps) {
  const tokens = useThemeTokens();

  const modes: Array<{ key: PomodoroMode; label: string }> = [
    { key: 'work', label: 'Focus' },
    { key: 'shortBreak', label: 'Short Break' },
    { key: 'longBreak', label: 'Long Break' },
  ];

  const styles = StyleSheet.create({
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
      fontWeight: '700',
    },
  });

  return (
    <View style={styles.modeRow}>
      {modes.map((m) => {
        const isActive = currentMode === m.key;
        return (
          <Pressable
            key={m.key}
            style={[styles.modePill, isActive ? styles.modePillActive : null]}
            onPress={() => {
              triggerLightImpact();
              onSelectMode(m.key);
            }}
            accessibilityRole="button"
            accessibilityLabel={`Switch to ${m.label} mode`}
          >
            <Text style={[styles.modeText, isActive ? styles.modeTextActive : null]}>
              {m.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
