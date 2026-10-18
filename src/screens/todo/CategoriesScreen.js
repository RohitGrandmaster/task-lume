import {LocalizedText, LocalizedTextInput} from '../../i18n/LocalizedText';
import React, {useMemo, useState, useCallback} from 'react';
import {
  FlatList,
  Pressable,
  StyleSheet,
  View,
  RefreshControl,
  LayoutAnimation,
  UIManager,
  Platform
} from 'react-native';
import {SafeAreaView, useSafeAreaInsets} from 'react-native-safe-area-context';
import {DrawerActions} from '@react-navigation/native';
import Svg, {Circle} from 'react-native-svg';
import {
  Menu,
  User,
  Briefcase,
  BookOpen,
  ShoppingCart,
  Heart,
  Rocket,
  DollarSign,
  Users,
  Home,
  Plane,
  Tag,
  Search,
  X,
  ChevronRight,
  Plus,
  ListChecks,
  CheckCircle2,
  TrendingUp,
  Layers,
  Inbox,
} from 'lucide-react-native';

import useTodos from '../../hooks/useTodos';
import {useTheme} from '../../hooks/useTheme';

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

/* --------------------------- CATEGORY CONFIG --------------------------- */

const CATEGORY_CONFIG = {
  Personal: {Icon: User, color: '#6366F1'},
  Work: {Icon: Briefcase, color: '#3B82F6'},
  Learning: {Icon: BookOpen, color: '#8B5CF6'},
  Shopping: {Icon: ShoppingCart, color: '#EC4899'},
  Health: {Icon: Heart, color: '#10B981'},
  Project: {Icon: Rocket, color: '#F59E0B'},
  Finance: {Icon: DollarSign, color: '#14B8A6'},
  Family: {Icon: Users, color: '#F97316'},
  Home: {Icon: Home, color: '#06B6D4'},
  Travel: {Icon: Plane, color: '#A855F7'},
  Other: {Icon: Tag, color: '#64748B'},
  General: {Icon: Tag, color: '#64748B'},
};

const FILTERS = [
  {key: 'all', label: 'All'},
  {key: 'active', label: 'Active'},
  {key: 'completed', label: 'Done'},
  {key: 'empty', label: 'Empty'},
];

/* --------------------------- PROGRESS RING --------------------------- */

function ProgressRing({
  size = 44,
  strokeWidth = 4,
  percent = 0,
  color = '#6366F1',
  trackColor = 'rgba(127,127,127,0.2)',
  children,
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const safe = Math.min(Math.max(percent, 0), 100);
  const offset = circumference * (1 - safe / 100);

  return (
    <View
      style={{
        width: size,
        height: size,
        alignItems: 'center',
        justifyContent: 'center',
      }}>
      <Svg width={size} height={size}>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={trackColor}
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        {safe > 0 && (
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={color}
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeDasharray={`${circumference} ${circumference}`}
            strokeDashoffset={offset}
            strokeLinecap="round"
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
          />
        )}
      </Svg>
      {children ? (
        <View
          style={[
            StyleSheet.absoluteFillObject,
            {alignItems: 'center', justifyContent: 'center'},
          ]}
          pointerEvents="none">
          {children}
        </View>
      ) : null}
    </View>
  );
}

/* --------------------------- SCREEN --------------------------- */

function CategoriesScreen({navigation}) {
  const {theme} = useTheme();
  const insets = useSafeAreaInsets();
  const {tasks} = useTodos();

  const [search, setSearch] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const [filter, setFilter] = useState('all');
  const [refreshing, setRefreshing] = useState(false);

  const styles = useMemo(
    () => createStyles(theme, insets),
    [theme, insets],
  );

  /* --------------------------- NAVIGATION --------------------------- */
  function openDrawer() {
    navigation.dispatch(DrawerActions.openDrawer());
  }

  function goToTasks(categoryName) {
    navigation.navigate('Task', {
      screen: 'MainTabs',
      params: {
        screen: 'HomeTab',
        params: categoryName ? {categoryFilter: categoryName} : undefined,
      },
    });
  }

  function goToAddTodo() {
    navigation.navigate('Task', {
      screen: 'AddTodo',
    });
  }

  /* --------------------------- CATEGORIES --------------------------- */
  const categories = useMemo(() => {
    const map = {};

    (tasks || [])
      .filter(t => t && !t.deleted)
      .forEach(task => {
        const cat = (task.category || 'General').trim();
        if (!map[cat]) {
          map[cat] = {
            name: cat,
            total: 0,
            completed: 0,
            active: 0,
            favorite: 0,
            highPriority: 0,
          };
        }
        map[cat].total += 1;
        if (task.completed) {
          map[cat].completed += 1;
        } else {
          map[cat].active += 1;
          if (task.priority === 'high') map[cat].highPriority += 1;
        }
        if (task.favorite) map[cat].favorite += 1;
      });

    // Sort by task count desc, then name
    return Object.values(map).sort((a, b) => {
      if (b.total !== a.total) return b.total - a.total;
      return a.name.localeCompare(b.name);
    });
  }, [tasks]);

  /* Most used = highest count */
  const mostUsedName = useMemo(() => {
    if (categories.length === 0) return null;
    const top = categories.reduce(
      (max, c) => (c.total > max.total ? c : max),
      categories[0],
    );
    return top.total >= 2 ? top.name : null;
  }, [categories]);

  /* --------------------------- STATS --------------------------- */
  const totalTasks = useMemo(
    () => categories.reduce((s, c) => s + c.total, 0),
    [categories],
  );
  const totalCompleted = useMemo(
    () => categories.reduce((s, c) => s + c.completed, 0),
    [categories],
  );
  const emptyCount = useMemo(
    () => categories.filter(c => c.total === 0).length,
    [categories],
  );

  /* --------------------------- FILTER + SEARCH --------------------------- */
  const filteredCategories = useMemo(() => {
    let list = categories;

    // Filter
    if (filter === 'active') {
      list = list.filter(c => c.active > 0);
    } else if (filter === 'completed') {
      list = list.filter(c => c.total > 0 && c.active === 0);
    } else if (filter === 'empty') {
      list = list.filter(c => c.total === 0);
    }

    // Search
    const q = search.trim().toLowerCase();
    if (q) {
      list = list.filter(c => c.name.toLowerCase().includes(q));
    }

    return list;
  }, [categories, filter, search]);

  /* --------------------------- REFRESH --------------------------- */
  function onRefresh() {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 600);
  }

  /* --------------------------- RENDER ITEM --------------------------- */
  const renderItem = ({item}) => {
    const config = CATEGORY_CONFIG[item.name] || CATEGORY_CONFIG.General;
    const Icon = config.Icon;
    const color = config.color;

    const progress =
      item.total === 0 ? 0 : Math.round((item.completed / item.total) * 100);

    const isMostUsed = mostUsedName === item.name;

    return (
      <Pressable
        onPress={() => goToTasks(item.name)}
        accessibilityRole="button"
        accessibilityLabel={`${item.name} category, ${item.total} tasks`}
        style={({pressed}) => [
          styles.card,
          {
            backgroundColor: theme.colors.surface,
            borderColor: isMostUsed ? color + '40' : theme.colors.border,
            opacity: pressed ? 0.9 : 1,
          },
        ]}>
        {/* Left accent */}
        <View
          style={[styles.cardAccent, {backgroundColor: color}]}
          pointerEvents="none"
        />

        {/* Top row */}
        <View style={styles.cardTop}>
          <View
            style={[styles.iconBox, {backgroundColor: color + '18'}]}>
            <Icon size={20} color={color} strokeWidth={2.4} />
          </View>

          <View style={styles.categoryInfo}>
            <View style={styles.nameRow}>
              <LocalizedText
                style={[styles.categoryName, {color: theme.colors.text}]}
                numberOfLines={1}>
                {item.name}
              </LocalizedText>
              {isMostUsed && (
                <View
                  style={[
                    styles.featuredPill,
                    {backgroundColor: color + '18'},
                  ]}>
                  <TrendingUp size={9} color={color} strokeWidth={3} />
                  <LocalizedText
                    style={[styles.featuredText, {color: color}]}>
                    TOP
                  </LocalizedText>
                </View>
              )}
            </View>

            <LocalizedText
              style={[
                styles.taskCount,
                {color: theme.colors.textSecondary},
              ]}
              numberOfLines={1}>
              {item.total} {item.total === 1 ? 'task' : 'tasks'} ·{' '}
              {item.active} active
            </LocalizedText>
          </View>

          {/* Progress ring */}
          <View style={styles.ringWrap}>
            <ProgressRing
              size={44}
              strokeWidth={4}
              percent={progress}
              color={color}
              trackColor={theme.colors.border}>
              <LocalizedText
                style={[
                  styles.ringPercent,
                  {
                    color:
                      progress === 100 ? color : theme.colors.text,
                  },
                ]}>
                {progress}%
              </LocalizedText>
            </ProgressRing>
          </View>
        </View>

        {/* Progress bar */}
        <View style={styles.progressSection}>
          <View
            style={[
              styles.progressTrack,
              {backgroundColor: theme.colors.border},
            ]}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${progress}%`,
                  backgroundColor: color,
                },
              ]}
            />
          </View>
        </View>

        {/* Bottom row */}
        <View style={styles.bottomRow}>
          <View style={styles.statusItem}>
            <CheckCircle2
              size={11}
              color={theme.colors.success || '#10B981'}
              strokeWidth={2.6}
            />
            <LocalizedText
              style={[
                styles.statusText,
                {color: theme.colors.textSecondary},
              ]}>
              {item.completed} done
            </LocalizedText>
          </View>

          <View style={styles.statusItem}>
            <ListChecks
              size={11}
              color={theme.colors.warning || '#F59E0B'}
              strokeWidth={2.6}
            />
            <LocalizedText
              style={[
                styles.statusText,
                {color: theme.colors.textSecondary},
              ]}>
              {item.active} active
            </LocalizedText>
          </View>

          {item.highPriority > 0 && (
            <View style={styles.statusItem}>
              <View
                style={[
                  styles.statusDot,
                  {backgroundColor: '#EF4444'},
                ]}
              />
              <LocalizedText
                style={[
                  styles.statusText,
                  {color: theme.colors.textSecondary},
                ]}>
                {item.highPriority} high
              </LocalizedText>
            </View>
          )}

          <ChevronRight
            size={16}
            color={theme.colors.textLight}
            strokeWidth={2.4}
            style={styles.chevronRight}
          />
        </View>
      </Pressable>
    );
  };

  /* --------------------------- RENDER --------------------------- */
  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <FlatList
        data={filteredCategories}
        keyExtractor={item => item.name}
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        contentContainerStyle={[
          styles.listContent,
          filteredCategories.length === 0 && styles.emptyListContent,
        ]}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={theme.colors.primary}
            colors={[theme.colors.primary]}
          />
        }
        ListHeaderComponent={
          <View>
            {/* ============ HEADER ============ */}
            <View style={styles.header}>
              <Pressable
                onPress={openDrawer}
                style={styles.menuBtn}
                hitSlop={8}
                accessibilityRole="button"
                accessibilityLabel="Open menu">
                <Menu
                  size={18}
                  color={theme.colors.text}
                  strokeWidth={2.6}
                />
              </Pressable>

              <View style={styles.headerContent}>
                <LocalizedText style={styles.title}>Categories</LocalizedText>
                <LocalizedText style={styles.subtitle}>
                  {categories.length === 0
                    ? 'Organize your work'
                    : `${categories.length} categor${
                        categories.length !== 1 ? 'ies' : 'y'
                      }`}
                </LocalizedText>
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
                hitSlop={6}
                accessibilityRole="button"
                accessibilityLabel="Toggle search">
                <Search
                  size={16}
                  color={theme.colors.text}
                  strokeWidth={2.6}
                />
              </Pressable>

              <View
                style={[
                  styles.countBadge,
                  {backgroundColor: theme.colors.primary + '18'},
                ]}>
                <Layers
                  size={13}
                  color={theme.colors.primary}
                  strokeWidth={2.6}
                />
                <LocalizedText
                  style={[
                    styles.countNumber,
                    {color: theme.colors.primary},
                  ]}>
                  {categories.length}
                </LocalizedText>
              </View>
            </View>

            {/* ============ SEARCH ============ */}
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
                <LocalizedTextInput
                  style={[
                    styles.searchInput,
                    {color: theme.colors.text},
                  ]}
                  placeholder="Search categories..."
                  placeholderTextColor={theme.colors.textLight}
                  value={search}
                  onChangeText={setSearch}
                  autoFocus
                  returnKeyType="search"
                />
                {search.length > 0 && (
                  <Pressable
                    onPress={() => setSearch('')}
                    hitSlop={8}
                    accessibilityLabel="Clear search">
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
            {categories.length > 0 && (
              <View style={styles.statsRow}>
                <View
                  style={[
                    styles.statMini,
                    {
                      backgroundColor: theme.colors.surface,
                      borderColor: theme.colors.border,
                    },
                  ]}>
                  <Layers size={12} color="#6366F1" strokeWidth={2.6} />
                  <LocalizedText
                    style={[
                      styles.statMiniValue,
                      {color: theme.colors.text},
                    ]}>
                    {categories.length}
                  </LocalizedText>
                  <LocalizedText
                    style={[
                      styles.statMiniLabel,
                      {color: theme.colors.textSecondary},
                    ]}
                    numberOfLines={1}>
                    Categories
                  </LocalizedText>
                </View>

                <View
                  style={[
                    styles.statMini,
                    {
                      backgroundColor: theme.colors.surface,
                      borderColor: theme.colors.border,
                    },
                  ]}>
                  <ListChecks
                    size={12}
                    color="#3B82F6"
                    strokeWidth={2.6}
                  />
                  <LocalizedText
                    style={[
                      styles.statMiniValue,
                      {color: theme.colors.text},
                    ]}>
                    {totalTasks}
                  </LocalizedText>
                  <LocalizedText
                    style={[
                      styles.statMiniLabel,
                      {color: theme.colors.textSecondary},
                    ]}
                    numberOfLines={1}>
                    Tasks
                  </LocalizedText>
                </View>

                <View
                  style={[
                    styles.statMini,
                    {
                      backgroundColor: theme.colors.surface,
                      borderColor: theme.colors.border,
                    },
                  ]}>
                  <CheckCircle2
                    size={12}
                    color="#10B981"
                    strokeWidth={2.6}
                  />
                  <LocalizedText
                    style={[
                      styles.statMiniValue,
                      {color: theme.colors.text},
                    ]}>
                    {totalCompleted}
                  </LocalizedText>
                  <LocalizedText
                    style={[
                      styles.statMiniLabel,
                      {color: theme.colors.textSecondary},
                    ]}
                    numberOfLines={1}>
                    Done
                  </LocalizedText>
                </View>
              </View>
            )}

            {/* ============ FILTER PILLS ============ */}
            {categories.length > 0 && (
              <View style={styles.filterRow}>
                {FILTERS.map(f => {
                  const selected = filter === f.key;
                  const count =
                    f.key === 'all'
                      ? categories.length
                      : f.key === 'active'
                      ? categories.filter(c => c.active > 0).length
                      : f.key === 'completed'
                      ? categories.filter(
                          c => c.total > 0 && c.active === 0,
                        ).length
                      : emptyCount;
                  return (
                    <Pressable
                      key={f.key}
                      onPress={() => setFilter(f.key)}
                      accessibilityRole="button"
                      accessibilityLabel={`Filter ${f.label}`}
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
                      <LocalizedText
                        style={[
                          styles.filterPillText,
                          {
                            color: selected
                              ? '#FFFFFF'
                              : theme.colors.textSecondary,
                          },
                        ]}>
                        {f.label}
                      </LocalizedText>
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
                          <LocalizedText
                            style={[
                              styles.filterBadgeText,
                              {
                                color: selected
                                  ? '#FFFFFF'
                                  : theme.colors.textLight,
                              },
                            ]}>
                            {count}
                          </LocalizedText>
                        </View>
                      )}
                    </Pressable>
                  );
                })}
              </View>
            )}
          </View>
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <View
              style={[
                styles.emptyIcon,
                {
                  backgroundColor: theme.colors.surface,
                  borderColor: theme.colors.border,
                },
              ]}>
              {search.trim() ? (
                <Search
                  size={32}
                  color={theme.colors.textLight}
                  strokeWidth={1.8}
                />
              ) : filter !== 'all' ? (
                <Inbox
                  size={32}
                  color={theme.colors.textLight}
                  strokeWidth={1.8}
                />
              ) : (
                <Layers
                  size={32}
                  color={theme.colors.textLight}
                  strokeWidth={1.8}
                />
              )}
            </View>

            <LocalizedText
              style={[styles.emptyTitle, {color: theme.colors.text}]}>
              {search.trim()
                ? 'No matches'
                : filter === 'active'
                ? 'No active categories'
                : filter === 'completed'
                ? 'Nothing completed'
                : filter === 'empty'
                ? 'No empty categories'
                : 'No categories yet'}
            </LocalizedText>

            <LocalizedText
              style={[
                styles.emptyText,
                {color: theme.colors.textSecondary},
              ]}>
              {search.trim()
                ? 'Try a different keyword.'
                : filter !== 'all'
                ? 'Change filter to see other categories.'
                : 'Categories will appear automatically when you create tasks.'}
            </LocalizedText>

            {!search.trim() && filter === 'all' && (
              <Pressable
                onPress={goToAddTodo}
                accessibilityRole="button"
                accessibilityLabel="Create a task"
                style={({pressed}) => [
                  styles.button,
                  {
                    backgroundColor: theme.colors.primary,
                    shadowColor: theme.colors.primary,
                    opacity: pressed ? 0.85 : 1,
                  },
                ]}>
                <Plus size={15} color="#FFFFFF" strokeWidth={2.8} />
                <LocalizedText style={styles.buttonText}>Create a Task</LocalizedText>
              </Pressable>
            )}
          </View>
        }
      />

      {/* ============ FAB ============ */}
      <Pressable
        onPress={goToAddTodo}
        accessibilityRole="button"
        accessibilityLabel="Add new task"
        style={[
          styles.fab,
          {
            backgroundColor: theme.colors.primary,
            shadowColor: theme.colors.primary,
            bottom: Math.max(insets.bottom, 12) + 90,
          },
        ]}>
        <Plus size={26} color="#FFFFFF" strokeWidth={2.9} />
      </Pressable>
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

    /* Header */
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      paddingTop: 12,
      marginBottom: 14,
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
      marginBottom: 12,
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
      marginBottom: 12,
    },
    statMini: {
      flex: 1,
      minWidth: 0,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 5,
      paddingVertical: 10,
      paddingHorizontal: 8,
      borderRadius: 13,
      borderWidth: 1,
    },
    statMiniValue: {
      fontSize: 14,
      fontWeight: '900',
      letterSpacing: -0.3,
    },
    statMiniLabel: {
      fontSize: 10,
      fontWeight: '700',
      letterSpacing: 0.2,
    },

    /* Filters */
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
      gap: 5,
      paddingVertical: 9,
      paddingHorizontal: 6,
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

    /* List */
    listContent: {
      paddingHorizontal: 20,
      paddingBottom: Math.max(insets.bottom, 12) + 110,
    },
    emptyListContent: {
      flexGrow: 1,
    },

    /* Card */
    card: {
      borderWidth: 1,
      borderRadius: 18,
      padding: 14,
      paddingLeft: 16,
      marginBottom: 10,
      overflow: 'hidden',
    },
    cardAccent: {
      position: 'absolute',
      left: 0,
      top: 12,
      bottom: 12,
      width: 3,
      borderTopRightRadius: 3,
      borderBottomRightRadius: 3,
    },

    cardTop: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },

    iconBox: {
      width: 44,
      height: 44,
      borderRadius: 14,
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
    },

    categoryInfo: {
      flex: 1,
      minWidth: 0,
    },

    nameRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },

    categoryName: {
      fontSize: 15,
      fontWeight: '800',
      letterSpacing: -0.2,
      flexShrink: 1,
    },

    featuredPill: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 3,
      paddingHorizontal: 6,
      paddingVertical: 2,
      borderRadius: 6,
      flexShrink: 0,
    },
    featuredText: {
      fontSize: 8.5,
      fontWeight: '900',
      letterSpacing: 0.6,
    },

    taskCount: {
      fontSize: 11.5,
      fontWeight: '600',
      marginTop: 3,
      letterSpacing: 0.1,
    },

    ringWrap: {
      flexShrink: 0,
    },

    ringPercent: {
      fontSize: 10.5,
      fontWeight: '900',
      letterSpacing: -0.2,
      includeFontPadding: false,
    },

    /* Progress */
    progressSection: {
      marginTop: 12,
    },
    progressTrack: {
      width: '100%',
      height: 5,
      borderRadius: 3,
      overflow: 'hidden',
    },
    progressFill: {
      height: '100%',
      borderRadius: 3,
    },

    /* Bottom row */
    bottomRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 12,
      gap: 12,
    },
    statusItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 5,
    },
    statusDot: {
      width: 6,
      height: 6,
      borderRadius: 3,
    },
    statusText: {
      fontSize: 11,
      fontWeight: '700',
      letterSpacing: 0.1,
    },
    chevronRight: {
      marginLeft: 'auto',
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
    emptyContainer: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 24,
      paddingTop: 40,
      paddingBottom: 80,
    },
    emptyIcon: {
      width: 84,
      height: 84,
      borderRadius: 26,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 18,
      borderWidth: 1,
    },
    emptyTitle: {
      fontSize: 17,
      fontWeight: '800',
      letterSpacing: -0.3,
      marginBottom: 6,
      textAlign: 'center',
    },
    emptyText: {
      fontSize: 13,
      lineHeight: 19,
      textAlign: 'center',
      maxWidth: 280,
      fontWeight: '500',
      marginBottom: 20,
    },
    button: {
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
    buttonText: {
      color: '#FFFFFF',
      fontSize: 13.5,
      fontWeight: '800',
      letterSpacing: 0.2,
    },
  });
}

export default CategoriesScreen;