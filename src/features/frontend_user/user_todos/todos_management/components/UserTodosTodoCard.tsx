/**
 * RESPONSIBILITY: Individual Todo list item card rendering task details, priority badge, and interactive toggles.
 * FLOW: Rendered inside UserTodosTodoList; triggers completion toggle, favorite toggle, or opens detail view.
 */

import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Check, Star, Clock, Tag } from 'lucide-react-native';
import type { TodoEntity } from '../types/user_todos.types';
import { useThemeTokens } from '../../../../core/theme/useThemeTokens';
import { getMinTouchTarget } from '../../../../core/theme/getMinTouchTarget';
import { triggerLightImpact, triggerSuccessHaptic } from '../../../../core/interaction/haptics';
import { getPriorityBadgeStyle } from '../utils/userTodosFormatters';
import { displayValue } from '../../../../core/utils/displayValue';

interface UserTodosTodoCardProps {
  todo: TodoEntity;
  onPress: (todo: TodoEntity) => void;
  onToggleComplete: (id: string) => void;
  onToggleFavorite: (id: string) => void;
}

export function UserTodosTodoCard({
  todo,
  onPress,
  onToggleComplete,
  onToggleFavorite,
}: UserTodosTodoCardProps) {
  const tokens = useThemeTokens();
  const minTarget = getMinTouchTarget();
  const priorityStyle = getPriorityBadgeStyle(todo.priority, tokens);

  const handleToggle = () => {
    if (!todo.completed) {
      triggerSuccessHaptic();
    } else {
      triggerLightImpact();
    }
    onToggleComplete(todo.id);
  };

  const handleFavorite = () => {
    triggerLightImpact();
    onToggleFavorite(todo.id);
  };

  const styles = StyleSheet.create({
    card: {
      backgroundColor: tokens.color.card,
      borderRadius: tokens.radius.lg,
      borderWidth: 1,
      borderColor: todo.completed ? tokens.color.border : tokens.color.borderFocus,
      padding: tokens.space[4],
      marginBottom: tokens.space[3],
      flexDirection: 'row',
      alignItems: 'flex-start',
    },
    checkbox: {
      width: 24,
      height: 24,
      borderRadius: tokens.radius.sm,
      borderWidth: 2,
      borderColor: todo.completed ? tokens.color.primary : tokens.color.border,
      backgroundColor: todo.completed ? tokens.color.primary : 'transparent',
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: 2,
      marginRight: tokens.space[3],
    },
    contentArea: {
      flex: 1,
      marginRight: tokens.space[2],
    },
    title: {
      ...tokens.typography.body,
      color: todo.completed ? tokens.color.muted : tokens.color.foreground,
      textDecorationLine: todo.completed ? 'line-through' : 'none',
      marginBottom: tokens.space[1],
    },
    description: {
      ...tokens.typography.caption,
      color: tokens.color.muted,
      marginBottom: tokens.space[2],
    },
    metaRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      alignItems: 'center',
      gap: tokens.space[2],
    },
    badge: {
      paddingHorizontal: tokens.space[2],
      paddingVertical: 2,
      borderRadius: tokens.radius.sm,
      backgroundColor: priorityStyle.backgroundColor,
    },
    badgeText: {
      ...tokens.typography.caption,
      color: priorityStyle.textColor,
      fontWeight: '600',
    },
    categoryPill: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: tokens.color.cardElevated,
      paddingHorizontal: tokens.space[2],
      paddingVertical: 2,
      borderRadius: tokens.radius.sm,
      gap: 4,
    },
    categoryText: {
      ...tokens.typography.caption,
      color: tokens.color.muted,
    },
    datePill: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    },
    dateText: {
      ...tokens.typography.caption,
      color: tokens.color.muted,
    },
    favoriteButton: {
      width: minTarget,
      height: minTarget,
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: -8,
      marginRight: -8,
    },
  });

  return (
    <Pressable
      style={styles.card}
      onPress={() => onPress(todo)}
      accessibilityRole="button"
      accessibilityLabel={`View details for ${todo.title}`}
    >
      <Pressable
        style={styles.checkbox}
        hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        onPress={handleToggle}
        accessibilityRole="checkbox"
        accessibilityState={{ checked: todo.completed }}
        accessibilityLabel={todo.completed ? 'Mark task incomplete' : 'Mark task complete'}
      >
        {todo.completed && <Check size={14} color={tokens.color.onPrimary} strokeWidth={3} />}
      </Pressable>

      <View style={styles.contentArea}>
        <Text style={styles.title} numberOfLines={2}>
          {todo.title}
        </Text>
        {Boolean(todo.description) && (
          <Text style={styles.description} numberOfLines={2}>
            {todo.description}
          </Text>
        )}

        <View style={styles.metaRow}>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{priorityStyle.label}</Text>
          </View>

          <View style={styles.categoryPill}>
            <Tag size={10} color={tokens.color.muted} />
            <Text style={styles.categoryText}>{displayValue(todo.category)}</Text>
          </View>

          {Boolean(todo.dueDate) && (
            <View style={styles.datePill}>
              <Clock size={10} color={tokens.color.muted} />
              <Text style={styles.dateText}>{displayValue(todo.dueDate)}</Text>
            </View>
          )}
        </View>
      </View>

      <Pressable
        style={styles.favoriteButton}
        onPress={handleFavorite}
        accessibilityRole="button"
        accessibilityLabel={todo.favorite ? 'Remove from favorites' : 'Mark as favorite'}
      >
        <Star
          size={18}
          color={todo.favorite ? tokens.color.primary : tokens.color.muted}
          fill={todo.favorite ? tokens.color.primary : 'none'}
        />
      </Pressable>
    </Pressable>
  );
}
