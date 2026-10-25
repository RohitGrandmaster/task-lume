/**
 * RESPONSIBILITY: Main View component for the User Todos Trash screen.
 * FLOW: Renders soft-deleted tasks; provides restore and permanent delete actions with confirmation.
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, FlatList } from 'react-native';
import { RotateCcw, Trash2, ArrowLeft } from 'lucide-react-native';
import type { TodoEntity, UserTodosTrashConfirmAction } from '../types/user_todos.types';
import { useThemeTokens } from '../../../../../core/theme/useThemeTokens';
import { useTranslation } from '../../../../../core/i18n/useTranslation';
import { getMinTouchTarget } from '../../../../../core/theme/getMinTouchTarget';
import { displayValue } from '../../../../../core/utils/displayValue';
import { UserTodosConfirmDialog } from './UserTodosConfirmDialog';
import { triggerLightImpact } from '../../../../../core/interaction/haptics';

interface UserTodosTrashMainViewProps {
  trashTodos: TodoEntity[];
  onRestore: (id: string) => void;
  onPermanentDelete: (id: string) => void;
  onEmptyTrash: () => void;
  onBack?: () => void;
}

export function UserTodosTrashMainView({
  trashTodos,
  onRestore,
  onPermanentDelete,
  onEmptyTrash,
  onBack,
}: UserTodosTrashMainViewProps) {
  const tokens = useThemeTokens();
  const { t } = useTranslation();
  const minTarget = getMinTouchTarget();
  const [confirmAction, setConfirmAction] = useState<UserTodosTrashConfirmAction | null>(null);
  const [selectedTodoId, setSelectedTodoId] = useState<string | null>(null);

  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: tokens.color.background },
    headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: tokens.space[4], paddingVertical: tokens.space[3] },
    headerLeft: { flexDirection: 'row', alignItems: 'center', gap: tokens.space[2] },
    backButton: { width: minTarget, height: minTarget, borderRadius: tokens.radius.md, backgroundColor: tokens.color.card, borderWidth: 1, borderColor: tokens.color.border, alignItems: 'center', justifyContent: 'center' },
    headerTitle: { ...tokens.typography.headingLg, color: tokens.color.foreground },
    emptyTrashButton: { paddingHorizontal: tokens.space[3], minHeight: minTarget, borderRadius: tokens.radius.md, backgroundColor: tokens.color.statusDangerBg, alignItems: 'center', justifyContent: 'center' },
      backgroundColor: tokens.color.statusDangerBg,
      alignItems: 'center',
      justifyContent: 'center',
    },
    emptyTrashText: { ...tokens.typography.caption, color: tokens.color.statusDangerText, fontWeight: '600' },
    listContent: { paddingHorizontal: tokens.space[4], paddingBottom: tokens.space[8] },
    card: { backgroundColor: tokens.color.card, borderRadius: tokens.radius.lg, borderWidth: 1, borderColor: tokens.color.border, padding: tokens.space[4], marginBottom: tokens.space[3], flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    title: { ...tokens.typography.body, color: tokens.color.muted, textDecorationLine: 'line-through', flex: 1, marginRight: tokens.space[3] },
    actions: { flexDirection: 'row', gap: tokens.space[2] },
    iconButton: { width: minTarget, height: minTarget, alignItems: 'center', justifyContent: 'center' },
    emptyContainer: { alignItems: 'center', justifyContent: 'center', padding: tokens.space[8] },
    emptyText: { ...tokens.typography.body, color: tokens.color.muted },
  });

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <View style={styles.headerLeft}>
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
          <Text style={styles.headerTitle}>{t('user_todos_management.TRASH_TITLE')}</Text>
        </View>
        {trashTodos.length > 0 && (
          <Pressable
            style={styles.emptyTrashButton}
            onPress={() => {
              setConfirmAction('empty-all');
            }}
            accessibilityRole="button"
            accessibilityLabel={t('user_todos_management.EMPTY_TRASH')}
            testID="user_todos-empty-trash-open"
          >
            <Text style={styles.emptyTrashText}>{t('user_todos_management.EMPTY_TRASH')}</Text>
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
                accessibilityLabel={t('user_todos_management.RESTORE_TASK')}
              >
                <RotateCcw size={18} color={tokens.color.primary} />
              </Pressable>
              <Pressable
                style={styles.iconButton}
                onPress={() => {
                  setSelectedTodoId(String(item.id));
                  setConfirmAction('delete-one');
                }}
                accessibilityRole="button"
                accessibilityLabel={t('user_todos_management.PERMANENT_DELETE_TASK')}
                testID="user_todos-delete-trash-item-open"
              >
                <Trash2 size={18} color={tokens.color.destructive} />
              </Pressable>
            </View>
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>{t('user_todos_management.TRASH_EMPTY')}</Text>
          </View>
        }
      />
      <UserTodosConfirmDialog
        visible={confirmAction !== null}
        title={confirmAction === 'empty-all' ? t('user_todos_management.EMPTY_TRASH_CONFIRM_TITLE') : t('user_todos_management.DELETE_CONFIRM_TITLE')}
        description={confirmAction === 'empty-all'
          ? t('user_todos_management.EMPTY_TRASH_CONFIRM_DESCRIPTION')
          : t('user_todos_management.DELETE_CONFIRM_DESCRIPTION')}
        confirmLabel={confirmAction === 'empty-all' ? t('user_todos_management.EMPTY_TRASH') : t('user_todos_management.DELETE_TASK')}
        onCancel={() => {
          setConfirmAction(null);
          setSelectedTodoId(null);
        }}
        onConfirm={() => {
          if (confirmAction === 'empty-all') {
            onEmptyTrash();
          } else if (confirmAction === 'delete-one' && selectedTodoId !== null) {
            onPermanentDelete(selectedTodoId);
          }
          setConfirmAction(null);
          setSelectedTodoId(null);
        }}
      />
    </View>
  );
}
