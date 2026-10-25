/**
 * RESPONSIBILITY: Main View component for the User Todos Home screen.
 * FLOW: Composes search bar, filter tabs, categories, task list, and floating action button.
 */

import React, { useState, useMemo } from 'react';
import { View, StyleSheet, Pressable, TextInput } from 'react-native';
import { Plus, Search } from 'lucide-react-native';
import type { TodoEntity, TodoFilterType } from '../types/user_todos.types';
import { UserTodosTodoList } from './UserTodosTodoList';
import { useThemeTokens } from '../../../../core/theme/useThemeTokens';
import { triggerLightImpact } from '../../../../core/interaction/haptics';

interface UserTodosHomeMainViewProps {
  todos: TodoEntity[];
  categories: string[];
  onPressAdd: () => void;
  onPressTodo: (todo: TodoEntity) => void;
  onToggleComplete: (id: string) => void;
  onToggleFavorite: (id: string) => void;
  refreshing?: boolean;
  onRefresh?: () => void;
}

export function UserTodosHomeMainView({
  todos,
  categories,
  onPressAdd,
  onPressTodo,
  onToggleComplete,
  onToggleFavorite,
  refreshing = false,
  onRefresh = () => {},
}: UserTodosHomeMainViewProps) {
  const tokens = useThemeTokens();
  const [activeTab, setActiveTab] = useState<TodoFilterType>('all');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredTodos = useMemo(() => {
    return todos.filter((todo) => {
      if (todo.deleted) return false;
      if (searchQuery.trim().length > 0) {
        const query = searchQuery.toLowerCase();
        const matchesTitle = todo.title.toLowerCase().includes(query);
        const matchesDesc = (todo.description || '').toLowerCase().includes(query);
        if (!matchesTitle && !matchesDesc) return false;
      }
      if (selectedCategory && todo.category !== selectedCategory) {
        return false;
      }
      if (activeTab === 'completed') return todo.completed;
      if (activeTab === 'starred') return todo.favorite && !todo.completed;
      if (activeTab === 'today') {
        const todayStr = new Date().toISOString().slice(0, 10);
        return todo.dueDate === todayStr && !todo.completed;
      }
      return !todo.completed;
    });
  }, [todos, searchQuery, selectedCategory, activeTab]);

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: tokens.color.background,
    },
    searchBarContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: tokens.color.card,
      marginHorizontal: tokens.space[4],
      marginVertical: tokens.space[2],
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
    filterTabs: {
      flexDirection: 'row',
      paddingHorizontal: tokens.space[4],
      marginVertical: tokens.space[2],
      gap: tokens.space[2],
    },
    tabPill: {
      paddingHorizontal: tokens.space[3],
      paddingVertical: 6,
      borderRadius: tokens.radius.full,
      backgroundColor: tokens.color.card,
      borderWidth: 1,
      borderColor: tokens.color.border,
    },
    tabPillActive: {
      backgroundColor: tokens.color.primary,
      borderColor: tokens.color.primary,
    },
    tabText: {
      ...tokens.typography.caption,
      color: tokens.color.muted,
      fontWeight: '600',
    },
    tabTextActive: {
      color: tokens.color.onPrimary,
    },
    fab: {
      position: 'absolute',
      right: tokens.space[5],
      bottom: tokens.space[6],
      width: tokens.layout.fabSize,
      height: tokens.layout.fabSize,
      borderRadius: tokens.radius.full,
      backgroundColor: tokens.color.primary,
      alignItems: 'center',
      justifyContent: 'center',
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.25,
      shadowRadius: 8,
      elevation: 6,
      zIndex: tokens.zIndex.fab,
    },
  });

  return (
    <View style={styles.container}>
      <View style={styles.searchBarContainer}>
        <Search size={18} color={tokens.color.muted} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search tasks..."
          placeholderTextColor={tokens.color.muted}
          value={searchQuery}
          onChangeText={setSearchQuery}
          accessibilityLabel="Search tasks"
        />
      </View>

      <View style={styles.filterTabs}>
        {(['all', 'today', 'starred', 'completed'] as TodoFilterType[]).map((tab) => (
          <Pressable
            key={tab}
            style={[styles.tabPill, activeTab === tab ? styles.tabPillActive : null]}
            onPress={() => {
              triggerLightImpact();
              setActiveTab(tab);
            }}
            accessibilityRole="button"
            accessibilityLabel={`Filter ${tab} tasks`}
          >
            <Text style={[styles.tabText, activeTab === tab ? styles.tabTextActive : null]}>
              {tab.toUpperCase()}
            </Text>
          </Pressable>
        ))}
      </View>

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
