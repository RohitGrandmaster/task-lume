/**
 * RESPONSIBILITY: Main View component for the User Todos Home screen (≤180 lines).
 * FLOW: Composes header card, quick filter chips, search bar, status tabs, and task list.
 */

import React, { useState, useMemo } from 'react';
import { View, StyleSheet, Pressable, TextInput } from 'react-native';
import { Plus, Search } from 'lucide-react-native';
import type { TodoEntity, TodoFilterType } from '../types/user_todos.types';
import { UserTodosTodoList } from './UserTodosTodoList';
import { UserTodosHeaderCard } from './UserTodosHeaderCard';
import { UserTodosQuickFilters, QuickFilterKey } from './UserTodosQuickFilters';
import { UserTodosFilterTabs } from './UserTodosFilterTabs';
import { useThemeTokens } from '../../../../../core/theme/useThemeTokens';

interface UserTodosHomeMainViewProps {
  todos: TodoEntity[];
  categories: string[];
  onOpenDrawer: () => void;
  onPressAdd: () => void;
  onPressTodo: (todo: TodoEntity) => void;
  onToggleComplete: (id: string) => void;
  onToggleFavorite: (id: string) => void;
  onPressReminders?: () => void;
  refreshing?: boolean;
  onRefresh?: () => void;
}

export function UserTodosHomeMainView({
  todos,
  onOpenDrawer,
  onPressAdd,
  onPressTodo,
  onToggleComplete,
  onToggleFavorite,
  onPressReminders,
  refreshing = false,
  onRefresh = () => {},
}: UserTodosHomeMainViewProps) {
  const tokens = useThemeTokens();
  const [activeTab, setActiveTab] = useState<TodoFilterType>('all');
  const [quickFilter, setQuickFilter] = useState<QuickFilterKey>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const activeTasks = useMemo(() => todos.filter((t) => !t.deleted), [todos]);
  const completedCount = useMemo(() => activeTasks.filter((t) => t.completed).length, [activeTasks]);

  const filteredTodos = useMemo(() => {
    return activeTasks.filter((todo) => {
      if (searchQuery.trim().length > 0) {
        const query = searchQuery.toLowerCase();
        const matchesTitle = todo.title.toLowerCase().includes(query);
        const matchesDesc = (todo.description || '').toLowerCase().includes(query);
        if (!matchesTitle && !matchesDesc) return false;
      }
      if (quickFilter === 'today') {
        const todayStr = new Date().toISOString().slice(0, 10);
        if (todo.dueDate !== todayStr) return false;
      } else if (quickFilter === 'high') {
        if (todo.priority !== 'high') return false;
      } else if (quickFilter === 'starred') {
        if (!todo.favorite) return false;
      }
      if (activeTab === 'completed') return todo.completed;
      if (activeTab === 'starred') return todo.favorite && !todo.completed;
      if (activeTab === 'today') {
        const todayStr = new Date().toISOString().slice(0, 10);
        return todo.dueDate === todayStr && !todo.completed;
      }
      return !todo.completed;
    });
  }, [activeTasks, searchQuery, quickFilter, activeTab]);

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: tokens.color.background,
    },
    searchContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: tokens.color.card,
      marginHorizontal: tokens.space[4],
      marginBottom: tokens.space[2],
      paddingHorizontal: tokens.space[3],
      borderRadius: tokens.radius.md,
      borderWidth: 1,
      borderColor: tokens.color.border,
      height: 44,
    },
    searchInput: {
      flex: 1,
      marginLeft: tokens.space[2],
      color: tokens.color.foreground,
      ...tokens.typography.bodySm,
    },
    fab: {
      position: 'absolute',
      right: tokens.space[5],
      bottom: 86,
      width: tokens.layout.fabSize,
      height: tokens.layout.fabSize,
      borderRadius: tokens.radius.full,
      backgroundColor: tokens.color.primary,
      alignItems: 'center',
      justifyContent: 'center',
      shadowColor: '#000000', // design-exception: iOS shadowColor native property
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.25,
      shadowRadius: 8,
      elevation: 6,
      zIndex: tokens.zIndex.fab,
    },
  });

  return (
    <View style={styles.container}>
      <UserTodosHeaderCard
        onOpenDrawer={onOpenDrawer}
        onPressReminders={onPressReminders}
        totalTasks={activeTasks.length}
        completedTasks={completedCount}
      />

      <UserTodosQuickFilters
        activeQuickFilter={quickFilter}
        onSelectQuickFilter={setQuickFilter}
      />

      <View style={styles.searchContainer}>
        <Search size={18} color={tokens.color.muted} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search daily tasks..."
          placeholderTextColor={tokens.color.muted}
          value={searchQuery}
          onChangeText={setSearchQuery}
          accessibilityLabel="Search daily tasks"
        />
      </View>

      <UserTodosFilterTabs
        activeTab={activeTab}
        onSelectTab={setActiveTab}
      />

      <UserTodosTodoList
        todos={filteredTodos}
        refreshing={refreshing}
        onRefresh={onRefresh}
        onPressTodo={onPressTodo}
        onToggleComplete={onToggleComplete}
        onToggleFavorite={onToggleFavorite}
        onPressEmptyCta={onPressAdd}
      />

      <Pressable
        style={styles.fab}
        onPress={onPressAdd}
        accessibilityRole="button"
        accessibilityLabel="Create task"
      >
        <Plus size={26} color={tokens.color.onPrimary} strokeWidth={2.5} />
      </Pressable>
    </View>
  );
}
