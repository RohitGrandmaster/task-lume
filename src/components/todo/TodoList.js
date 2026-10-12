import {
  FlatList,
  Text,
  View,
  StyleSheet,
  RefreshControl,
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

  // Pinned todos ko sabse upar
  const sortedTodos = [...todos].sort(
    (a, b) =>
      Number(Boolean(b.pinned)) - Number(Boolean(a.pinned)),
  );

  return (
    <FlatList
      data={sortedTodos}
      keyExtractor={item => String(item.id)}
      renderItem={({item}) => (
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
      )}
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