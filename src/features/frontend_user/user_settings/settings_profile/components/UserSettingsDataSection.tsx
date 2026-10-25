/**
 * RESPONSIBILITY: Data management and backup/restore controls for User Settings.
 * FLOW: Handles JSON export/import and data maintenance actions.
 */

import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Download, Upload, Trash2, RotateCcw } from 'lucide-react-native';
import { useThemeTokens } from '../../../../../core/theme/useThemeTokens';
import { getMinTouchTarget } from '../../../../../core/theme/getMinTouchTarget';

interface UserSettingsDataSectionProps {
  onExport: () => void;
  onImport: () => void;
  onClearCompleted: () => void;
  onEmptyTrash: () => void;
}

export function UserSettingsDataSection({
  onExport,
  onImport,
  onClearCompleted,
  onEmptyTrash,
}: UserSettingsDataSectionProps) {
  const tokens = useThemeTokens();
  const minTarget = getMinTouchTarget();

  const styles = StyleSheet.create({
    section: {
      backgroundColor: tokens.color.card,
      borderRadius: tokens.radius.lg,
      borderWidth: 1,
      borderColor: tokens.color.border,
      marginBottom: tokens.space[4],
      overflow: 'hidden',
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: tokens.space[4],
      minHeight: minTarget,
      borderBottomWidth: 1,
      borderBottomColor: tokens.color.border,
    },
    lastRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: tokens.space[4],
      minHeight: minTarget,
    },
    leftContent: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: tokens.space[3],
    },
    label: {
      ...tokens.typography.body,
      color: tokens.color.foreground,
      fontWeight: '500',
    },
    dangerLabel: {
      ...tokens.typography.body,
      color: tokens.color.destructive,
      fontWeight: '600',
    },
  });

  return (
    <View style={styles.section}>
      <Pressable
        style={styles.row}
        onPress={onExport}
        accessibilityRole="button"
        accessibilityLabel="Backup data to JSON"
      >
        <View style={styles.leftContent}>
          <Download size={18} color={tokens.color.primary} />
          <Text style={styles.label}>Backup Tasks (JSON)</Text>
        </View>
      </Pressable>

      <Pressable
        style={styles.row}
        onPress={onImport}
        accessibilityRole="button"
        accessibilityLabel="Restore data from JSON"
      >
        <View style={styles.leftContent}>
          <Upload size={18} color={tokens.color.primary} />
          <Text style={styles.label}>Restore Tasks (JSON)</Text>
        </View>
      </Pressable>

      <Pressable
        style={styles.row}
        onPress={onClearCompleted}
        accessibilityRole="button"
        accessibilityLabel="Clear completed tasks"
      >
        <View style={styles.leftContent}>
          <Trash2 size={18} color={tokens.color.muted} />
          <Text style={styles.label}>Clear Completed Tasks</Text>
        </View>
      </Pressable>

      <Pressable
        style={styles.lastRow}
        onPress={onEmptyTrash}
        accessibilityRole="button"
        accessibilityLabel="Empty trash permanently"
      >
        <View style={styles.leftContent}>
          <RotateCcw size={18} color={tokens.color.destructive} />
          <Text style={styles.dangerLabel}>Empty Trash Permanently</Text>
        </View>
      </Pressable>
    </View>
  );
}
