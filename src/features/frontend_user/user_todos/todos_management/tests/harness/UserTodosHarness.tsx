/**
 * RESPONSIBILITY: Standalone rendering harness for Todo list visual states; not an API/MSW integration harness yet.
 * FLOW: UserTodosHarness supplies deterministic fixtures and callbacks to UserTodosHomeMainView.
 */

import React, { useState } from 'react';
import { Pressable, Text, View, SafeAreaView } from 'react-native';
import { ThemeProvider } from '../../../../../../core/theme/ThemeProvider';
import { useThemeTokens } from '../../../../../../core/theme/useThemeTokens';
import type { TodoEntity } from '../../types/user_todos.types';
import { UserTodosHomeMainView } from '../../components/UserTodosHomeMainView';

type UserTodosHarnessScenario = 'ACTIVE_RECORDS' | 'EMPTY_DATA';

function HarnessInner({ title, children }: { title: string; children: React.ReactNode }) {
  const tokens = useThemeTokens();
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: tokens.color.background }}>
      <View style={{ padding: tokens.space[2], backgroundColor: tokens.color.card, borderBottomWidth: 1, borderBottomColor: tokens.color.border }}>
        <Text style={{ color: tokens.color.primary, ...tokens.typography.caption, fontWeight: '700' }}>{title}</Text>
      </View>
      <View style={{ flex: 1 }}>{children}</View>
    </SafeAreaView>
  );
}

export function UserTodosHarness() {
  const [scenario, setScenario] = useState<UserTodosHarnessScenario>('ACTIVE_RECORDS');
  const tokens = useThemeTokens();
  const todos: TodoEntity[] = scenario === 'EMPTY_DATA' ? [] : [{
    id: 'harness-task-1',
    title: 'Verify Todo list interactions',
    description: 'Deterministic standalone visual fixture',
    completed: false,
    category: 'Personal',
    priority: 'medium',
    dueDate: '',
    reminder: false,
    favorite: false,
    deleted: false,
    pinned: false,
    createdAt: 0,
  }];

  return (
    <ThemeProvider>
      <HarnessInner title={`Harness: UserTodos [${scenario}]`}>
        <Pressable
          style={{ minHeight: 44, padding: tokens.space[2], backgroundColor: tokens.color.primarySubtle }}
          onPress={() => setScenario((current) => current === 'ACTIVE_RECORDS' ? 'EMPTY_DATA' : 'ACTIVE_RECORDS')}
          accessibilityRole="button"
          accessibilityLabel="Toggle populated and empty Todo scenario"
          testID="user-todos-harness-toggle-scenario"
        >
          <Text style={{ color: tokens.color.foreground }}>Switch to {scenario === 'ACTIVE_RECORDS' ? 'empty' : 'populated'} scenario</Text>
        </Pressable>
        <UserTodosHomeMainView
          todos={todos}
          categories={['Personal', 'Work']}
          onOpenDrawer={() => {}}
          onPressAdd={() => {}}
          onPressTodo={() => {}}
          onToggleComplete={() => {}}
          onToggleFavorite={() => {}}
        />
      </HarnessInner>
    </ThemeProvider>
  );
}
