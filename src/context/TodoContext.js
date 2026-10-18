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
import {createId, purgeExpiredTrash} from '../utils/helpers';
import {toDateOnlyTimestamp} from '../utils/dateUtils';
import {stopSound} from '../services/soundService';

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

// ✅ Fresh install pe koi default tasks nahi — empty list se shuru hoga

/**
 * Existing saved todos ko normalize karta hai.
 * Purane todos ke missing fields ke liye defaults add karta hai.
 */
function normalizeTodo(todo) {
  const source = todo && typeof todo === 'object' && !Array.isArray(todo) ? todo : {};
  const dueDate = source.dueDate ?? 'No date';
  const dueDateTimestamp =
    Number.isFinite(source.dueDateTimestamp) && source.dueDateTimestamp > 0
      ? source.dueDateTimestamp
      : toDateOnlyTimestamp(dueDate);

  return {
    id: source.id ?? createId(),
    title: typeof source.title === 'string' ? source.title : '',
    description: typeof source.description === 'string' ? source.description : '',
    completed: source.completed === true,
    category: typeof source.category === 'string' && source.category.trim()
      ? source.category.trim()
      : 'Personal',
    priority: ['low', 'medium', 'high'].includes(source.priority)
      ? source.priority
      : 'medium',
    dueDate,
    dueDateTimestamp,
    reminder: source.reminder === true && Boolean(dueDateTimestamp),
    reminderNotificationId: source.reminderNotificationId ?? null,
    reminderTimestamp: source.reminderTimestamp ?? null,
    favorite: source.favorite === true,
    deleted: source.deleted === true,
    pinned: source.pinned === true,
    timerEndAt: Number.isFinite(source.timerEndAt) ? source.timerEndAt : null,
    timerNotificationId: source.timerNotificationId ?? null,
    color: source.color ?? null,
    status: source.status ?? 'pending',
    startedAt: source.startedAt ?? null,
    createdAt: source.createdAt ?? Date.now(),
    completedAt: source.completedAt ?? null,
    deletedAt: source.deletedAt ?? null,
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
        loaded = purgeExpiredTrash(savedTodos.map(normalizeTodo));
      } else {
        // ✅ Pehli baar install pe empty list — koi default tasks nahi
        loaded = [];
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
      setTasks([]);
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
      await scheduleTodoReminder({...task, reminder: true}, true);
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
        // Only cancel trigger and start notification, leave completion banner visible
        await cancelTodoTimer(task, false);
      } else {
        // Manually cleared before expiration
        stopSound();
        await cancelTodoTimer(task, true);
      }
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
            completedAt: nextCompleted ? Date.now() : null,
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
              deletedAt: Date.now(),
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
   * BATCH PERMANENT DELETE (Empty Trash efficiently in a single state update)
   */
  function batchPermanentlyDelete(ids) {
    if (!Array.isArray(ids) || ids.length === 0) return;
    const idSet = new Set(ids.map(String));

    tasks.forEach(task => {
      if (idSet.has(String(task.id))) {
        if (task.timerEndAt || task.timerNotificationId) {
          cancelTodoTimer(task).catch(() => {});
        }
        if (task.reminder) {
          cancelTodoReminder(task).catch(() => {});
        }
      }
    });

    setTasks(currentTasks =>
      currentTasks.filter(task => !idSet.has(String(task.id))),
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
      if (task.reminder) {
        cancelTodoReminder(task).catch(() => {});
      }
    });
    stopSound();

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
        batchPermanentlyDelete,

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