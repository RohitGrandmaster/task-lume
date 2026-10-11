import {
  createContext,
  useContext,
  useEffect,
  useState,
} from 'react';

import {
  getItem,
  setItem,
} from '../storage/storage';

import APP_CONFIG from '../constants/appConfig';
import {createId} from '../utils/helpers';

const TodoContext = createContext(null);

const INITIAL_TASKS = [
  {
    id: 1,
    title: 'Learn React Native',
    description: 'Learn components, props and hooks',
    completed: false,
    category: 'Learning',
    priority: 'high',
    dueDate: 'Today',
    reminder: false,
    favorite: true,
    deleted: false,
    pinned: false,
    timerEndAt: null,
    timerNotificationId: null,
    createdAt: Date.now(),
  },
  {
    id: 2,
    title: 'Learn JavaScript',
    description: 'Practice arrays and objects',
    completed: true,
    category: 'Learning',
    priority: 'medium',
    dueDate: 'Tomorrow',
    reminder: false,
    favorite: false,
    deleted: false,
    pinned: false,
    timerEndAt: null,
    timerNotificationId: null,
    createdAt: Date.now(),
  },
  {
    id: 3,
    title: 'Build Todo App',
    description: 'Create a complete CRUD application',
    completed: false,
    category: 'Project',
    priority: 'high',
    dueDate: 'Next week',
    reminder: false,
    favorite: true,
    deleted: false,
    pinned: false,
    timerEndAt: null,
    timerNotificationId: null,
    createdAt: Date.now(),
  },
];

/**
 * Existing saved todos ko normalize karta hai.
 * Purane todos ke missing fields ke liye defaults add karta hai.
 */
function normalizeTodo(todo) {
  return {
    id: todo.id ?? createId(),
    title: todo.title ?? '',
    description: todo.description ?? '',
    completed: todo.completed ?? false,
    category: todo.category ?? 'Personal',
    priority: todo.priority ?? 'medium',
    dueDate: todo.dueDate ?? 'No date',
    reminder: todo.reminder ?? false,
    favorite: todo.favorite ?? false,
    deleted: todo.deleted ?? false,

    // Pin feature
    pinned: todo.pinned ?? false,

    // Timer feature
    timerEndAt: todo.timerEndAt ?? null,
    timerNotificationId: todo.timerNotificationId ?? null,

    // Extra fields (AddTodoScreen se aate hain)
    color: todo.color ?? null,
    status: todo.status ?? 'pending',
    startedAt: todo.startedAt ?? null,

    createdAt: todo.createdAt ?? Date.now(),
  };
}

function TodoProvider({children}) {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  /**
   * Load todos from AsyncStorage.
   */
  useEffect(() => {
    async function loadTodos() {
      try {
        const savedTodos = await getItem(
          APP_CONFIG.STORAGE_KEYS.TODOS,
          null,
        );

        if (Array.isArray(savedTodos)) {
          const normalizedTodos = savedTodos.map(normalizeTodo);
          setTasks(normalizedTodos);
        } else {
          setTasks(INITIAL_TASKS.map(normalizeTodo));
        }
      } catch (error) {
        console.log('Failed to load todos:', error);
        setTasks(INITIAL_TASKS.map(normalizeTodo));
      } finally {
        setLoading(false);
      }
    }

    loadTodos();
  }, []);

  /**
   * Save todos whenever tasks change.
   */
  useEffect(() => {
    if (!loading) {
      setItem(
        APP_CONFIG.STORAGE_KEYS.TODOS,
        tasks,
      ).catch(error => {
        console.log('Failed to save todos:', error);
      });
    }
  }, [tasks, loading]);

  /**
   * ADD TODO
   */
  function addTodo(todo) {
    const newTodo = normalizeTodo({
      ...todo,
      id: createId(),
      completed: false,
      favorite: todo.favorite ?? false,
      deleted: false,
      pinned: todo.pinned ?? false,
      // ✅ Timer input ko respect karo (pehle yahan force null tha)
      timerEndAt: todo.timerEndAt ?? null,
      timerNotificationId: null,
      createdAt: Date.now(),
    });

    setTasks(currentTasks => [
      ...currentTasks,
      newTodo,
    ]);
  }

  /**
   * UPDATE TODO
   */
  function updateTodo(id, updatedData) {
    setTasks(currentTasks =>
      currentTasks.map(task =>
        String(task.id) === String(id)
          ? {
              ...task,
              ...updatedData,
            }
          : task,
      ),
    );
  }

  /**
   * TOGGLE PIN / UNPIN
   */
  function togglePinTodo(id) {
    setTasks(currentTasks =>
      currentTasks.map(task =>
        String(task.id) === String(id)
          ? {
              ...task,
              pinned: !task.pinned,
            }
          : task,
      ),
    );
  }

  /**
   * SET PIN STATUS DIRECTLY
   */
  function setTodoPinned(id, pinned) {
    setTasks(currentTasks =>
      currentTasks.map(task =>
        String(task.id) === String(id)
          ? {
              ...task,
              pinned: Boolean(pinned),
            }
          : task,
      ),
    );
  }

  /**
   * SET TIMER
   * minutes ke hisab se end timestamp set karta hai.
   */
  function setTodoTimer(id, minutes) {
    const endAt = Date.now() + minutes * 60 * 1000;

    setTasks(currentTasks =>
      currentTasks.map(task =>
        String(task.id) === String(id)
          ? {
              ...task,
              timerEndAt: endAt,
            }
          : task,
      ),
    );
  }

  /**
   * CLEAR TIMER
   */
  function clearTodoTimer(id) {
    setTasks(currentTasks =>
      currentTasks.map(task =>
        String(task.id) === String(id)
          ? {
              ...task,
              timerEndAt: null,
              timerNotificationId: null,
            }
          : task,
      ),
    );
  }

  /**
   * TOGGLE COMPLETE / ACTIVE
   */
  function toggleTodo(id) {
    setTasks(currentTasks =>
      currentTasks.map(task =>
        String(task.id) === String(id)
          ? {
              ...task,
              completed: !task.completed,
            }
          : task,
      ),
    );
  }

  /**
   * TOGGLE FAVORITE
   */
  function toggleFavorite(id) {
    setTasks(currentTasks =>
      currentTasks.map(task =>
        String(task.id) === String(id)
          ? {
              ...task,
              favorite: !task.favorite,
            }
          : task,
      ),
    );
  }

  /**
   * SOFT DELETE
   */
  function deleteTodo(id) {
    setTasks(currentTasks =>
      currentTasks.map(task =>
        String(task.id) === String(id)
          ? {
              ...task,
              deleted: true,
            }
          : task,
      ),
    );
  }

  /**
   * RESTORE FROM TRASH
   */
  function restoreTodo(id) {
    setTasks(currentTasks =>
      currentTasks.map(task =>
        String(task.id) === String(id)
          ? {
              ...task,
              deleted: false,
            }
          : task,
      ),
    );
  }

  /**
   * PERMANENT DELETE
   */
  function permanentlyDeleteTodo(id) {
    setTasks(currentTasks =>
      currentTasks.filter(
        task => String(task.id) !== String(id),
      ),
    );
  }

  /**
   * DELETE ALL TODOS
   */
  function clearTodos() {
    setTasks([]);
  }

  /**
   * FIND TODO BY ID
   */
  function getTodoById(id) {
    return tasks.find(
      task => String(task.id) === String(id),
    );
  }

  /**
   * GET ACTIVE TODOS
   */
  function getActiveTodos() {
    return tasks.filter(
      task => !task.completed && !task.deleted,
    );
  }

  /**
   * GET COMPLETED TODOS
   */
  function getCompletedTodos() {
    return tasks.filter(
      task => task.completed && !task.deleted,
    );
  }

  /**
   * GET FAVORITE TODOS
   */
  function getFavoriteTodos() {
    return tasks.filter(
      task => task.favorite && !task.deleted,
    );
  }

  /**
   * GET PINNED TODOS
   */
  function getPinnedTodos() {
    return tasks.filter(
      task => task.pinned && !task.deleted,
    );
  }

  /**
   * GET TRASH TODOS
   */
  function getTrashTodos() {
    return tasks.filter(
      task => task.deleted,
    );
  }

  return (
    <TodoContext.Provider
      value={{
        tasks,
        loading,

        addTodo,
        updateTodo,

        toggleTodo,
        toggleFavorite,

        togglePinTodo,
        setTodoPinned,

        // ✅ Timer functions
        setTodoTimer,
        clearTodoTimer,

        deleteTodo,
        restoreTodo,
        permanentlyDeleteTodo,

        clearTodos,

        getTodoById,

        getActiveTodos,
        getCompletedTodos,
        getFavoriteTodos,
        getPinnedTodos,
        getTrashTodos,
      }}>
      {children}
    </TodoContext.Provider>
  );
}

function useTodoContext() {
  const context = useContext(TodoContext);

  if (!context) {
    throw new Error(
      'useTodoContext must be used inside TodoProvider.',
    );
  }

  return context;
}

export {
  TodoProvider,
  useTodoContext,
};