/**
 * RESPONSIBILITY: Main View component for the User Todos Trash screen.
 * FLOW: Renders soft-deleted tasks; provides restore and permanent delete actions with confirmation.
 */

import React from 'react';
import { View, Text, StyleSheet, Pressable, FlatList } from 'react-native';
import { RotateCcw, Trash2 } from 'lucide-react-native';
import type { TodoEntity } from '../types/user_todos.types';
import { useThemeTokens } from '../../../../../core/theme/useThemeTokens';
import { getMinTouchTarget } from '../../../../../core/theme/getMinTouchTarget';
import { displayValue } from '../../../../../core/utils/displayValue';
import { triggerLightImpact } from '../../../../../core/interaction/haptics';
import { useConfirm } from '../../../../../core/hooks/useConfirm';

interface UserTodosTrashMainViewProps {
  trashTodos: TodoEntity[];
  onRestore: (id: string) => void;
  onPermanentDelete: (id: string) => void;
  onEmptyTrash: () => void;
}

export function UserTodosTrashMainView({
  trashTodos,
  onRestore,
  onPermanentDelete,
  onEmptyTrash,
}: UserTodosTrashMainViewProps) {
  const tokens = useThemeTokens();
  const minTarget = getMinTouchTarget();
  const { confirm, confirmDialog } = useConfirm();

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: tokens.color.background,
    },
    headerRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: tokens.space[4],
      paddingVertical: tokens.space[3],
    },
    headerTitle: {
      ...tokens.typography.headingLg,
      color: tokens.color.foreground,
    },
    emptyTrashButton: {
      paddingHorizontal: tokens.space[3],
      minHeight: minTarget,
      borderRadius: tokens.radius.md,
      backgroundColor: tokens.color.statusDangerBg,
      alignItems: 'center',
      justifyContent: 'center',
    },
    emptyTrashText: {
      ...tokens.typography.caption,
      color: tokens.color.statusDangerText,
      fontWeight: '600',
    },
    listContent: {
      paddingHorizontal: tokens.space[4],
      paddingBottom: tokens.space[8],
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
      justifyContent: 'space-between',
    },
    title: {
      ...tokens.typography.body,
      color: tokens.color.muted,
      textDecorationLine: 'line-through',
      flex: 1,
      marginRight: tokens.space[3],
    },
    actions: {
      flexDirection: 'row',
      gap: tokens.space[2],
    },
    iconButton: {
      width: minTarget,
      height: minTarget,
      alignItems: 'center',
      justifyContent: 'center',
    },
    emptyContainer: {
      alignItems: 'center',
      justifyContent: 'center',
      padding: tokens.space[8],
    },
    emptyText: {
      ...tokens.typography.body,
      color: tokens.color.muted,
    },
  });

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.headerTitle}>Trash</Text>
        {trashTodos.length > 0 && (
          <Pressable
            style={styles.emptyTrashButton}
            onPress={() => {
              void confirm({
                title: 'Permanently empty Trash?',
                message: 'Every task in Trash will be permanently deleted and cannot be restored.',
                confirmLabel: 'Empty Trash',
                cancelLabel: 'Cancel',
                destructive: true,
              }, () => onEmptyTrash());
            }}
            accessibilityRole="button"
            accessibilityLabel="Empty all trash"
          >
            <Text style={styles.emptyTrashText}>Empty Trash</Text>
          </Pressable>
        )}
      </View>

      <FlatList
        data={trashTodos}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.title} numberOfLines={2}>
              {displayValue(item.title)}
            </Text>
            <View style={styles.actions}>
              <Pressable
                style={styles.iconButton}
                onPress={() => {
                  triggerLightImpact();
                  onRestore(String(item.id));
                }}
                accessibilityRole="button"
                accessibilityLabel="Restore task"
              >
                <RotateCcw size={18} color={tokens.color.primary} />
              </Pressable>
              <Pressable
                style={styles.iconButton}
                onPress={() => {
                  void confirm({
                    title: 'Permanently delete task?',
                    message: 'This task will be permanently deleted and cannot be restored.',
                    confirmLabel: 'Delete Permanently',
                    cancelLabel: 'Cancel',
                    destructive: true,
                  }, () => onPermanentDelete(String(item.id)));
                }}
                accessibilityRole="button"
                accessibilityLabel="Permanently delete task"
              >
                <Trash2 size={18} color={tokens.color.destructive} />
              </Pressable>
            </View>
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Trash is empty</Text>
          </View>
        }
      />
      {confirmDialog}
    </View>
  );
}
