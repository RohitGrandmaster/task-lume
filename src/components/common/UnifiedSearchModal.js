import React, {useState, useMemo, useRef, useEffect} from 'react';
import {
  View,
  Text,
  Modal,
  TextInput,
  Pressable,
  FlatList,
  StyleSheet,
  Keyboard,
  Animated,
} from 'react-native';
import {
  Search,
  X,
  CheckSquare,
  StickyNote,
  Calendar,
  AlertTriangle,
  Clock,
  Pin,
  CheckCircle2,
  Circle,
  Tag,
  ArrowRight,
} from 'lucide-react-native';
import useTheme from '../../hooks/useTheme';
import useTodos from '../../hooks/useTodos';
import {useNotes} from '../../context/NotesContext';
import {haptic} from '../../utils/haptics';

const PRIORITY_COLORS = {
  high: '#EF4444',
  medium: '#F59E0B',
  low: '#10B981',
};

const NOTE_PALETTES = {
  amber: {border: '#F59E0B', bg: '#F59E0B18'},
  emerald: {border: '#10B981', bg: '#10B98118'},
  sky: {border: '#0EA5E9', bg: '#0EA5E918'},
  purple: {border: '#8B5CF6', bg: '#8B5CF618'},
  rose: {border: '#F43F5E', bg: '#F43F5E18'},
  orange: {border: '#F97316', bg: '#F9731618'},
};

export default function UnifiedSearchModal({
  visible,
  onClose,
  navigation,
  initialQuery = '',
}) {
  const {theme} = useTheme();
  const {tasks = [], toggleComplete} = useTodos();
  const {notes = []} = useNotes();

  const [query, setQuery] = useState(initialQuery);
  const [filterType, setFilterType] = useState('all'); // 'all' | 'tasks' | 'notes'
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

  // Filter Notes
  const matchedNotes = useMemo(() => {
    if (!q) return [];
    return (notes || []).filter(
      n =>
        (n.title || '').toLowerCase().includes(q) ||
        (n.content || '').toLowerCase().includes(q),
    );
  }, [notes, q]);

  const combinedResults = useMemo(() => {
    const list = [];
    if (filterType === 'all' || filterType === 'tasks') {
      matchedTasks.forEach(item => list.push({type: 'task', data: item}));
    }
    if (filterType === 'all' || filterType === 'notes') {
      matchedNotes.forEach(item => list.push({type: 'note', data: item}));
    }
    return list;
  }, [matchedTasks, matchedNotes, filterType]);

  const handleTaskPress = task => {
    try {
      haptic();
    } catch (_) {}
    onClose();
    navigation.navigate('TodoDetail', {todoId: task.id});
  };

  const handleNotePress = note => {
    try {
      haptic();
    } catch (_) {}
    onClose();
    navigation.navigate('NoteEditor', {noteId: note.id});
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
            placeholder="Search tasks, descriptions & notes..."
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
              All ({matchedTasks.length + matchedNotes.length})
            </Text>
          </Pressable>

          <Pressable
            onPress={() => setFilterType('tasks')}
            style={[
              styles.filterPill,
              filterType === 'tasks'
                ? {
                    backgroundColor: '#3B82F6',
                    borderColor: '#3B82F6',
                  }
                : {
                    backgroundColor: theme.colors.surface,
                    borderColor: theme.colors.border,
                  },
            ]}>
            <CheckSquare
              size={12}
              color={filterType === 'tasks' ? '#FFFFFF' : '#3B82F6'}
              strokeWidth={2.4}
            />
            <Text
              style={[
                styles.filterPillText,
                {color: filterType === 'tasks' ? '#FFFFFF' : theme.colors.text},
              ]}>
              Tasks ({matchedTasks.length})
            </Text>
          </Pressable>

          <Pressable
            onPress={() => setFilterType('notes')}
            style={[
              styles.filterPill,
              filterType === 'notes'
                ? {
                    backgroundColor: '#10B981',
                    borderColor: '#10B981',
                  }
                : {
                    backgroundColor: theme.colors.surface,
                    borderColor: theme.colors.border,
                  },
            ]}>
            <StickyNote
              size={12}
              color={filterType === 'notes' ? '#FFFFFF' : '#10B981'}
              strokeWidth={2.4}
            />
            <Text
              style={[
                styles.filterPillText,
                {color: filterType === 'notes' ? '#FFFFFF' : theme.colors.text},
              ]}>
              Notes ({matchedNotes.length})
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
              Unified Search
            </Text>
            <Text
              style={[
                styles.emptyPromptSub,
                {color: theme.colors.textSecondary},
              ]}>
              Search across your todo tasks, categories, and quick notes in real time.
            </Text>
          </View>
        ) : combinedResults.length === 0 ? (
          <View style={styles.emptyPrompt}>
            <Text style={[styles.emptyPromptTitle, {color: theme.colors.text}]}>
              No matching results
            </Text>
            <Text
              style={[
                styles.emptyPromptSub,
                {color: theme.colors.textSecondary},
              ]}>
              No tasks or notes match "{query}". Try checking for typos or searching a different keyword.
            </Text>
          </View>
        ) : (
          <FlatList
            data={combinedResults}
            keyExtractor={(item, index) => `${item.type}-${item.data.id || index}`}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={styles.listContent}
            renderItem={({item}) => {
              if (item.type === 'task') {
                const task = item.data;
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
              }

              // Note Card
              const note = item.data;
              const palette =
                NOTE_PALETTES[note.color] || NOTE_PALETTES.amber;

              return (
                <Pressable
                  onPress={() => handleNotePress(note)}
                  style={[
                    styles.resultCard,
                    {
                      backgroundColor: theme.colors.surface,
                      borderColor: palette.border,
                      borderLeftWidth: 4,
                    },
                  ]}>
                  <View
                    style={[
                      styles.noteIconWrap,
                      {backgroundColor: palette.bg},
                    ]}>
                    <StickyNote
                      size={16}
                      color={palette.border}
                      strokeWidth={2.4}
                    />
                  </View>

                  <View style={styles.resultDetails}>
                    <View style={styles.badgeRow}>
                      <View
                        style={[
                          styles.typeBadge,
                          {backgroundColor: '#10B98118'},
                        ]}>
                        <Text style={[styles.typeBadgeText, {color: '#10B981'}]}>
                          NOTE
                        </Text>
                      </View>

                      {note.pinned && (
                        <View style={styles.pinnedBadge}>
                          <Pin size={10} color="#F59E0B" strokeWidth={2.6} />
                          <Text style={styles.pinnedText}>Pinned</Text>
                        </View>
                      )}
                    </View>

                    <Text
                      style={[styles.resultTitle, {color: theme.colors.text}]}
                      numberOfLines={1}>
                      {note.title || 'Untitled note'}
                    </Text>

                    {note.content ? (
                      <Text
                        style={[
                          styles.resultSnippet,
                          {color: theme.colors.textSecondary},
                        ]}
                        numberOfLines={2}>
                        {note.content}
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
  noteIconWrap: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
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
  pinnedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    backgroundColor: '#F59E0B18',
  },
  pinnedText: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#F59E0B',
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
