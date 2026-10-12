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

function TodoList({
  todos,
  onTodoPress,
  onTodoLongPress,
  onToggleTodo,
  onEditTodo,
  onDeleteTodo,
  onToggleFavorite,
  // ✅ Single swipe open
  openSwipeId,
  onSwipeOpen,
  refreshing = false,
  onRefresh,
}) {
  const {theme} = useTheme();
  const styles = createStyles(theme);

  // Pinned todos ko sabse upar (memoized)
  const sortedTodos = useMemo(
    () =>
      [...todos].sort(
        (a, b) =>
          Number(Boolean(b.pinned)) - Number(Boolean(a.pinned)),
      ),
    [todos],
  );

  const renderItem = useCallback(
    ({item}) => (
      <TodoItem
        todo={item}
        onPress={onTodoPress}
        onLongPress={onTodoLongPress}
        onToggle={onToggleTodo}
        onEdit={onEditTodo}
        onDelete={onDeleteTodo}
        onToggleFavorite={onToggleFavorite}
        isSwipeOpen={openSwipeId === item.id}
        onSwipeOpen={onSwipeOpen}
      />
    ),
    [
      onTodoPress,
      onTodoLongPress,
      onToggleTodo,
      onEditTodo,
      onDeleteTodo,
      onToggleFavorite,
      openSwipeId,
      onSwipeOpen,
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
        todos.length === 0 ? styles.emptyList : styles.list
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