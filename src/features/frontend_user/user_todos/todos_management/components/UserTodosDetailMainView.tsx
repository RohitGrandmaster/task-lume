/**
 * RESPONSIBILITY: Main View component for the User Todos Detail screen.
 * FLOW: Renders complete task specifications, priority badge, and actionable controls (edit, delete, toggle).
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { Calendar, Tag, Trash2, Edit3, CheckCircle2, Star, ArrowLeft } from 'lucide-react-native';
import type { TodoEntity } from '../types/user_todos.types';
import { useThemeTokens } from '../../../../../core/theme/useThemeTokens';
import { useTranslation } from '../../../../../core/i18n/useTranslation';
import { UserTodosConfirmDialog } from './UserTodosConfirmDialog';
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
  onBack?: () => void;
}

export function UserTodosDetailMainView({
  todo,
  onEdit,
  onDelete,
  onToggleComplete,
  onToggleFavorite,
  onBack,
}: UserTodosDetailMainViewProps) {
  const tokens = useThemeTokens();
  const { t } = useTranslation();
  const [deleteConfirmationVisible, setDeleteConfirmationVisible] = useState(false);
  const minTarget = getMinTouchTarget();
  const priorityStyle = getPriorityBadgeStyle(todo.priority, tokens);

  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: tokens.color.background, padding: tokens.space[4] },
    topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: tokens.space[3] },
    iconBtn: { width: minTarget, height: minTarget, borderRadius: tokens.radius.md, backgroundColor: tokens.color.card, borderWidth: 1, borderColor: tokens.color.border, alignItems: 'center', justifyContent: 'center' },
    barTitle: { ...tokens.typography.headingSm, color: tokens.color.foreground },
    card: { backgroundColor: tokens.color.card, borderRadius: tokens.radius.lg, borderWidth: 1, borderColor: tokens.color.border, padding: tokens.space[4], marginBottom: tokens.space[4] },
    title: { ...tokens.typography.headingLg, color: todo.completed ? tokens.color.muted : tokens.color.foreground, textDecorationLine: todo.completed ? 'line-through' : 'none', marginBottom: tokens.space[2] },
    badgeRow: { flexDirection: 'row', gap: tokens.space[2], marginBottom: tokens.space[3] },
    badge: { paddingHorizontal: tokens.space[3], paddingVertical: 4, borderRadius: tokens.radius.sm, backgroundColor: priorityStyle.backgroundColor },
    badgeText: { ...tokens.typography.caption, color: priorityStyle.textColor, fontWeight: '600' },
    description: { ...tokens.typography.body, color: tokens.color.foreground, lineHeight: 22, marginBottom: tokens.space[3] },
    metaSection: { borderTopWidth: 1, borderTopColor: tokens.color.border, paddingTop: tokens.space[3], gap: tokens.space[2], marginBottom: tokens.space[3] },
    metaItem: { flexDirection: 'row', alignItems: 'center', gap: tokens.space[2] },
    metaText: { ...tokens.typography.bodySm, color: tokens.color.muted },
    toggleStatusRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: tokens.color.primarySubtle, borderRadius: tokens.radius.md, padding: tokens.space[3], gap: tokens.space[2] },
    toggleStatusText: { ...tokens.typography.bodySm, color: tokens.color.foreground, fontWeight: '600' },
    actionRow: { flexDirection: 'row', gap: tokens.space[3], marginTop: tokens.space[2] },
    actionButton: { flex: 1, height: minTarget, borderRadius: tokens.radius.md, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: tokens.space[2] },
    editButton: { backgroundColor: tokens.color.primary },
    deleteButton: { backgroundColor: tokens.color.statusDangerBg },
    actionButtonText: { ...tokens.typography.bodySm, fontWeight: '600' },
  });

  return (
    <ScrollView style={styles.container}>
      <View style={styles.topBar}>
        {onBack ? (
          <Pressable style={styles.iconBtn} onPress={() => { triggerLightImpact(); onBack(); }} accessibilityRole="button" accessibilityLabel="Back">
            <ArrowLeft size={20} color={tokens.color.foreground} strokeWidth={2.2} />
          </Pressable>
        ) : <View style={{ width: minTarget }} />}
        <Text style={styles.barTitle}>Task Details</Text>
        <Pressable style={styles.iconBtn} onPress={() => { triggerLightImpact(); onToggleFavorite(); }} accessibilityRole="button" accessibilityLabel="Favorite">
          <Star size={20} color={todo.favorite ? tokens.color.primary : tokens.color.muted} fill={todo.favorite ? tokens.color.primary : 'transparent'} />
        </Pressable>
      </View>

      <View style={styles.card}>
        <Text style={styles.title}>{todo.title}</Text>
        <View style={styles.badgeRow}>
          <View style={styles.badge}><Text style={styles.badgeText}>{priorityStyle.label}</Text></View>
        </View>
        {Boolean(todo.description) && <Text style={styles.description}>{todo.description}</Text>}
        <View style={styles.metaSection}>
          <View style={styles.metaItem}><Tag size={16} color={tokens.color.muted} /><Text style={styles.metaText}>Category: {displayValue(todo.category)}</Text></View>
          <View style={styles.metaItem}><Calendar size={16} color={tokens.color.muted} /><Text style={styles.metaText}>Due: {displayValue(todo.dueDate)}</Text></View>
        </View>
        <Pressable style={styles.toggleStatusRow} onPress={() => { triggerSuccessHaptic(); onToggleComplete(); }} accessibilityRole="button" accessibilityLabel="Toggle completion">
          <CheckCircle2 size={20} color={todo.completed ? tokens.color.primary : tokens.color.muted} />
          <Text style={styles.toggleStatusText}>{todo.completed ? 'Completed (Tap to undo)' : 'Mark as Complete'}</Text>
        </Pressable>
      </View>

      <View style={styles.actionRow}>
        <Pressable style={[styles.actionButton, styles.editButton]} onPress={() => { triggerLightImpact(); onEdit(); }} accessibilityRole="button" accessibilityLabel={t('user_todos_management.EDIT_TASK')}>
          <Edit3 size={18} color={tokens.color.onPrimary} /><Text style={[styles.actionButtonText, { color: tokens.color.onPrimary }]}>{t('user_todos_management.EDIT_TASK')}</Text>
        </Pressable>
        <Pressable style={[styles.actionButton, styles.deleteButton]} onPress={() => setDeleteConfirmationVisible(true)} accessibilityRole="button" accessibilityLabel={t('user_todos_management.DELETE_TASK')}>
          <Trash2 size={18} color={tokens.color.statusDangerText} /><Text style={[styles.actionButtonText, { color: tokens.color.statusDangerText }]}>Delete</Text>
        </Pressable>
      </View>
      <UserTodosConfirmDialog
        visible={deleteConfirmationVisible}
        title={t('user_todos_management.DELETE_CONFIRM_TITLE')}
        description={t('user_todos_management.DELETE_CONFIRM_DESCRIPTION')}
        confirmLabel={t('user_todos_management.DELETE_TASK')}
        onCancel={() => setDeleteConfirmationVisible(false)}
        onConfirm={() => { setDeleteConfirmationVisible(false); onDelete(); }}
      />
    </ScrollView>
  );
}
