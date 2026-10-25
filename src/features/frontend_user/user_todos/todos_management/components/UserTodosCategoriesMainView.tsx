/**
 * RESPONSIBILITY: Main View component for the User Todos Categories management screen.
 * FLOW: Renders category list with task counts, category add input, and delete actions.
 */

import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, Pressable, TextInput, FlatList } from 'react-native';
import { Plus, Tag, Trash2, ArrowLeft } from 'lucide-react-native';
import type { TodoEntity } from '../types/user_todos.types';
import { useThemeTokens } from '../../../../../core/theme/useThemeTokens';
import { getMinTouchTarget } from '../../../../../core/theme/getMinTouchTarget';
import { displayValue } from '../../../../../core/utils/displayValue';
import { triggerLightImpact, triggerSuccessHaptic, triggerErrorHaptic } from '../../../../../core/interaction/haptics';

interface UserTodosCategoriesMainViewProps {
  categories: string[];
  todos: TodoEntity[];
  onAddCategory: (category: string) => void;
  onDeleteCategory: (category: string) => void;
  onSelectCategory?: (category: string) => void;
  onBack?: () => void;
}

export function UserTodosCategoriesMainView({
  categories,
  todos,
  onAddCategory,
  onDeleteCategory,
  onSelectCategory,
  onBack,
}: UserTodosCategoriesMainViewProps) {
  const tokens = useThemeTokens();
  const minTarget = getMinTouchTarget();
  const [newCatName, setNewCatName] = useState('');

  const countsByCategory = useMemo(() => {
    const map: Record<string, number> = {};
    todos.forEach((t) => {
      if (!t.deleted && !t.completed) {
        map[t.category] = (map[t.category] || 0) + 1;
      }
    });
    return map;
  }, [todos]);

  const handleAdd = () => {
    const trimmed = newCatName.trim();
    if (trimmed.length > 0 && !categories.includes(trimmed)) {
      triggerSuccessHaptic();
      onAddCategory(trimmed);
      setNewCatName('');
    } else {
      triggerErrorHaptic();
    }
  };

  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: tokens.color.background },
    header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: tokens.space[4], paddingVertical: tokens.space[3], gap: tokens.space[2] },
    backBtn: { width: minTarget, height: minTarget, borderRadius: tokens.radius.md, backgroundColor: tokens.color.card, borderWidth: 1, borderColor: tokens.color.border, alignItems: 'center', justifyContent: 'center' },
    title: { ...tokens.typography.headingLg, color: tokens.color.foreground },
    addSection: { flexDirection: 'row', paddingHorizontal: tokens.space[4], marginBottom: tokens.space[4], gap: tokens.space[2] },
    input: { flex: 1, height: 44, backgroundColor: tokens.color.card, borderRadius: tokens.radius.md, borderWidth: 1, borderColor: tokens.color.border, paddingHorizontal: tokens.space[3], color: tokens.color.foreground, ...tokens.typography.bodySm },
    addButton: { width: 44, height: 44, borderRadius: tokens.radius.md, backgroundColor: tokens.color.primary, alignItems: 'center', justifyContent: 'center' },
    listContent: { paddingHorizontal: tokens.space[4], paddingBottom: tokens.space[8] },
    row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: tokens.color.card, padding: tokens.space[4], borderRadius: tokens.radius.lg, borderWidth: 1, borderColor: tokens.color.border, marginBottom: tokens.space[2] },
    rowLeft: { flexDirection: 'row', alignItems: 'center', gap: tokens.space[3], flex: 1 },
    categoryName: { ...tokens.typography.body, color: tokens.color.foreground, fontWeight: '600' },
    countBadge: { backgroundColor: tokens.color.primarySubtle, paddingHorizontal: tokens.space[2], paddingVertical: 2, borderRadius: tokens.radius.sm },
    countText: { ...tokens.typography.caption, color: tokens.color.primaryText, fontWeight: '700' },
    deleteBtn: { width: minTarget, height: minTarget, alignItems: 'center', justifyContent: 'center' },
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        {onBack ? (
          <Pressable style={styles.backBtn} onPress={() => { triggerLightImpact(); onBack(); }} accessibilityRole="button" accessibilityLabel="Back" testID="mobile:user_todos:categories:back_button">
            <ArrowLeft size={20} color={tokens.color.foreground} strokeWidth={2.2} />
          </Pressable>
        ) : null}
        <Text style={styles.title}>Categories</Text>
      </View>

      <View style={styles.addSection}>
        <TextInput
          style={styles.input}
          placeholder="New Category Name..."
          placeholderTextColor={tokens.color.muted}
          value={newCatName}
          onChangeText={setNewCatName}
          accessibilityLabel="New category input"
          testID="mobile:user_todos:categories:add_input"
        />
        <Pressable
          style={styles.addButton}
          onPress={handleAdd}
          accessibilityRole="button"
          accessibilityLabel="Add category"
          testID="mobile:user_todos:categories:add_button"
        >
          <Plus size={20} color={tokens.color.onPrimary} />
        </Pressable>
      </View>

      <FlatList
        data={categories}
        keyExtractor={(item) => item}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <Pressable
            style={styles.row}
            onPress={() => onSelectCategory && onSelectCategory(item)}
            accessibilityRole="button"
            accessibilityLabel={`Category ${item}, ${countsByCategory[item] || 0} active tasks`}
            testID={`mobile:user_todos:categories:item_${item}`}
          >
            <View style={styles.rowLeft}>
              <Tag size={18} color={tokens.color.primary} />
              <Text style={styles.categoryName}>{displayValue(item)}</Text>
              <View style={styles.countBadge}>
                <Text style={styles.countText}>{countsByCategory[item] || 0}</Text>
              </View>
            </View>

            <Pressable
              style={styles.deleteBtn}
              onPress={() => {
                triggerLightImpact();
                onDeleteCategory(item);
              }}
              accessibilityRole="button"
              accessibilityLabel={`Delete category ${item}`}
              testID={`mobile:user_todos:categories:delete_${item}`}
            >
              <Trash2 size={16} color={tokens.color.muted} />
            </Pressable>
          </Pressable>
        )}
      />
    </View>
  );
}
