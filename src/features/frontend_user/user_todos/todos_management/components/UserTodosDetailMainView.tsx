/**
 * RESPONSIBILITY: Main View component for the User Todos Detail screen.
 * FLOW: Renders complete task specifications, priority badge, and actionable controls (edit, delete, toggle).
 */

import React from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { Calendar, Tag, Trash2, Edit3, CheckCircle2, Star } from 'lucide-react-native';
import type { TodoEntity } from '../types/user_todos.types';
import { useThemeTokens } from '../../../../../core/theme/useThemeTokens';
import { getMinTouchTarget } from '../../../../../core/theme/getMinTouchTarget';
import { getPriorityBadgeStyle } from '../utils/userTodosFormatters';
import { displayValue } from '../../../../../core/utils/displayValue';
import { triggerLightImpact, triggerSuccessHaptic } from '../../../../../core/interaction/haptics';

interface UserTodosDetailMainViewProps {
  todo: TodoEntity;
  onEdit: () => void;
  onDelete: () => void;
  onToggleComplete: () => void;
  onToggleFavorite: () => void;
}

export function UserTodosDetailMainView({
  todo,
  onEdit,
  onDelete,
  onToggleComplete,
  onToggleFavorite,
}: UserTodosDetailMainViewProps) {
  const tokens = useThemeTokens();
  const minTarget = getMinTouchTarget();
  const priorityStyle = getPriorityBadgeStyle(todo.priority, tokens);

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: tokens.color.background,
      padding: tokens.space[4],
    },
    card: {
      backgroundColor: tokens.color.card,
      borderRadius: tokens.radius.lg,
      borderWidth: 1,
      borderColor: tokens.color.border,
      padding: tokens.space[5],
      marginBottom: tokens.space[4],
    },
    title: {
      ...tokens.typography.headingLg,
      color: todo.completed ? tokens.color.muted : tokens.color.foreground,
      textDecorationLine: todo.completed ? 'line-through' : 'none',
      marginBottom: tokens.space[3],
    },
    badgeRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: tokens.space[2],
      marginBottom: tokens.space[4],
    },
    badge: {
      paddingHorizontal: tokens.space[3],
      paddingVertical: 4,
      borderRadius: tokens.radius.sm,
      backgroundColor: priorityStyle.backgroundColor,
    },
    badgeText: {
      ...tokens.typography.caption,
      color: priorityStyle.textColor,
      fontWeight: '600',
    },
    description: {
      ...tokens.typography.body,
      color: tokens.color.foreground,
      lineHeight: 24,
      marginBottom: tokens.space[4],
    },
    metaSection: {
      borderTopWidth: 1,
      borderTopColor: tokens.color.border,
      paddingTop: tokens.space[4],
      gap: tokens.space[3],
    },
    metaItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: tokens.space[3],
    },
    metaText: {
      ...tokens.typography.bodySm,
      color: tokens.color.muted,
    },
    actionRow: {
      flexDirection: 'row',
      gap: tokens.space[3],
      marginTop: tokens.space[4],
    },
    actionButton: {
      flex: 1,
      height: minTarget,
      borderRadius: tokens.radius.md,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: tokens.space[2],
    },
    editButton: {
      backgroundColor: tokens.color.primary,
    },
    deleteButton: {
      backgroundColor: tokens.color.statusDangerBg,
    },
    actionButtonText: {
      ...tokens.typography.bodySm,
      fontWeight: '600',
    },
  });

  return (
    <ScrollView style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>{todo.title}</Text>

        <View style={styles.badgeRow}>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{priorityStyle.label}</Text>
          </View>
        </View>

        {Boolean(todo.description) && (
          <Text style={styles.description}>{todo.description}</Text>
        )}

        <View style={styles.metaSection}>
          <View style={styles.metaItem}>
            <Tag size={18} color={tokens.color.muted} />
            <Text style={styles.metaText}>Category: {displayValue(todo.category)}</Text>
          </View>
          <View style={styles.metaItem}>
            <Calendar size={18} color={tokens.color.muted} />
            <Text style={styles.metaText}>Due: {displayValue(todo.dueDate)}</Text>
          </View>
        </View>
      </View>

      <View style={styles.actionRow}>
        <Pressable
          style={[styles.actionButton, styles.editButton]}
          onPress={() => {
            triggerLightImpact();
            onEdit();
          }}
          accessibilityRole="button"
          accessibilityLabel="Edit task"
        >
          <Edit3 size={18} color={tokens.color.onPrimary} />
          <Text style={[styles.actionButtonText, { color: tokens.color.onPrimary }]}>Edit</Text>
        </Pressable>

        <Pressable
          style={[styles.actionButton, styles.deleteButton]}
          onPress={onDelete}
          accessibilityRole="button"
          accessibilityLabel="Delete task"
        >
          <Trash2 size={18} color={tokens.color.statusDangerText} />
          <Text style={[styles.actionButtonText, { color: tokens.color.statusDangerText }]}>
            Delete
          </Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}
