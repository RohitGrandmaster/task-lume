import React, {useMemo, useState} from 'react';
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  RefreshControl,
  LayoutAnimation,
  UIManager,
  Platform,
} from 'react-native';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import {DrawerActions} from '@react-navigation/native';
import {
  Menu,
  Trash2,
  RotateCcw,
  Search,
  X,
  Info,
  Inbox,
  Clock,
  Layers,
  Flame,
  ShieldAlert,
  ChevronRight,
} from 'lucide-react-native';

import useTodos from '../../hooks/useTodos';
import {useTheme} from '../../hooks/useTheme';
import ConfirmModal from '../../components/common/ConfirmModal';

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

/* --------------------------- HELPERS --------------------------- */

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
  General: '#64748B',
};

function getDaysUntilAutoPurge(task, retentionDays = 30) {
  if (!task || !task.deletedAt) return retentionDays;
  const elapsedDays = Math.floor((Date.now() - task.deletedAt) / 86400000);
  return Math.max(0, retentionDays - elapsedDays);
}

function formatDeletedAgo(task) {
  const ts = task.deletedAt;
  if (!ts) return 'In Trash';

  const now = new Date();
  const d = new Date(ts);
  const diffMs = now.getTime() - d.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
  return d.toLocaleDateString(undefined, {month: 'short', day: 'numeric'});
}

function sortTasks(a, b) {
  const aTs = a.deletedAt || 0;
  const bTs = b.deletedAt || 0;
  return bTs - aTs;
}

/* --------------------------- SCREEN --------------------------- */

function TrashScreen({navigation}) {
  const {theme} = useTheme();
  const insets = useSafeAreaInsets();
  const {tasks, restoreTodo, permanentlyDeleteTodo, batchPermanentlyDelete} =
    useTodos();

  const [confirmPermanentId, setConfirmPermanentId] = useState(null);
  const [confirmEmptyTrash, setConfirmEmptyTrash] = useState(false);
  const [search, setSearch] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const styles = useMemo(
    () => createStyles(theme, insets),
    [theme, insets],
  );

  /* --------------------------- NAVIGATION --------------------------- */
  function openDrawer() {
    navigation.dispatch(DrawerActions.openDrawer());
  }

  /* --------------------------- TRASHED TASKS --------------------------- */
  const trashedTasks = useMemo(
    () =>
      (tasks || [])
        .filter(t => t && t.deleted === true)
        .sort(sortTasks),
    [tasks],
  );

  const filteredTasks = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return trashedTasks;
    return trashedTasks.filter(
      t =>
        (t.title || '').toLowerCase().includes(q) ||
        (t.description || '').toLowerCase().includes(q) ||
        (t.category || '').toLowerCase().includes(q),
    );
  }, [trashedTasks, search]);

  /* --------------------------- STATS --------------------------- */
  const oldestDays = useMemo(() => {
    if (trashedTasks.length === 0) return 0;
    const oldest = trashedTasks.reduce((min, t) => {
      const ts = t.deletedAt || 0;
      if (ts === 0) return min;
      return ts < min ? ts : min;
    }, Infinity);
    if (!isFinite(oldest)) return 0;
    return Math.floor((Date.now() - oldest) / 86400000);
  }, [trashedTasks]);

  /* --------------------------- HANDLERS --------------------------- */
  function handleRestore(id) {
    restoreTodo(id);
  }

  function handlePermanentDelete(id) {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    permanentlyDeleteTodo(id);
    setConfirmPermanentId(null);
  }

  function handleEmptyTrash() {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    const ids = trashedTasks.map(task => task.id);
    if (batchPermanentlyDelete) {
      batchPermanentlyDelete(ids);
    } else {
      trashedTasks.forEach(task => {
        permanentlyDeleteTodo(task.id);
      });
    }
    setConfirmEmptyTrash(false);
  }

  function onRefresh() {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 600);
  }

  /* --------------------------- RENDER ITEM --------------------------- */
  const renderItem = ({item}) => {
    const categoryColor =
      CATEGORY_COLORS[item.category] || theme.colors.textSecondary;
    const deletedAgo = formatDeletedAgo(item);

    return (
      <View
        style={[
          styles.card,
          {
            backgroundColor: theme.colors.surface,
            borderColor: theme.colors.border,
          },
        ]}>
        <View style={styles.cardTopRow}>
          <View
            style={[
              styles.trashIcon,
              {backgroundColor: theme.colors.danger + '14'},
            ]}>
            <Trash2
              size={18}
              color={theme.colors.danger}
              strokeWidth={2.4}
            />
          </View>

          <View style={styles.content}>
            <Text
              numberOfLines={2}
              style={[styles.cardTitle, {color: theme.colors.text}]}>
              {item.title || 'Untitled task'}
            </Text>

            {!!item.description && (
              <Text
                numberOfLines={1}
                style={[
                  styles.description,
                  {color: theme.colors.textSecondary},
                ]}>
                {item.description}
              </Text>
            )}

            <View style={styles.metaRow}>
              <View
                style={[
                  styles.categoryDot,
                  {backgroundColor: categoryColor},
                ]}
              />
              <Text
                style={[
                  styles.metaText,
                  {color: theme.colors.textSecondary},
                ]}
                numberOfLines={1}>
                {item.category || 'General'}
              </Text>
              <Text
                style={[
                  styles.metaDot,
                  {color: theme.colors.textLight},
                ]}>
                •
              </Text>
              <Clock
                size={10}
                color={theme.colors.textLight}
                strokeWidth={2.6}
              />
              <Text
                style={[
                  styles.metaText,
                  {color: theme.colors.textSecondary},
                ]}>
                {deletedAgo} · Auto-deletes in {getDaysUntilAutoPurge(item)}d
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.actions}>
          <Pressable
            onPress={() => handleRestore(item.id)}
            accessibilityRole="button"
            accessibilityLabel={`Restore ${item.title}`}
            style={({pressed}) => [
              styles.actionBtn,
              {
                borderColor: theme.colors.primary + '40',
                backgroundColor: theme.colors.primary + '0D',
                opacity: pressed ? 0.75 : 1,
              },
            ]}>
            <RotateCcw
              size={13}
              color={theme.colors.primary}
              strokeWidth={2.6}
            />
            <Text
              style={[
                styles.actionText,
                {color: theme.colors.primary},
              ]}>
              Restore
            </Text>
          </Pressable>

          <Pressable
            onPress={() => setConfirmPermanentId(item.id)}
            accessibilityRole="button"
            accessibilityLabel={`Delete ${item.title} forever`}
            style={({pressed}) => [
              styles.actionBtn,
              {
                backgroundColor: theme.colors.danger + '14',
                borderColor: theme.colors.danger + '40',
                opacity: pressed ? 0.75 : 1,
              },
            ]}>
            <Trash2
              size={13}
              color={theme.colors.danger}
              strokeWidth={2.6}
            />
            <Text
              style={[
                styles.actionText,
                {color: theme.colors.danger},
              ]}>
              Delete forever
            </Text>
          </Pressable>
        </View>
      </View>
    );
  };

  /* --------------------------- RENDER --------------------------- */
  const hasItems = trashedTasks.length > 0;

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <FlatList
        data={filteredTasks}
        keyExtractor={item => String(item.id)}
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        contentContainerStyle={[
          styles.listContent,
          filteredTasks.length === 0 && styles.emptyListContent,
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
            {/* HEADER */}
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
                <Text style={styles.title}>Trash</Text>
                <Text style={styles.subtitle}>
                  {hasItems
                    ? `${trashedTasks.length} item${
                        trashedTasks.length !== 1 ? 's' : ''
                      } · restore or delete`
                    : 'Deleted tasks appear here'}
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
                  {backgroundColor: theme.colors.danger + '18'},
                ]}>
                <Trash2
                  size={13}
                  color={theme.colors.danger}
                  strokeWidth={2.6}
                />
                <Text
                  style={[
                    styles.countNumber,
                    {color: theme.colors.danger},
                  ]}>
                  {trashedTasks.length}
                </Text>
              </View>
            </View>

            {/* SEARCH */}
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
                  placeholder="Search trash..."
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

            {/* INFO BANNER */}
            {hasItems && !search.trim() && (
              <View
                style={[
                  styles.infoBanner,
                  {
                    backgroundColor: theme.colors.primary + '0D',
                    borderColor: theme.colors.primary + '25',
                  },
                ]}>
                <Info
                  size={14}
                  color={theme.colors.primary}
                  strokeWidth={2.6}
                />
                <Text
                  style={[
                    styles.infoText,
                    {color: theme.colors.text},
                  ]}>
                  Items in trash are automatically deleted after 30 days. You can restore them anytime before then.
                </Text>
              </View>
            )}

            {/* EMPTY TRASH BAR */}
            {hasItems && !search.trim() && (
              <Pressable
                onPress={() => setConfirmEmptyTrash(true)}
                accessibilityRole="button"
                accessibilityLabel="Empty trash"
                style={({pressed}) => [
                  styles.emptyTrashBar,
                  {
                    backgroundColor: theme.colors.danger + '12',
                    borderColor: theme.colors.danger + '40',
                    opacity: pressed ? 0.85 : 1,
                  },
                ]}>
                <View
                  style={[
                    styles.emptyTrashIcon,
                    {backgroundColor: theme.colors.danger + '20'},
                  ]}>
                  <Flame
                    size={16}
                    color={theme.colors.danger}
                    strokeWidth={2.6}
                  />
                </View>
                <View style={{flex: 1, minWidth: 0}}>
                  <Text
                    style={[
                      styles.emptyTrashTitle,
                      {color: theme.colors.danger},
                    ]}>
                    Empty Trash
                  </Text>
                  <Text
                    style={[
                      styles.emptyTrashSub,
                      {color: theme.colors.textSecondary},
                    ]}
                    numberOfLines={1}>
                    Permanently delete all {trashedTasks.length} item
                    {trashedTasks.length !== 1 ? 's' : ''}
                  </Text>
                </View>
                <ChevronRight
                  size={18}
                  color={theme.colors.danger}
                  strokeWidth={2.4}
                />
              </Pressable>
            )}

            {/* STATS ROW */}
            {hasItems && !search.trim() && (
              <View style={styles.statsRow}>
                <View
                  style={[
                    styles.statMini,
                    {
                      backgroundColor: theme.colors.surface,
                      borderColor: theme.colors.border,
                    },
                  ]}>
                  <Layers
                    size={12}
                    color={theme.colors.danger}
                    strokeWidth={2.6}
                  />
                  <Text
                    style={[
                      styles.statMiniValue,
                      {color: theme.colors.text},
                    ]}>
                    {trashedTasks.length}
                  </Text>
                  <Text
                    style={[
                      styles.statMiniLabel,
                      {color: theme.colors.textSecondary},
                    ]}
                    numberOfLines={1}>
                    Items
                  </Text>
                </View>

                <View
                  style={[
                    styles.statMini,
                    {
                      backgroundColor: theme.colors.surface,
                      borderColor: theme.colors.border,
                    },
                  ]}>
                  <Clock
                    size={12}
                    color="#F59E0B"
                    strokeWidth={2.6}
                  />
                  <Text
                    style={[
                      styles.statMiniValue,
                      {color: theme.colors.text},
                    ]}>
                    {oldestDays > 0 ? `${oldestDays}d` : 'New'}
                  </Text>
                  <Text
                    style={[
                      styles.statMiniLabel,
                      {color: theme.colors.textSecondary},
                    ]}
                    numberOfLines={1}>
                    Oldest
                  </Text>
                </View>

                <View
                  style={[
                    styles.statMini,
                    {
                      backgroundColor: theme.colors.surface,
                      borderColor: theme.colors.border,
                    },
                  ]}>
                  <ShieldAlert
                    size={12}
                    color="#EF4444"
                    strokeWidth={2.6}
                  />
                  <Text
                    style={[
                      styles.statMiniValue,
                      {color: theme.colors.text},
                    ]}>
                    ∞
                  </Text>
                  <Text
                    style={[
                      styles.statMiniLabel,
                      {color: theme.colors.textSecondary},
                    ]}
                    numberOfLines={1}>
                    Kept
                  </Text>
                </View>
              </View>
            )}

            {/* RESULT COUNT */}
            {search.trim() && filteredTasks.length > 0 && (
              <Text
                style={[
                  styles.resultCount,
                  {color: theme.colors.textSecondary},
                ]}>
                {filteredTasks.length} result
                {filteredTasks.length !== 1 ? 's' : ''}
              </Text>
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
              ) : (
                <Inbox
                  size={32}
                  color={theme.colors.textLight}
                  strokeWidth={1.8}
                />
              )}
            </View>

            <Text
              style={[styles.emptyTitle, {color: theme.colors.text}]}>
              {search.trim() ? 'No matches' : 'Trash is empty'}
            </Text>

            <Text
              style={[
                styles.emptyText,
                {color: theme.colors.textSecondary},
              ]}>
              {search.trim()
                ? 'Try a different keyword.'
                : 'Deleted tasks will appear here. You can restore them or delete them permanently.'}
            </Text>
          </View>
        }
      />

      <ConfirmModal
        visible={confirmPermanentId !== null}
        title="Delete Forever?"
        message="This task will be permanently deleted and cannot be recovered."
        confirmText="Delete Forever"
        cancelText="Cancel"
        onConfirm={() => handlePermanentDelete(confirmPermanentId)}
        onCancel={() => setConfirmPermanentId(null)}
        danger
      />

      <ConfirmModal
        visible={confirmEmptyTrash}
        title="Empty Trash?"
        message={`Permanently delete all ${trashedTasks.length} item${
          trashedTasks.length !== 1 ? 's' : ''
        }? This cannot be undone.`}
        confirmText="Empty Trash"
        cancelText="Cancel"
        onConfirm={handleEmptyTrash}
        onCancel={() => setConfirmEmptyTrash(false)}
        danger
      />
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

    infoBanner: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      paddingHorizontal: 12,
      paddingVertical: 10,
      borderRadius: 12,
      borderWidth: 1,
      marginBottom: 10,
    },
    infoText: {
      flex: 1,
      fontSize: 11.5,
      fontWeight: '600',
      letterSpacing: 0.1,
      lineHeight: 16,
    },

    emptyTrashBar: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      paddingVertical: 12,
      paddingHorizontal: 12,
      borderRadius: 15,
      borderWidth: 1,
      marginBottom: 12,
    },
    emptyTrashIcon: {
      width: 36,
      height: 36,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
    },
    emptyTrashTitle: {
      fontSize: 14,
      fontWeight: '900',
      letterSpacing: -0.2,
    },
    emptyTrashSub: {
      fontSize: 11,
      fontWeight: '600',
      marginTop: 2,
      letterSpacing: 0.1,
    },

    statsRow: {
      flexDirection: 'row',
      gap: 8,
      marginBottom: 14,
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

    resultCount: {
      fontSize: 11,
      fontWeight: '700',
      letterSpacing: 0.4,
      textTransform: 'uppercase',
      marginBottom: 8,
    },

    listContent: {
      paddingHorizontal: 20,
      paddingBottom: Math.max(insets.bottom, 12) + 40,
    },
    emptyListContent: {
      flexGrow: 1,
    },

    card: {
      borderWidth: 1,
      borderRadius: 18,
      padding: 14,
      marginBottom: 10,
    },
    cardTopRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: 12,
    },
    trashIcon: {
      width: 42,
      height: 42,
      borderRadius: 13,
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
    },
    content: {
      flex: 1,
      minWidth: 0,
    },
    cardTitle: {
      fontSize: 14.5,
      fontWeight: '800',
      letterSpacing: -0.2,
      lineHeight: 20,
    },
    description: {
      fontSize: 12,
      fontWeight: '500',
      marginTop: 3,
      letterSpacing: 0.1,
    },
    metaRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 5,
      marginTop: 6,
      flexWrap: 'wrap',
    },
    categoryDot: {
      width: 6,
      height: 6,
      borderRadius: 3,
    },
    metaText: {
      fontSize: 11,
      fontWeight: '700',
      letterSpacing: 0.1,
      maxWidth: 100,
    },
    metaDot: {
      fontSize: 11,
    },

    actions: {
      flexDirection: 'row',
      gap: 8,
      marginTop: 12,
    },
    actionBtn: {
      flex: 1,
      minWidth: 0,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 6,
      minHeight: 40,
      borderRadius: 12,
      borderWidth: 1,
    },
    actionText: {
      fontSize: 12.5,
      fontWeight: '800',
      letterSpacing: 0.1,
    },

    emptyContainer: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 25,
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
      maxWidth: 290,
      fontWeight: '500',
    },
  });
}

export default TrashScreen;