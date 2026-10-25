/**
 * RESPONSIBILITY: Main View component for the User Todos Favorites / Starred screen.
 * FLOW: Filters tasks by favorite status; renders UserTodosTodoList with Starred title.
 */

import React, { useMemo } from 'react';
import { View, StyleSheet, Text, Pressable } from 'react-native';
import { ArrowLeft } from 'lucide-react-native';
import type { TodoEntity } from '../types/user_todos.types';
import { UserTodosTodoList } from './UserTodosTodoList';
import { useThemeTokens } from '../../../../../core/theme/useThemeTokens';
import { getMinTouchTarget } from '../../../../../core/theme/getMinTouchTarget';
import { triggerLightImpact } from '../../../../../core/interaction/haptics';

interface UserTodosFavoritesMainViewProps {
  todos: TodoEntity[];
  onPressTodo: (todo: TodoEntity) => void;
  onToggleComplete: (id: string) => void;
  onToggleFavorite: (id: string) => void;
  refreshing?: boolean;
  onRefresh?: () => void;
  onBack?: () => void;
}

export function UserTodosFavoritesMainView({
  todos,
  onPressTodo,
  onToggleComplete,
  onToggleFavorite,
  refreshing = false,
  onRefresh = () => {},
  onBack,
}: UserTodosFavoritesMainViewProps) {
  const tokens = useThemeTokens();
  const minTarget = getMinTouchTarget();

  const favoriteTodos = useMemo(() => {
    return todos.filter((t) => t.favorite && !t.deleted);
  }, [todos]);

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: tokens.color.background,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: tokens.space[4],
      paddingVertical: tokens.space[3],
      gap: tokens.space[2],
    },
    backButton: {
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
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        {onBack ? (
          <Pressable
            style={styles.backButton}
            onPress={() => {
              triggerLightImpact();
              onBack();
            }}
            accessibilityRole="button"
            accessibilityLabel="Go back"
            hitSlop={8}
          >
            <ArrowLeft size={20} color={tokens.color.foreground} strokeWidth={2.2} />
          </Pressable>
        ) : null}
        <Text style={styles.title}>Starred Tasks</Text>
      </View>
      <UserTodosTodoList
        todos={favoriteTodos}
        refreshing={refreshing}
        onRefresh={onRefresh}
        onPressTodo={onPressTodo}
        onToggleComplete={onToggleComplete}
        onToggleFavorite={onToggleFavorite}
        emptyTitle="No starred tasks"
        emptyDescription="Tap the star icon on any task to pin it here for quick access."
      />
    </View>
  );
}
