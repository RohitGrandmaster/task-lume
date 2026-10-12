import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from 'react';

import {
  getItem,
  setItem,
} from '../storage/storage';

import APP_CONFIG from '../constants/appConfig';
import {createId} from '../utils/helpers';

// ✅ NEW: notification helpers
import {
  prepareTodoTimerNotifications,
  scheduleTodoTimer,
  cancelTodoTimer,
  notifyTimerCompleted,
  scheduleTodoReminder,
  cancelTodoReminder,
  rescheduleActiveTimers,
  rescheduleAllReminders,
} from '../utils/todoTimerNotifications';

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
   * ✅ NEW: App open hote hi active timers reschedule karo.
   */
  const loadTodos = useCallback(async () => {
    try {
      const savedTodos = await getItem(
        APP_CONFIG.STORAGE_KEYS.TODOS,
        null,
      );

      let loaded;
      if (Array.isArray(savedTodos)) {
        loaded = savedTodos.map(normalizeTodo);
      } else {
        loaded = INITIAL_TASKS.map(normalizeTodo);
      }

      setTasks(loaded);
      setLoading(false);

      // ✅ Non-blocking background notification setup
      prepareTodoTimerNotifications()
        .then(() => {
          rescheduleActiveTimers(loaded).catch(() => {});
          rescheduleAllReminders(loaded).catch(() => {});
        })
        .catch(() => {});
      return loaded;
    } catch (error) {
      console.log('Failed to load todos:', error);
      setTasks(INITIAL_TASKS.map(normalizeTodo));
      setLoading(false);
      return [];
    }
  }, []);

  useEffect(() => {
    loadTodos();
  }, [loadTodos]);

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
      timerEndAt: todo.timerEndAt ?? null,
      timerNotificationId: null,
      createdAt: Date.now(),
    });

    if (newTodo.reminder) {
      scheduleTodoReminder(newTodo).catch(() => {});
    }

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
      currentTasks.map(task => {
        if (String(task.id) === String(id)) {
          const merged = {
            ...task,
            ...updatedData,
          };
          if (merged.reminder && !merged.completed && !merged.deleted) {
            scheduleTodoReminder(merged).catch(() => {});
          } else if (task.reminder && (!merged.reminder || merged.completed || merged.deleted)) {
            cancelTodoReminder(task).catch(() => {});
          }
          return merged;
        }
        return task;
      }),
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
   * TOGGLE TODO REMINDER / ALERT
   */
  async function toggleTodoReminder(id) {
    const task = tasks.find(t => String(t.id) === String(id));
    if (!task) return;
    const nextVal = !task.reminder;
    if (nextVal) {
      await scheduleTodoReminder({...task, reminder: true});
    } else {
      await cancelTodoReminder(task);
    }
    setTasks(currentTasks =>
      currentTasks.map(t =>
        String(t.id) === String(id)
          ? {
              ...t,
              reminder: nextVal,
            }
          : t,
      ),
    );
  }

  /**
   * SET TIMER
   * ✅ NEW: Native notification bhi schedule karta hai.
   */
  async function setTodoTimer(id, minutes) {
    const task = tasks.find(t => String(t.id) === String(id));
    if (!task) return;

    // Purana notification cancel karo (agar tha)
    if (task.timerNotificationId) {
      await cancelTodoTimer(task);
    }

    // Naya schedule karo
    const result = await scheduleTodoTimer(task, minutes);
    if (!result) return;

    setTasks(currentTasks =>
      currentTasks.map(t =>
        String(t.id) === String(id)
          ? {
              ...t,
              timerEndAt: result.timerEndAt,
              timerNotificationId: result.timerNotificationId,
            }
          : t,
      ),
    );
  }

  /**
   * CLEAR TIMER
   * ✅ NEW: Native notification cancel + completion alert if expired.
   */
  async function clearTodoTimer(id, isExpired = false) {
    const task = tasks.find(t => String(t.id) === String(id));

    if (task) {
      if (isExpired) {
        await notifyTimerCompleted(task);
      }
      await cancelTodoTimer(task);
    }

    setTasks(currentTasks =>
      currentTasks.map(t =>
        String(t.id) === String(id)
          ? {
              ...t,
              timerEndAt: null,
              timerNotificationId: null,
            }
          : t,
      ),
    );
  }

  /**
   * TOGGLE COMPLETE / ACTIVE
   */
  function toggleTodo(id) {
    setTasks(currentTasks =>
      currentTasks.map(task => {
        if (String(task.id) === String(id)) {
          const nextCompleted = !task.completed;
          if (nextCompleted && task.reminder) {
            cancelTodoReminder(task).catch(() => {});
          } else if (!nextCompleted && task.reminder) {
            scheduleTodoReminder(task).catch(() => {});
          }
          return {
            ...task,
            completed: nextCompleted,
          };
        }
        return task;
      }),
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
   * ✅ NEW: Timer aur reminder notification bhi cancel karo.
   */
  function deleteTodo(id) {
    const task = tasks.find(t => String(t.id) === String(id));
    if (task) {
      if (task.timerEndAt || task.timerNotificationId) {
        cancelTodoTimer(task).catch(() => {});
      }
      if (task.reminder) {
        cancelTodoReminder(task).catch(() => {});
      }
    }

    setTasks(currentTasks =>
      currentTasks.map(task =>
        String(task.id) === String(id)
          ? {
              ...task,
              deleted: true,
              timerEndAt: null,
              timerNotificationId: null,
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
      currentTasks.map(task => {
        if (String(task.id) === String(id)) {
          if (task.reminder && !task.completed) {
            scheduleTodoReminder(task).catch(() => {});
          }
          return {
            ...task,
            deleted: false,
          };
        }
        return task;
      }),
    );
  }

  /**
   * PERMANENT DELETE
   * ✅ NEW: Timer aur reminder notification bhi cancel karo.
   */
  function permanentlyDeleteTodo(id) {
    const task = tasks.find(t => String(t.id) === String(id));
    if (task) {
      if (task.timerEndAt || task.timerNotificationId) {
        cancelTodoTimer(task).catch(() => {});
      }
      if (task.reminder) {
        cancelTodoReminder(task).catch(() => {});
      }
    }

    setTasks(currentTasks =>
      currentTasks.filter(
        task => String(task.id) !== String(id),
      ),
    );
  }

  /**
   * DELETE ALL TODOS
   * ✅ NEW: Sabhi notifications cancel karo.
   */
  function clearTodos() {
    tasks.forEach(task => {
      if (task.timerEndAt || task.timerNotificationId) {
        cancelTodoTimer(task).catch(() => {});
      }
    });

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

  /**
   * IMPORT TODOS FROM BACKUP
   */
  function importTodos(importedList) {
    if (!Array.isArray(importedList)) return;
    const normalized = importedList.map(normalizeTodo);
    setTasks(normalized);
  }

  return (
    <TodoContext.Provider
      value={{
        tasks,
        loading,
        loadTodos,

        addTodo,
        updateTodo,
        importTodos,

        toggleTodo,
        toggleFavorite,

        togglePinTodo,
        setTodoPinned,

        // ✅ Reminder / Alert functions
        toggleTodoReminder,

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