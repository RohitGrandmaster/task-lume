import React, {useMemo, useState, useRef, useEffect} from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  SectionList,
  TextInput,
  RefreshControl,
  LayoutAnimation,
  UIManager,
  Platform,
  Modal,
  Animated,
} from 'react-native';
import {SafeAreaView, useSafeAreaInsets} from 'react-native-safe-area-context';
import {DrawerActions} from '@react-navigation/native';
import {
  Menu,
  Star,
  StarOff,
  Search,
  X,
  CheckCircle2,
  ChevronRight,
  Plus,
  Trash2,
  Flame,
  CheckCheck,
  ListChecks,
  Undo2,
  AlertCircle,
} from 'lucide-react-native';

import {useTheme} from '../../hooks/useTheme';
import useTodos from '../../hooks/useTodos';
import ROUTES from '../../constants/routes';
import StrikeText from '../../components/common/StrikeText';

if (
  Platform.OS === 'android' &&
  UIManager.setLayoutAnimationEnabledExperimental &&
  !global._Bridgeless &&
  !global.RN$Bridgeless
) {
  try {
    UIManager.setLayoutAnimationEnabledExperimental(true);
  } catch (e) {}
}

/* --------------------------- CONSTANTS --------------------------- */

const PRIORITY_COLORS = {
  low: '#10B981',
  medium: '#F59E0B',
  high: '#EF4444',
};

const PRIORITY_RANK = {high: 3, medium: 2, low: 1};

const CATEGORY_COLORS = {
  Personal: '#6366F1',
  Work: '#3B82F6',
  Learning: '#8B5CF6',
  Shopping: '#EC4899',
  Health: '#10B981',
  Project: '#F59E0B',
  Finance: '#14B8A6',
  Family: '#F97316',
  Home: '#06B6D4',
  Travel: '#A855F7',
  Other: '#64748B',
};

const FILTERS = [
  {key: 'all', label: 'All'},
  {key: 'active', label: 'Active'},
  {key: 'done', label: 'Done'},
  {key: 'high', label: 'High'},
];

/* --------------------------- HELPERS --------------------------- */

const pad = v => String(v).padStart(2, '0');
const dateKey = d =>
  `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

function getTaskDueDate(task) {
  if (!task?.dueDate) return null;
  const dd = String(task.dueDate).trim();
  if (!dd) return null;

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const lower = dd.toLowerCase();

  if (lower === 'today') return today;
  if (lower === 'tomorrow') {
    const t = new Date(today);
    t.setDate(t.getDate() + 1);
    return t;
  }
  if (lower === 'next week' || lower === 'nextweek') {
    const t = new Date(today);
    t.setDate(t.getDate() + 7);
    return t;
  }
  if (/^\d{4}-\d{2}-\d{2}$/.test(dd)) {
    const [y, m, d] = dd.split('-').map(Number);
    return new Date(y, m - 1, d);
  }
  const parsed = new Date(dd);
  if (!isNaN(parsed.getTime())) return parsed;
  return null;
}

function formatDueLabel(task) {
  const date = getTaskDueDate(task);
  if (!date) return null;

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const taskDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());

  const diffDays = Math.round(
    (taskDay.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
  );

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Tomorrow';
  if (diffDays === -1) return '1d overdue';
  if (diffDays < 0) return `${Math.abs(diffDays)}d overdue`;
  if (diffDays <= 7) return `In ${diffDays}d`;
  return date.toLocaleDateString(undefined, {month: 'short', day: 'numeric'});
}

function sortTasks(a, b) {
  const pDiff =
    (PRIORITY_RANK[b.priority] || 0) - (PRIORITY_RANK[a.priority] || 0);
  if (pDiff !== 0) return pDiff;
  const aDate = getTaskDueDate(a);
  const bDate = getTaskDueDate(b);
  if (aDate && bDate) return aDate - bDate;
  if (aDate) return -1;
  if (bDate) return 1;
  return 0;
}

/* --------------------------- FAVORITE CARD --------------------------- */

function FavoriteCard({
  task,
  theme,
  styles,
  onPress,
  onToggleComplete,
  onToggleFavorite,
  onLongPress,
}) {
  const priorityColor = PRIORITY_COLORS[task.priority] || theme.colors.textLight;
  const categoryColor =
    CATEGORY_COLORS[task.category] || theme.colors.textSecondary;
  const completed = !!task.completed;
  const dueLabel = formatDueLabel(task);

  const now = new Date();
  const dueDate = getTaskDueDate(task);
  const isOverdue =
    !completed && dueDate && dueDate < new Date(now.getFullYear(), now.getMonth(), now.getDate());

  return (
    <Pressable
      onPress={onPress}
      onLongPress={onLongPress}
      delayLongPress={350}
      style={({pressed}) => [
        styles.card,
        {
          backgroundColor: theme.colors.surface,
          borderColor: isOverdue ? '#EF444440' : theme.colors.border,
          opacity: pressed ? 0.88 : completed ? 0.6 : 1,
        },
      ]}>
      <View
        style={[styles.cardLeftBar, {backgroundColor: priorityColor}]}
      />

      {/* Quick complete checkbox */}
      <Pressable
        onPress={onToggleComplete}
        hitSlop={10}
        style={styles.checkboxWrap}>
        <View
          style={[
            styles.checkbox,
            {
              borderColor: completed
                ? theme.colors.success || '#10B981'
                : priorityColor,
              backgroundColor: completed
                ? theme.colors.success || '#10B981'
                : 'transparent',
            },
          ]}>
          {completed && (
            <CheckCircle2 size={13} color="#FFFFFF" strokeWidth={3} />
          )}
        </View>
      </Pressable>

      <View style={styles.cardContent}>
        <StrikeText
          text={task.title || 'Untitled task'}
          completed={completed}
          style={[styles.cardTitle, {color: theme.colors.text}]}
          completedStyle={{color: theme.colors.textLight}}
          strikeColor={theme.colors.textSecondary || '#6B7280'}
          strikeHeight={2.2}
          numberOfLines={2}
        />

        {!!task.description && (
          <StrikeText
            text={task.description}
            completed={completed}
            style={[styles.cardDesc, {color: theme.colors.textSecondary}]}
            completedStyle={{color: theme.colors.textLight}}
            strikeColor={theme.colors.textSecondary || '#6B7280'}
            strikeHeight={2}
            containerStyle={{marginTop: 3}}
            numberOfLines={1}
          />
        )}

        <View style={styles.cardMetaRow}>
          <View
            style={[styles.categoryDot, {backgroundColor: categoryColor}]}
          />
          <Text
            style={[
              styles.cardMeta,
              {color: theme.colors.textSecondary},
            ]}
            numberOfLines={1}>
            {task.category || 'General'}
          </Text>

          {dueLabel && (
            <>
              <Text
                style={[
                  styles.cardMetaDot,
                  {color: theme.colors.textLight},
                ]}>
                •
              </Text>
              <Text
                style={[
                  styles.cardDue,
                  {color: isOverdue ? '#EF4444' : theme.colors.textSecondary},
                ]}>
                {dueLabel}
              </Text>
            </>
          )}

          {task.priority === 'high' && !completed && (
            <>
              <Text
                style={[
                  styles.cardMetaDot,
                  {color: theme.colors.textLight},
                ]}>
                •
              </Text>
              <Text style={styles.highTag}>HIGH</Text>
            </>
          )}
        </View>
      </View>

      {/* Quick unfavorite star */}
      <Pressable
        onPress={onToggleFavorite}
        hitSlop={8}
        style={styles.starBtn}>
        <Star
          size={18}
          color="#F59E0B"
          strokeWidth={2.4}
          fill="#F59E0B"
        />
      </Pressable>
    </Pressable>
  );
}

/* --------------------------- SCREEN --------------------------- */

function FavoritesScreen({navigation}) {
  const {theme} = useTheme();
  const {tasks, toggleTodo, toggleFavorite, deleteTodo} = useTodos();
  const insets = useSafeAreaInsets();
  const styles = useMemo(() => createStyles(theme, insets), [theme, insets]);

  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [actionTask, setActionTask] = useState(null);
  const [actionModalVisible, setActionModalVisible] = useState(false);

  const [undoState, setUndoState] = useState(null);
  const undoTimerRef = useRef(null);
  const undoAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    return () => {
      if (undoTimerRef.current) clearTimeout(undoTimerRef.current);
    };
  }, []);

  function openDrawer() {
    navigation.dispatch(DrawerActions.openDrawer());
  }

  /* ---------------- Favorite tasks ---------------- */
  const favoriteTasks = useMemo(
    () => (tasks || []).filter(t => t.favorite === true && !t.deleted),
    [tasks],
  );

  const activeFavorites = useMemo(
    () => favoriteTasks.filter(t => !t.completed),
    [favoriteTasks],
  );

  const completedFavorites = useMemo(
    () => favoriteTasks.filter(t => t.completed),
    [favoriteTasks],
  );

  /* ---------------- Search ---------------- */
  const searchedActive = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return activeFavorites;
    return activeFavorites.filter(
      t =>
        (t.title || '').toLowerCase().includes(q) ||
        (t.description || '').toLowerCase().includes(q) ||
        (t.category || '').toLowerCase().includes(q),
    );
  }, [activeFavorites, search]);

  const searchedCompleted = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return completedFavorites;
    return completedFavorites.filter(
      t =>
        (t.title || '').toLowerCase().includes(q) ||
        (t.description || '').toLowerCase().includes(q) ||
        (t.category || '').toLowerCase().includes(q),
    );
  }, [completedFavorites, search]);

  /* ---------------- Filter ---------------- */
  const filteredActive = useMemo(() => {
    if (filter === 'all') return searchedActive;
    if (filter === 'active') return searchedActive;
    if (filter === 'done') return [];
    if (filter === 'high')
      return searchedActive.filter(t => t.priority === 'high');
    return searchedActive;
  }, [searchedActive, filter]);

  const filteredCompleted = useMemo(() => {
    if (filter === 'all' || filter === 'done') return searchedCompleted;
    return [];
  }, [searchedCompleted, filter]);

  /* ---------------- Sections ---------------- */
  const sections = useMemo(() => {
    const result = [];

    if (filteredActive.length > 0) {
      result.push({
        key: 'active',
        title: 'ACTIVE',
        accent: '#6366F1',
        Icon: ListChecks,
        data: [...filteredActive].sort(sortTasks),
        isCompleted: false,
      });
    }

    if (filteredCompleted.length > 0) {
      result.push({
        key: 'completed',
        title: 'COMPLETED',
        accent: '#10B981',
        Icon: CheckCheck,
        data: [...filteredCompleted].sort(sortTasks),
        isCompleted: true,
      });
    }

    return result;
  }, [filteredActive, filteredCompleted]);

  /* ---------------- Counts ---------------- */
  const activeCount = activeFavorites.length;
  const doneCount = completedFavorites.length;
  const highCount = activeFavorites.filter(t => t.priority === 'high').length;

  /* ---------------- Handlers ---------------- */
  function openTodoDetail(todoId) {
    navigation.navigate('Task', {
      screen: 'TodoDetail',
      params: {todoId},
    });
  }

  function goToHome() {
    navigation.navigate('Task', {
      screen: 'MainTabs',
      params: {screen: 'HomeTab'},
    });
  }

  function goToAddTodo() {
    navigation.navigate('Task', {
      screen: 'AddTodo',
    });
  }

  function handleToggleComplete(task) {
    if (typeof toggleTodo === 'function') toggleTodo(task.id);
  }

  function handleUnfavorite(task) {
    if (typeof toggleFavorite === 'function') {
      toggleFavorite(task.id);
    }
  }

  function handleLongPress(task) {
    setActionTask(task);
    setActionModalVisible(true);
  }

  function handleDelete(task) {
    if (typeof deleteTodo === 'function') {
      deleteTodo(task.id);
      setActionModalVisible(false);
      showUndo(task.id, task.title);
    }
  }

  function showUndo(taskId, taskTitle) {
    setUndoState({id: taskId, title: taskTitle || 'task'});
    undoAnim.setValue(0);
    Animated.timing(undoAnim, {
      toValue: 1,
      duration: 220,
      useNativeDriver: true,
    }).start();

    if (undoTimerRef.current) clearTimeout(undoTimerRef.current);
    undoTimerRef.current = setTimeout(() => {
      Animated.timing(undoAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start(() => setUndoState(null));
    }, 4000);
  }

  function handleUndo() {
    if (undoTimerRef.current) clearTimeout(undoTimerRef.current);
    Animated.timing(undoAnim, {
      toValue: 0,
      duration: 180,
      useNativeDriver: true,
    }).start(() => setUndoState(null));
  }

  function onRefresh() {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 700);
  }

  /* ---------------- Empty state config ---------------- */
  const emptyConfig = useMemo(() => {
    if (search.trim())
      return {
        title: 'No matches',
        desc: 'Try a different keyword.',
        showCTA: false,
      };
    if (filter === 'high')
      return {
        title: 'No high priority favorites',
        desc: 'Mark high priority tasks as favorite to see them here.',
        showCTA: false,
      };
    if (filter === 'done')
      return {
        title: 'Nothing completed yet',
        desc: 'Complete a favorite and it will show here.',
        showCTA: false,
      };
    if (filter === 'active')
      return {
        title: 'No active favorites',
        desc: 'All your favorites are done. Nice!',
        showCTA: false,
      };
    return {
      title: 'No favorites yet',
      desc: 'Mark important tasks as favorites and they will appear here.',
      showCTA: true,
    };
  }, [filter, search]);

  const isEmpty = sections.length === 0;

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <SectionList
        sections={sections}
        keyExtractor={item => String(item.id)}
        showsVerticalScrollIndicator={false}
        stickySectionHeadersEnabled={true}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={theme.colors.primary}
            colors={[theme.colors.primary]}
          />
        }
        ListHeaderComponent={
          <View style={styles.container}>
            {/* ============ HEADER ============ */}
            <View style={styles.header}>
              <Pressable
                onPress={openDrawer}
                style={styles.menuBtn}
                hitSlop={8}>
                <Menu
                  size={18}
                  color={theme.colors.text}
                  strokeWidth={2.6}
                />
              </Pressable>

              <View style={styles.headerContent}>
                <Text style={styles.title}>Favorites</Text>
                <Text style={styles.subtitle}>
                  {favoriteTasks.length === 0
                    ? 'Your starred tasks'
                    : `${activeCount} active · ${doneCount} done`}
                </Text>
              </View>

              <Pressable
                onPress={() => {
                  LayoutAnimation.configureNext(
                    LayoutAnimation.Presets.easeInEaseOut,
                  );
                  setSearchOpen(v => !v);
                  if (searchOpen) setSearch('');
                }}
                style={styles.headerIconBtn}
                hitSlop={6}>
                <Search
                  size={16}
                  color={theme.colors.text}
                  strokeWidth={2.6}
                />
              </Pressable>

              <View
                style={[
                  styles.countBadge,
                  {backgroundColor: '#F59E0B'},
                ]}>
                <Star size={13} color="#FFFFFF" strokeWidth={2.6} fill="#FFFFFF" />
                <Text style={styles.countNumber}>
                  {favoriteTasks.length}
                </Text>
              </View>
            </View>

            {/* ============ SEARCH BAR ============ */}
            {searchOpen && (
              <View
                style={[
                  styles.searchBar,
                  {
                    backgroundColor: theme.colors.surface,
                    borderColor: theme.colors.border,
                  },
                ]}>
                <Search
                  size={15}
                  color={theme.colors.textSecondary}
                  strokeWidth={2.4}
                />
                <TextInput
                  style={[
                    styles.searchInput,
                    {color: theme.colors.text},
                  ]}
                  placeholder="Search favorites..."
                  placeholderTextColor={theme.colors.textLight}
                  value={search}
                  onChangeText={setSearch}
                  autoFocus
                  returnKeyType="search"
                />
                {search.length > 0 && (
                  <Pressable onPress={() => setSearch('')} hitSlop={8}>
                    <X
                      size={14}
                      color={theme.colors.textSecondary}
                      strokeWidth={2.6}
                    />
                  </Pressable>
                )}
              </View>
            )}

            {/* ============ STATS ROW ============ */}
            <View style={styles.statsRow}>
              <Pressable
                onPress={() => setFilter('active')}
                style={[
                  styles.statCard,
                  {
                    backgroundColor:
                      filter === 'active' ? '#6366F118' : theme.colors.surface,
                    borderColor:
                      filter === 'active' ? '#6366F155' : theme.colors.border,
                  },
                ]}>
                <View
                  style={[
                    styles.statIconWrap,
                    {backgroundColor: '#6366F118'},
                  ]}>
                  <ListChecks size={14} color="#6366F1" strokeWidth={2.6} />
                </View>
                <Text style={[styles.statValue, {color: theme.colors.text}]}>
                  {activeCount}
                </Text>
                <Text
                  style={[
                    styles.statLabel,
                    {color: theme.colors.textSecondary},
                  ]}
                  numberOfLines={1}>
                  Active
                </Text>
              </Pressable>

              <Pressable
                onPress={() => setFilter('done')}
                style={[
                  styles.statCard,
                  {
                    backgroundColor:
                      filter === 'done' ? '#10B98118' : theme.colors.surface,
                    borderColor:
                      filter === 'done' ? '#10B98155' : theme.colors.border,
                  },
                ]}>
                <View
                  style={[
                    styles.statIconWrap,
                    {backgroundColor: '#10B98118'},
                  ]}>
                  <CheckCheck size={14} color="#10B981" strokeWidth={2.6} />
                </View>
                <Text style={[styles.statValue, {color: theme.colors.text}]}>
                  {doneCount}
                </Text>
                <Text
                  style={[
                    styles.statLabel,
                    {color: theme.colors.textSecondary},
                  ]}
                  numberOfLines={1}>
                  Done
                </Text>
              </Pressable>

              <Pressable
                onPress={() => setFilter('high')}
                style={[
                  styles.statCard,
                  {
                    backgroundColor:
                      filter === 'high' ? '#EF444418' : theme.colors.surface,
                    borderColor:
                      filter === 'high' ? '#EF444455' : theme.colors.border,
                  },
                ]}>
                <View
                  style={[
                    styles.statIconWrap,
                    {backgroundColor: '#EF444418'},
                  ]}>
                  <Flame size={14} color="#EF4444" strokeWidth={2.6} />
                </View>
                <Text style={[styles.statValue, {color: theme.colors.text}]}>
                  {highCount}
                </Text>
                <Text
                  style={[
                    styles.statLabel,
                    {color: theme.colors.textSecondary},
                  ]}
                  numberOfLines={1}>
                  High
                </Text>
              </Pressable>
            </View>

            {/* ============ FILTER PILLS ============ */}
            <View style={styles.filterRow}>
              {FILTERS.map(f => {
                const selected = filter === f.key;
                const count =
                  f.key === 'active'
                    ? activeCount
                    : f.key === 'done'
                    ? doneCount
                    : f.key === 'high'
                    ? highCount
                    : favoriteTasks.length;
                return (
                  <Pressable
                    key={f.key}
                    onPress={() => setFilter(f.key)}
                    style={[
                      styles.filterPill,
                      {
                        backgroundColor: selected
                          ? theme.colors.primary
                          : theme.colors.surface,
                        borderColor: selected
                          ? theme.colors.primary
                          : theme.colors.border,
                      },
                    ]}>
                    <Text
                      style={[
                        styles.filterPillText,
                        {
                          color: selected
                            ? '#FFFFFF'
                            : theme.colors.textSecondary,
                        },
                      ]}>
                      {f.label}
                    </Text>
                    {count > 0 && (
                      <View
                        style={[
                          styles.filterBadge,
                          {
                            backgroundColor: selected
                              ? 'rgba(255,255,255,0.22)'
                              : theme.colors.background,
                          },
                        ]}>
                        <Text
                          style={[
                            styles.filterBadgeText,
                            {
                              color: selected
                                ? '#FFFFFF'
                                : theme.colors.textLight,
                            },
                          ]}>
                          {count}
                        </Text>
                      </View>
                    )}
                  </Pressable>
                );
              })}
            </View>
          </View>
        }
        renderSectionHeader={({section}) => {
          const SectionIcon = section.Icon;
          return (
            <View
              style={[
                styles.sectionHeaderWrap,
                {backgroundColor: theme.colors.background},
              ]}>
              <View style={styles.sectionHeader}>
                <View
                  style={[
                    styles.sectionAccent,
                    {backgroundColor: section.accent},
                  ]}
                />
                <SectionIcon
                  size={13}
                  color={section.accent}
                  strokeWidth={2.8}
                />
                <Text
                  style={[
                    styles.sectionTitle,
                    {color: theme.colors.text},
                  ]}>
                  {section.title}
                </Text>
                <View
                  style={[
                    styles.sectionCount,
                    {backgroundColor: section.accent + '18'},
                  ]}>
                  <Text
                    style={[
                      styles.sectionCountText,
                      {color: section.accent},
                    ]}>
                    {section.data.length}
                  </Text>
                </View>
              </View>
            </View>
          );
        }}
        renderItem={({item}) => (
          <View style={styles.cardWrap}>
            <FavoriteCard
              task={item}
              theme={theme}
              styles={styles}
              onPress={() => openTodoDetail(item.id)}
              onToggleComplete={() => handleToggleComplete(item)}
              onToggleFavorite={() => handleUnfavorite(item)}
              onLongPress={() => handleLongPress(item)}
            />
          </View>
        )}
        ListEmptyComponent={
          isEmpty ? (
            <View style={styles.emptyWrap}>
              <View
                style={[
                  styles.emptyIconWrap,
                  {
                    backgroundColor: theme.colors.surface,
                    borderColor: theme.colors.border,
                  },
                ]}>
                {filter === 'high' ? (
                  <Flame
                    size={34}
                    color={theme.colors.textLight}
                    strokeWidth={1.8}
                  />
                ) : (
                  <StarOff
                    size={34}
                    color={theme.colors.textLight}
                    strokeWidth={1.8}
                  />
                )}
              </View>
              <Text
                style={[styles.emptyTitle, {color: theme.colors.text}]}>
                {emptyConfig.title}
              </Text>
              <Text
                style={[
                  styles.emptyDesc,
                  {color: theme.colors.textSecondary},
                ]}>
                {emptyConfig.desc}
              </Text>

              {emptyConfig.showCTA && (
                <Pressable
                  style={[
                    styles.emptyBtn,
                    {
                      backgroundColor: theme.colors.primary,
                      shadowColor: theme.colors.primary,
                    },
                  ]}
                  onPress={goToHome}>
                  <ListChecks size={15} color="#FFFFFF" strokeWidth={2.8} />
                  <Text style={styles.emptyBtnText}>Browse tasks</Text>
                </Pressable>
              )}
            </View>
          ) : null
        }
      />

      {/* ============ FAB ============ */}
      <Pressable
        onPress={goToAddTodo}
        style={[
          styles.fab,
          {
            backgroundColor: theme.colors.primary,
            shadowColor: theme.colors.primary,
            bottom: Math.max(insets.bottom, 12) + 90,
          },
        ]}
        accessibilityRole="button"
        accessibilityLabel="Add new task">
        <Plus size={26} color="#FFFFFF" strokeWidth={2.9} />
      </Pressable>

      {/* ============ QUICK ACTIONS MODAL ============ */}
      <Modal
        visible={actionModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setActionModalVisible(false)}>
        <Pressable
          style={styles.actionOverlay}
          onPress={() => setActionModalVisible(false)}>
          <Pressable
            style={[
              styles.actionCard,
              {backgroundColor: theme.colors.background},
            ]}
            onPress={() => {}}>
            <View style={styles.actionHeader}>
              <View
                style={[
                  styles.actionHeaderIcon,
                  {backgroundColor: '#F59E0B18'},
                ]}>
                <Star size={18} color="#F59E0B" strokeWidth={2.4} fill="#F59E0B" />
              </View>
              <View style={{flex: 1, minWidth: 0}}>
                <Text
                  style={[
                    styles.actionTitle,
                    {color: theme.colors.text},
                  ]}
                  numberOfLines={1}>
                  {actionTask?.title || 'Task'}
                </Text>
                <Text
                  style={[
                    styles.actionSubtitle,
                    {color: theme.colors.textSecondary},
                  ]}
                  numberOfLines={1}>
                  Quick actions
                </Text>
              </View>
              <Pressable
                onPress={() => setActionModalVisible(false)}
                hitSlop={10}
                style={[
                  styles.actionClose,
                  {backgroundColor: theme.colors.surface},
                ]}>
                <X size={16} color={theme.colors.text} strokeWidth={2.6} />
              </Pressable>
            </View>

            <View style={styles.actionOptions}>
              {/* Complete / Uncomplete */}
              <Pressable
                onPress={() => {
                  if (actionTask) handleToggleComplete(actionTask);
                  setActionModalVisible(false);
                }}
                style={[
                  styles.actionOption,
                  {
                    backgroundColor: theme.colors.surface,
                    borderColor: theme.colors.border,
                  },
                ]}>
                <View
                  style={[
                    styles.actionOptionIcon,
                    {backgroundColor: '#10B98118'},
                  ]}>
                  <CheckCircle2
                    size={15}
                    color="#10B981"
                    strokeWidth={2.6}
                  />
                </View>
                <Text
                  style={[
                    styles.actionOptionText,
                    {color: theme.colors.text},
                  ]}>
                  {actionTask?.completed
                    ? 'Mark as active'
                    : 'Mark as complete'}
                </Text>
                <ChevronRight
                  size={16}
                  color={theme.colors.textLight}
                  strokeWidth={2.4}
                />
              </Pressable>

              {/* Unfavorite */}
              <Pressable
                onPress={() => {
                  if (actionTask) handleUnfavorite(actionTask);
                  setActionModalVisible(false);
                }}
                style={[
                  styles.actionOption,
                  {
                    backgroundColor: theme.colors.surface,
                    borderColor: theme.colors.border,
                  },
                ]}>
                <View
                  style={[
                    styles.actionOptionIcon,
                    {backgroundColor: '#F59E0B18'},
                  ]}>
                  <StarOff size={15} color="#F59E0B" strokeWidth={2.6} />
                </View>
                <Text
                  style={[
                    styles.actionOptionText,
                    {color: theme.colors.text},
                  ]}>
                  Remove from favorites
                </Text>
                <ChevronRight
                  size={16}
                  color={theme.colors.textLight}
                  strokeWidth={2.4}
                />
              </Pressable>

              {/* Delete */}
              <Pressable
                onPress={() => actionTask && handleDelete(actionTask)}
                style={[
                  styles.actionOption,
                  {
                    backgroundColor: '#EF444418',
                    borderColor: '#EF444435',
                  },
                ]}>
                <View
                  style={[
                    styles.actionOptionIcon,
                    {backgroundColor: '#EF444425'},
                  ]}>
                  <Trash2 size={15} color="#EF4444" strokeWidth={2.6} />
                </View>
                <Text
                  style={[
                    styles.actionOptionText,
                    {color: '#EF4444'},
                  ]}>
                  Delete task
                </Text>
                <ChevronRight
                  size={16}
                  color="#EF4444"
                  strokeWidth={2.4}
                />
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      {/* ============ UNDO SNACKBAR ============ */}
      {undoState && (
        <Animated.View
          style={[
            styles.undoBar,
            {
              backgroundColor: theme.colors.text,
              bottom: Math.max(insets.bottom, 12) + 90,
              opacity: undoAnim,
              transform: [
                {
                  translateY: undoAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [20, 0],
                  }),
                },
              ],
            },
          ]}>
          <Text
            style={[styles.undoText, {color: theme.colors.background}]}
            numberOfLines={1}>
            Deleted "{undoState.title}"
          </Text>
          <Pressable
            onPress={handleUndo}
            hitSlop={8}
            style={[
              styles.undoBtn,
              {backgroundColor: theme.colors.primary},
            ]}>
            <Undo2 size={12} color="#FFFFFF" strokeWidth={2.8} />
            <Text style={styles.undoBtnText}>Undo</Text>
          </Pressable>
        </Animated.View>
      )}
    </SafeAreaView>
  );
}

/* --------------------------- STYLES --------------------------- */

function createStyles(theme, insets) {
  return StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    scrollContent: {
      paddingBottom: 120,
    },
    container: {
      paddingHorizontal: 20,
      paddingTop: 12,
    },

    /* Header */
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 14,
      gap: 8,
    },
    menuBtn: {
      width: 42,
      height: 42,
      borderRadius: 13,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    headerContent: {
      flex: 1,
      minWidth: 0,
    },
    title: {
      fontSize: 24,
      fontWeight: '900',
      color: theme.colors.text,
      letterSpacing: -0.6,
    },
    subtitle: {
      marginTop: 2,
      fontSize: 12,
      fontWeight: '500',
      color: theme.colors.textSecondary,
      letterSpacing: 0.1,
    },
    headerIconBtn: {
      width: 38,
      height: 38,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    countBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 5,
      paddingHorizontal: 10,
      paddingVertical: 8,
      borderRadius: 12,
      minWidth: 44,
      justifyContent: 'center',
    },
    countNumber: {
      fontSize: 14,
      fontWeight: '900',
      color: '#FFFFFF',
      letterSpacing: -0.3,
    },

    /* Search */
    searchBar: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      paddingHorizontal: 12,
      paddingVertical: 10,
      borderRadius: 14,
      borderWidth: 1,
      marginBottom: 14,
    },
    searchInput: {
      flex: 1,
      fontSize: 14,
      fontWeight: '600',
      padding: 0,
      letterSpacing: -0.1,
    },

    /* Stats */
    statsRow: {
      flexDirection: 'row',
      gap: 8,
      marginBottom: 14,
    },
    statCard: {
      flex: 1,
      minWidth: 0,
      alignItems: 'center',
      paddingVertical: 11,
      paddingHorizontal: 8,
      borderRadius: 15,
      borderWidth: 1,
    },
    statIconWrap: {
      width: 26,
      height: 26,
      borderRadius: 9,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 6,
    },
    statValue: {
      fontSize: 18,
      fontWeight: '900',
      letterSpacing: -0.4,
      lineHeight: 20,
    },
    statLabel: {
      fontSize: 10,
      fontWeight: '700',
      letterSpacing: 0.2,
      marginTop: 2,
      textAlign: 'center',
    },

    /* Filter pills */
    filterRow: {
      flexDirection: 'row',
      gap: 6,
      marginBottom: 16,
    },
    filterPill: {
      flex: 1,
      minWidth: 0,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 4,
      paddingVertical: 9,
      paddingHorizontal: 4,
      borderRadius: 12,
      borderWidth: 1.5,
    },
    filterPillText: {
      fontSize: 11,
      fontWeight: '800',
      letterSpacing: 0.1,
    },
    filterBadge: {
      minWidth: 16,
      height: 16,
      paddingHorizontal: 4,
      borderRadius: 8,
      alignItems: 'center',
      justifyContent: 'center',
    },
    filterBadgeText: {
      fontSize: 9.5,
      fontWeight: '900',
      letterSpacing: 0.1,
    },

    /* Section header */
    sectionHeaderWrap: {
      paddingHorizontal: 20,
    },
    sectionHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      paddingVertical: 10,
      marginTop: 4,
    },
    sectionAccent: {
      width: 3,
      height: 14,
      borderRadius: 2,
    },
    sectionTitle: {
      fontSize: 11,
      fontWeight: '900',
      letterSpacing: 1.4,
    },
    sectionCount: {
      minWidth: 22,
      height: 20,
      paddingHorizontal: 6,
      borderRadius: 10,
      alignItems: 'center',
      justifyContent: 'center',
    },
    sectionCountText: {
      fontSize: 11,
      fontWeight: '900',
      letterSpacing: 0.2,
    },

    /* Card */
    cardWrap: {
      paddingHorizontal: 20,
    },
    card: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      paddingVertical: 12,
      paddingRight: 10,
      paddingLeft: 14,
      marginBottom: 8,
      borderRadius: 15,
      borderWidth: 1,
      overflow: 'hidden',
    },
    cardLeftBar: {
      position: 'absolute',
      left: 0,
      top: 10,
      bottom: 10,
      width: 3,
      borderTopRightRadius: 3,
      borderBottomRightRadius: 3,
    },
    checkboxWrap: {
      padding: 2,
    },
    checkbox: {
      width: 22,
      height: 22,
      borderRadius: 11,
      borderWidth: 2,
      alignItems: 'center',
      justifyContent: 'center',
    },
    cardContent: {
      flex: 1,
      minWidth: 0,
    },
    cardTitle: {
      fontSize: 14,
      fontWeight: '800',
      letterSpacing: -0.2,
    },
    cardDesc: {
      fontSize: 12,
      fontWeight: '500',
      marginTop: 3,
      letterSpacing: 0.1,
    },
    cardMetaRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 5,
      marginTop: 5,
      flexWrap: 'wrap',
    },
    categoryDot: {
      width: 6,
      height: 6,
      borderRadius: 3,
    },
    cardMeta: {
      fontSize: 11.5,
      fontWeight: '600',
      letterSpacing: 0.1,
      maxWidth: 100,
    },
    cardMetaDot: {
      fontSize: 11,
    },
    cardDue: {
      fontSize: 11.5,
      fontWeight: '800',
      letterSpacing: 0.1,
    },
    highTag: {
      fontSize: 9,
      fontWeight: '900',
      letterSpacing: 0.8,
      color: '#EF4444',
      backgroundColor: '#EF444418',
      paddingHorizontal: 6,
      paddingVertical: 2,
      borderRadius: 5,
    },
    starBtn: {
      width: 32,
      height: 32,
      borderRadius: 10,
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
    },

    /* FAB */
    fab: {
      position: 'absolute',
      right: 20,
      width: 58,
      height: 58,
      borderRadius: 29,
      alignItems: 'center',
      justifyContent: 'center',
      shadowOffset: {width: 0, height: 8},
      shadowOpacity: 0.42,
      shadowRadius: 14,
      elevation: 10,
      borderWidth: 2,
      borderColor: 'rgba(255,255,255,0.25)',
    },

    /* Empty */
    emptyWrap: {
      alignItems: 'center',
      paddingHorizontal: 40,
      paddingTop: 40,
      paddingBottom: 40,
    },
    emptyIconWrap: {
      width: 84,
      height: 84,
      borderRadius: 26,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      marginBottom: 18,
    },
    emptyTitle: {
      fontSize: 17,
      fontWeight: '800',
      letterSpacing: -0.3,
      marginBottom: 6,
      textAlign: 'center',
    },
    emptyDesc: {
      fontSize: 12.5,
      fontWeight: '500',
      textAlign: 'center',
      lineHeight: 18,
      maxWidth: 260,
      marginBottom: 20,
    },
    emptyBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 7,
      paddingHorizontal: 18,
      paddingVertical: 12,
      borderRadius: 13,
      shadowOffset: {width: 0, height: 6},
      shadowOpacity: 0.3,
      shadowRadius: 12,
      elevation: 5,
    },
    emptyBtnText: {
      color: '#FFFFFF',
      fontSize: 13.5,
      fontWeight: '800',
      letterSpacing: 0.2,
    },

    /* Action modal */
    actionOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.5)',
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 24,
    },
    actionCard: {
      width: '100%',
      maxWidth: 360,
      borderRadius: 24,
      padding: 18,
      shadowColor: '#000',
      shadowOffset: {width: 0, height: 20},
      shadowOpacity: 0.35,
      shadowRadius: 40,
      elevation: 20,
    },
    actionHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      marginBottom: 16,
    },
    actionHeaderIcon: {
      width: 42,
      height: 42,
      borderRadius: 14,
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
    },
    actionTitle: {
      fontSize: 15,
      fontWeight: '900',
      letterSpacing: -0.2,
    },
    actionSubtitle: {
      fontSize: 12,
      fontWeight: '600',
      marginTop: 2,
      letterSpacing: 0.1,
    },
    actionClose: {
      width: 32,
      height: 32,
      borderRadius: 10,
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
    },
    actionOptions: {
      gap: 8,
    },
    actionOption: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      paddingVertical: 11,
      paddingHorizontal: 12,
      borderRadius: 13,
      borderWidth: 1,
    },
    actionOptionIcon: {
      width: 32,
      height: 32,
      borderRadius: 10,
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
    },
    actionOptionText: {
      flex: 1,
      fontSize: 14,
      fontWeight: '700',
      letterSpacing: -0.1,
    },

    /* Undo */
    undoBar: {
      position: 'absolute',
      left: 20,
      right: 20,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      paddingVertical: 12,
      paddingLeft: 16,
      paddingRight: 8,
      borderRadius: 14,
      shadowColor: '#000',
      shadowOffset: {width: 0, height: 8},
      shadowOpacity: 0.3,
      shadowRadius: 16,
      elevation: 10,
    },
    undoText: {
      flex: 1,
      minWidth: 0,
      fontSize: 13,
      fontWeight: '700',
      letterSpacing: 0.1,
    },
    undoBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 5,
      paddingHorizontal: 12,
      paddingVertical: 7,
      borderRadius: 10,
    },
    undoBtnText: {
      fontSize: 12,
      fontWeight: '900',
      color: '#FFFFFF',
      letterSpacing: 0.2,
    },
  });
}

export default FavoritesScreen;