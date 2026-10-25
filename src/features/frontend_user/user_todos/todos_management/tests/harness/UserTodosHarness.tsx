/**
 * RESPONSIBILITY: Standalone test harness for UserTodos (≤150 lines).
 * FLOW: Mounts the real home view with deterministic fixtures and switchable active/empty scenarios.
 */
import React, { useState } from 'react';
import { View, Text, SafeAreaView, Pressable } from 'react-native';
import { I18nProvider } from '../../../../../../core/i18n/useTranslation';
import { ThemeProvider } from '../../../../../../core/theme/ThemeProvider';
import { useThemeTokens } from '../../../../../../core/theme/useThemeTokens';
import type { TodoEntity } from '../../types/user_todos.types';
import { UserTodosHomeMainView } from '../../components/UserTodosHomeMainView';

const FIXTURES: TodoEntity[] = [{
  id: 'harness-todo-1',
  title: 'Review project requirements',
  description: 'Check the architecture and UI/UX documents.',
  completed: false,
  category: 'Work',
  priority: 'high',
  dueDate: new Date().toISOString().slice(0, 10),
  reminder: false,
  favorite: true,
  deleted: false,
  pinned: false,
  createdAt: 1,
}];

function HarnessInner({ scenario, onScenarioChange }: {
  scenario: 'ACTIVE' | 'EMPTY';
  onScenarioChange: (scenario: 'ACTIVE' | 'EMPTY') => void;
}) {
  const tokens = useThemeTokens();
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: tokens.color.background }}>
      <View style={{ padding: tokens.space[3], backgroundColor: tokens.color.card, borderBottomWidth: 1, borderBottomColor: tokens.color.border }}>
        <Text style={{ color: tokens.color.primary, ...tokens.typography.caption, fontWeight: '700' }}>
          {'Harness: UserTodos [Scenario: ' + scenario + ']'}
        </Text>
        <View style={{ flexDirection: 'row', gap: tokens.space[2], marginTop: tokens.space[2] }}>
          {(['ACTIVE', 'EMPTY'] as const).map((value) => (
            <Pressable
              key={value}
              onPress={() => onScenarioChange(value)}
              accessibilityRole="button"
              accessibilityState={{ selected: scenario === value }}
              accessibilityLabel={'Show ' + value.toLowerCase() + ' todos scenario'}
              style={{ minHeight: tokens.layout.minTouchTargetAndroid, justifyContent: 'center', paddingHorizontal: tokens.space[3], borderRadius: tokens.radius.md, backgroundColor: scenario === value ? tokens.color.primary : tokens.color.cardElevated }}
            >
              <Text style={{ color: scenario === value ? tokens.color.onPrimary : tokens.color.foreground }}>{value}</Text>
            </Pressable>
          ))}
        </View>
      </View>
      <View style={{ flex: 1 }}>
        <UserTodosHomeMainView
          todos={scenario === 'ACTIVE' ? FIXTURES : []}
          categories={['Work']}
          onOpenDrawer={() => {}}
          onPressAdd={() => {}}
          onPressTodo={() => {}}
          onToggleComplete={() => {}}
          onToggleFavorite={() => {}}
          onPressReminders={() => {}}
          refreshing={false}
          onRefresh={() => {}}
        />
      </View>
    </SafeAreaView>
  );
}

export function UserTodosHarness() {
  const [scenario, setScenario] = useState<'ACTIVE' | 'EMPTY'>('ACTIVE');
  return (
    <I18nProvider>
      <ThemeProvider initialDarkMode={false}>
        <HarnessInner scenario={scenario} onScenarioChange={setScenario} />
      </ThemeProvider>
    </I18nProvider>
  );
}
