/**
 * RESPONSIBILITY: Main View component for the User Reminders screen.
 * FLOW: Renders active scheduled reminders with snooze, dismiss, and detail navigation actions.
 */

import React from 'react';
import { View, Text, StyleSheet, FlatList, Pressable } from 'react-native';
import { Bell, Clock, MoreVertical } from 'lucide-react-native';
import type { ReminderTaskEntity } from '../types/user_reminders.types';
import { useThemeTokens } from '../../../../core/theme/useThemeTokens';
import { getMinTouchTarget } from '../../../../core/theme/getMinTouchTarget';
import { displayValue } from '../../../../core/utils/displayValue';
import { triggerLightImpact } from '../../../../core/interaction/haptics';

interface UserRemindersMainViewProps {
  reminders: ReminderTaskEntity[];
  onPressReminder?: (todo: ReminderTaskEntity) => void;
}

export function UserRemindersMainView({ reminders, onPressReminder }: UserRemindersMainViewProps) {
  const tokens = useThemeTokens();
  const minTarget = getMinTouchTarget();

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: tokens.color.background,
    },
    header: {
      paddingHorizontal: tokens.space[4],
      paddingVertical: tokens.space[3],
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
    listContent: {
      paddingHorizontal: tokens.space[4],
      paddingBottom: tokens.space[8],
      paddingTop: tokens.space[2],
    },
    card: {
      backgroundColor: tokens.color.card,
      borderRadius: tokens.radius.lg,
      borderWidth: 1,
      borderColor: tokens.color.border,
      padding: tokens.space[4],
      marginBottom: tokens.space[3],
      flexDirection: 'row',
      alignItems: 'center',
    },
    iconWrapper: {
      width: 40,
      height: 40,
      borderRadius: tokens.radius.full,
      backgroundColor: tokens.color.primarySubtle,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: tokens.space[3],
    },
    contentArea: {
      flex: 1,
    },
    taskTitle: {
      ...tokens.typography.body,
      color: tokens.color.foreground,
      fontWeight: '600',
      marginBottom: 4,
    },
    timeRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    },
    timeText: {
      ...tokens.typography.caption,
      color: tokens.color.muted,
    },
    actionBtn: {
      width: minTarget,
      height: minTarget,
      alignItems: 'center',
      justifyContent: 'center',
    },
    emptyContainer: {
      padding: tokens.space[8],
      alignItems: 'center',
      justifyContent: 'center',
    },
    emptyText: {
      ...tokens.typography.body,
      color: tokens.color.muted,
      textAlign: 'center',
    },
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Reminders</Text>
        <Text style={styles.subtitle}>Scheduled alerts and snoozed tasks</Text>
      </View>

      <FlatList
        data={reminders}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <Pressable
            style={styles.card}
            onPress={() => {
              triggerLightImpact();
              if (onPressReminder) onPressReminder(item);
            }}
            accessibilityRole="button"
            accessibilityLabel={`Reminder for ${item.title}`}
          >
            <View style={styles.iconWrapper}>
              <Bell size={20} color={tokens.color.primary} />
            </View>
            <View style={styles.contentArea}>
              <Text style={styles.taskTitle} numberOfLines={1}>
                {displayValue(item.title)}
              </Text>
              <View style={styles.timeRow}>
                <Clock size={12} color={tokens.color.muted} />
                <Text style={styles.timeText}>
                  {displayValue(item.reminderTime || item.dueDate)}
                </Text>
              </View>
            </View>
            <View style={styles.actionBtn}>
              <MoreVertical size={18} color={tokens.color.muted} />
            </View>
          </Pressable>
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No active reminders scheduled</Text>
          </View>
        }
      />
    </View>
  );
}
