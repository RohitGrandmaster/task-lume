import {
  Text,
  View,
  StyleSheet,
} from 'react-native';

import TodoForm from '../../components/todo/TodoForm';
import Loader from '../../components/common/Loader';

import useTodos from '../../hooks/useTodos';
import useTheme from '../../hooks/useTheme';

function EditTodoScreen({
  navigation,
  route,
}) {
  const {theme} = useTheme();

  const {
    tasks,
    loading,
    updateTodo,
  } = useTodos();

  const styles = createStyles(theme);

  const todo = tasks.find(
    item =>
      String(item.id) ===
      String(route.params?.todoId),
  );

  if (loading) {
    return <Loader fullScreen />;
  }

  if (!todo) {
    return (
      <View style={styles.notFound}>
        <Text style={styles.title}>
          Todo not found
        </Text>

        <Text style={styles.text}>
          This todo may have already been deleted.
        </Text>
      </View>
    );
  }

  async function handleSubmit(updatedTodo) {
    updateTodo(
      todo.id,
      updatedTodo,
    );

    navigation.goBack();
  }

  return (
    <TodoForm
      title="Edit Task"
      subtitle="Update the details of your task."
      initialTodo={todo}
      onSubmit={handleSubmit}
      onCancel={() => navigation.goBack()}
    />
  );
}

function createStyles(theme) {
  return StyleSheet.create({
    notFound: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      padding: theme.spacing.xl,
      backgroundColor: theme.colors.background,
    },

    title: {
      fontSize: theme.typography.heading,
      fontWeight: '800',
      color: theme.colors.text,
    },

    text: {
      marginTop: theme.spacing.sm,
      fontSize: theme.typography.bodySmall,
      textAlign: 'center',
      color: theme.colors.textSecondary,
    },
  });
}

export default EditTodoScreen;