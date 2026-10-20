import React, {useState, useMemo, useRef, useEffect} from 'react';
import {
  View,
  Text,
  Modal,
  TextInput,
  Pressable,
  FlatList,
  StyleSheet,
} from 'react-native';
import {
  Search,
  X,
  CheckSquare,
  CheckCircle2,
  Circle,
  Tag,
  ArrowRight,
} from 'lucide-react-native';
import useTheme from '../../hooks/useTheme';
import useTodos from '../../hooks/useTodos';
import {haptic} from '../../utils/haptics';

const PRIORITY_COLORS = {
  high: '#EF4444',
  medium: '#F59E0B',
  low: '#10B981',
};

export default function UnifiedSearchModal({
  visible,
  onClose,
  navigation,
  initialQuery = '',
}) {
  const {theme} = useTheme();
  const {tasks = [], toggleComplete} = useTodos();

  const [query, setQuery] = useState(initialQuery);
  const [filterType, setFilterType] = useState('all'); // 'all' | 'active' | 'completed'
  const inputRef = useRef(null);

  useEffect(() => {
    if (visible) {
      setQuery(initialQuery || '');
      setTimeout(() => {
        inputRef.current?.focus();
      }, 150);
    }
  }, [visible, initialQuery]);

  const q = query.trim().toLowerCase();

  // Filter Tasks
  const matchedTasks = useMemo(() => {
    if (!q) return [];
    return (tasks || [])
      .filter(t => !t.deleted)
      .filter(
        t =>
          (t.title || '').toLowerCase().includes(q) ||
          (t.description || '').toLowerCase().includes(q) ||
          (t.category || '').toLowerCase().includes(q),
      );
  }, [tasks, q]);

  const activeTasks = useMemo(
    () => matchedTasks.filter(t => !t.completed),
    [matchedTasks],
  );

  const completedTasks = useMemo(
    () => matchedTasks.filter(t => t.completed),
    [matchedTasks],
  );

  const displayedTasks = useMemo(() => {
    if (filterType === 'active') return activeTasks;
    if (filterType === 'completed') return completedTasks;
    return matchedTasks;
  }, [filterType, activeTasks, completedTasks, matchedTasks]);

  const handleTaskPress = task => {
    try {
      haptic();
    } catch (_) {}
    onClose();
    navigation.navigate('TodoDetail', {todoId: task.id});
  };

  const handleToggleTask = task => {
    try {
      haptic();
    } catch (_) {}
    toggleComplete(task.id);
  };

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent
      statusBarTranslucent
      onRequestClose={onClose}>
      <View
        style={[
          styles.overlay,
          {backgroundColor: theme.mode === 'dark' ? '#090D16F2' : '#F8FAFCF2'},
        ]}>
        {/* Search Header Bar */}
        <View
          style={[
            styles.headerBar,
            {
              backgroundColor: theme.colors.surface,
              borderColor: theme.colors.border,
            },
          ]}>
          <Search size={18} color={theme.colors.primary} strokeWidth={2.6} />
          <TextInput
            ref={inputRef}
            style={[styles.searchInput, {color: theme.colors.text}]}
            placeholder="Search tasks, descriptions & categories..."
            placeholderTextColor={theme.colors.textLight}
            value={query}
            onChangeText={setQuery}
            returnKeyType="search"
            autoCorrect={false}
          />
          {query.length > 0 && (
            <Pressable
              onPress={() => setQuery('')}
              style={styles.clearBtn}
              hitSlop={8}
              accessibilityLabel="Clear text">
              <X size={16} color={theme.colors.textSecondary} strokeWidth={2.4} />
            </Pressable>
          )}
          <Pressable
            onPress={onClose}
            style={styles.closeBtn}
            hitSlop={8}
            accessibilityLabel="Close search">
            <Text style={[styles.closeText, {color: theme.colors.primary}]}>
              Done
            </Text>
          </Pressable>
        </View>

        {/* Filter Type Pills */}
        <View style={styles.pillRow}>
          <Pressable
            onPress={() => setFilterType('all')}
            style={[
              styles.filterPill,
              filterType === 'all'
                ? {
                    backgroundColor: theme.colors.primary,
                    borderColor: theme.colors.primary,
                  }
                : {
                    backgroundColor: theme.colors.surface,
                    borderColor: theme.colors.border,
                  },
            ]}>
            <Text
              style={[
                styles.filterPillText,
                {color: filterType === 'all' ? '#FFFFFF' : theme.colors.text},
              ]}>
              All ({matchedTasks.length})
            </Text>
          </Pressable>

          <Pressable
            onPress={() => setFilterType('active')}
            style={[
              styles.filterPill,
              filterType === 'active'
                ? {
                    backgroundColor: '#3B82F6',
                    borderColor: '#3B82F6',
                  }
                : {
                    backgroundColor: theme.colors.surface,
                    borderColor: theme.colors.border,
                  },
            ]}>
            <Circle
              size={12}
              color={filterType === 'active' ? '#FFFFFF' : '#3B82F6'}
              strokeWidth={2.4}
            />
            <Text
              style={[
                styles.filterPillText,
                {color: filterType === 'active' ? '#FFFFFF' : theme.colors.text},
              ]}>
              Active ({activeTasks.length})
            </Text>
          </Pressable>

          <Pressable
            onPress={() => setFilterType('completed')}
            style={[
              styles.filterPill,
              filterType === 'completed'
                ? {
                    backgroundColor: '#10B981',
                    borderColor: '#10B981',
                  }
                : {
                    backgroundColor: theme.colors.surface,
                    borderColor: theme.colors.border,
                  },
            ]}>
            <CheckSquare
              size={12}
              color={filterType === 'completed' ? '#FFFFFF' : '#10B981'}
              strokeWidth={2.4}
            />
            <Text
              style={[
                styles.filterPillText,
                {color: filterType === 'completed' ? '#FFFFFF' : theme.colors.text},
              ]}>
              Completed ({completedTasks.length})
            </Text>
          </Pressable>
        </View>

        {/* Search Results / Empty State */}
        {q.length === 0 ? (
          <View style={styles.emptyPrompt}>
            <Search
              size={40}
              color={theme.colors.border}
              strokeWidth={1.8}
            />
            <Text style={[styles.emptyPromptTitle, {color: theme.colors.text}]}>
              Task Search
            </Text>
            <Text
              style={[
                styles.emptyPromptSub,
                {color: theme.colors.textSecondary},
              ]}>
              Search across your todo tasks, categories, and descriptions in real time.
            </Text>
          </View>
        ) : displayedTasks.length === 0 ? (
          <View style={styles.emptyPrompt}>
            <Text style={[styles.emptyPromptTitle, {color: theme.colors.text}]}>
              No matching tasks
            </Text>
            <Text
              style={[
                styles.emptyPromptSub,
                {color: theme.colors.textSecondary},
              ]}>
              No tasks match "{query}". Try checking for typos or searching a different keyword.
            </Text>
          </View>
        ) : (
          <FlatList
            data={displayedTasks}
            keyExtractor={item => `task-${item.id}`}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={styles.listContent}
            renderItem={({item: task}) => {
              const priorityColor =
                PRIORITY_COLORS[task.priority] || theme.colors.primary;
              return (
                <Pressable
                  onPress={() => handleTaskPress(task)}
                  style={[
                    styles.resultCard,
                    {
                      backgroundColor: theme.colors.surface,
                      borderColor: theme.colors.border,
                    },
                  ]}>
                  <Pressable
                    onPress={() => handleToggleTask(task)}
                    hitSlop={8}
                    style={styles.checkboxTouch}>
                    {task.completed ? (
                      <CheckCircle2
                        size={20}
                        color="#10B981"
                        strokeWidth={2.4}
                      />
                    ) : (
                      <Circle
                        size={20}
                        color={theme.colors.textLight}
                        strokeWidth={2}
                      />
                    )}
                  </Pressable>

                  <View style={styles.resultDetails}>
                    <View style={styles.badgeRow}>
                      <View
                        style={[
                          styles.typeBadge,
                          {backgroundColor: '#3B82F618'},
                        ]}>
                        <Text style={[styles.typeBadgeText, {color: '#3B82F6'}]}>
                          TASK
                        </Text>
                      </View>

                      {task.category ? (
                        <View
                          style={[
                            styles.categoryBadge,
                            {backgroundColor: `${theme.colors.primary}15`},
                          ]}>
                          <Tag
                            size={10}
                            color={theme.colors.primary}
                            strokeWidth={2.4}
                          />
                          <Text
                            style={[
                              styles.categoryBadgeText,
                              {color: theme.colors.primary},
                            ]}>
                            {task.category}
                          </Text>
                        </View>
                      ) : null}

                      {task.priority ? (
                        <View
                          style={[
                            styles.priorityDot,
                            {backgroundColor: priorityColor},
                          ]}
                        />
                      ) : null}
                    </View>

                    <Text
                      style={[
                        styles.resultTitle,
                        {
                          color: task.completed
                            ? theme.colors.textLight
                            : theme.colors.text,
                          textDecorationLine: task.completed
                            ? 'line-through'
                            : 'none',
                        },
                      ]}
                      numberOfLines={1}>
                      {task.title}
                    </Text>

                    {task.description ? (
                      <Text
                        style={[
                          styles.resultSnippet,
                          {color: theme.colors.textSecondary},
                        ]}
                        numberOfLines={1}>
                        {task.description}
                      </Text>
                    ) : null}
                  </View>

                  <ArrowRight
                    size={16}
                    color={theme.colors.textLight}
                    strokeWidth={2}
                  />
                </Pressable>
              );
            }}
          />
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    paddingTop: 46,
    paddingHorizontal: 16,
  },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    height: 52,
    borderRadius: 16,
    borderWidth: 1,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 14.5,
    fontWeight: '600',
    padding: 0,
  },
  clearBtn: {
    padding: 4,
  },
  closeBtn: {
    paddingHorizontal: 6,
    paddingVertical: 4,
  },
  closeText: {
    fontSize: 14,
    fontWeight: '800',
  },
  pillRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
    marginBottom: 10,
  },
  filterPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
  },
  filterPillText: {
    fontSize: 11.5,
    fontWeight: '800',
  },
  listContent: {
    paddingBottom: 40,
    gap: 10,
  },
  resultCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 13,
    borderRadius: 14,
    borderWidth: 1,
    gap: 12,
  },
  checkboxTouch: {
    padding: 2,
  },
  resultDetails: {
    flex: 1,
    minWidth: 0,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  typeBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  typeBadgeText: {
    fontSize: 9.5,
    fontWeight: '900',
    letterSpacing: 0.8,
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  categoryBadgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  priorityDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  resultTitle: {
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: -0.2,
    marginBottom: 2,
  },
  resultSnippet: {
    fontSize: 12,
    fontWeight: '500',
    lineHeight: 16,
  },
  emptyPrompt: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    gap: 10,
  },
  emptyPromptTitle: {
    fontSize: 17,
    fontWeight: '800',
    marginTop: 6,
    textAlign: 'center',
  },
  emptyPromptSub: {
    fontSize: 13,
    fontWeight: '500',
    lineHeight: 19,
    textAlign: 'center',
  },
});
