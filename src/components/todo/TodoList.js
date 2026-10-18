import {useMemo, useCallback} from 'react';
import {
  FlatList,
  Text,
  View,
  StyleSheet,
  RefreshControl,
  Platform,
} from 'react-native';

import TodoItem from './TodoItem';
import useTheme from '../../hooks/useTheme';

/**
 * Supports both prop styles used across the app:
 *  - HomeScreen: tasks, onToggle, onPress, onLongPress, onDelete, onFavorite, setOpenSwipeId
 *  - Legacy: todos, onTodoPress, onToggleTodo, etc.
 */
function TodoList({
  // New / HomeScreen API
  tasks,
  onToggle,
  onPress,
  onLongPress,
  onDelete,
  onFavorite,
  onPin,
  setOpenSwipeId,
  // Legacy API
  todos,
  onTodoPress,
  onTodoLongPress,
  onToggleTodo,
  onEditTodo,
  onDeleteTodo,
  onToggleFavorite,
  onSwipeOpen,
  openSwipeId,
  refreshing = false,
  onRefresh,
}) {
  const {theme} = useTheme();
  const styles = createStyles(theme);

  const data = tasks || todos || [];

  const handlePress = onPress || onTodoPress;
  const handleLongPress = onLongPress || onTodoLongPress;
  const handleToggle = onToggle || onToggleTodo;
  const handleDelete = onDelete || onDeleteTodo;
  const handleFavorite = onFavorite || onToggleFavorite;
  const handleSwipeOpen = onSwipeOpen || setOpenSwipeId;

  const sortedTodos = useMemo(
    () =>
      [...data].sort(
        (a, b) => Number(Boolean(b.pinned)) - Number(Boolean(a.pinned)),
      ),
    [data],
  );

  const renderItem = useCallback(
    ({item}) => (
      <TodoItem
        todo={item}
        onPress={handlePress}
        onLongPress={handleLongPress}
        onToggle={handleToggle}
        onEdit={onEditTodo}
        onDelete={handleDelete}
        onToggleFavorite={handleFavorite}
        isSwipeOpen={openSwipeId === item.id}
        onSwipeOpen={handleSwipeOpen}
      />
    ),
    [
      handlePress,
      handleLongPress,
      handleToggle,
      onEditTodo,
      handleDelete,
      handleFavorite,
      openSwipeId,
      handleSwipeOpen,
    ],
  );

  return (
    <FlatList
      data={sortedTodos}
      keyExtractor={item => String(item.id)}
      renderItem={renderItem}
      initialNumToRender={10}
      maxToRenderPerBatch={10}
      windowSize={7}
      removeClippedSubviews={Platform.OS === 'android'}
      ListEmptyComponent={
        <View style={styles.empty}>
          <Text style={styles.emptyTitle}>No todos found</Text>
          <Text style={styles.emptyText}>
            Add a task or change your search/filter.
          </Text>
        </View>
      }
      contentContainerStyle={
        data.length === 0 ? styles.emptyList : styles.list
      }
      showsVerticalScrollIndicator={false}
      refreshControl={
        onRefresh ? (
          <RefreshControl
            refreshing={Boolean(refreshing)}
            onRefresh={onRefresh}
            colors={[theme.colors.primary]}
            tintColor={theme.colors.primary}
          />
        ) : undefined
      }
    />
  );
}

function createStyles(theme) {
  return StyleSheet.create({
    list: {
      paddingTop: theme.spacing.sm,
      paddingBottom: 100,
    },
    emptyList: {
      flexGrow: 1,
      padding: theme.spacing.xl,
      alignItems: 'center',
      justifyContent: 'center',
    },
    empty: {
      alignItems: 'center',
    },
    emptyTitle: {
      fontSize: theme.typography.subheading,
      fontWeight: '800',
      color: theme.colors.text,
    },
    emptyText: {
      marginTop: theme.spacing.sm,
      textAlign: 'center',
      fontSize: theme.typography.bodySmall,
      lineHeight: 20,
      color: theme.colors.textSecondary,
    },
  });
}

export default TodoList;
