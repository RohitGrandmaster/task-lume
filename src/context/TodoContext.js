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
import {getNextDueDate, isRecurring} from '../utils/recurrence';
import {stopSound} from '../services/soundService';

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
import {parseTaskDueDate, toDateOnlyTimestamp} from '../utils/dateUtils';

const TodoContext = createContext(null);
const CUSTOM_CATEGORIES_KEY = '@todomaster/custom_categories';

function normalizeCategoryName(name) {
  if (typeof name !== 'string') return '';
  return name.trim().replace(/\s+/g, ' ');
}

function normalizeCategoryList(value) {
  if (!Array.isArray(value)) return [];
  const seen = new Set();
  const result = [];
  value.forEach(entry => {
    const name = normalizeCategoryName(entry);
    const key = name.toLowerCase();
    if (name && !seen.has(key)) {
      seen.add(key);
      result.push(name);
    }
  });
  return result;
}

/**
 * Normalize dueDate to a consistent value.
 * Keeps "No date", converts Today/Tomorrow to ISO YYYY-MM-DD,
 * and preserves already valid ISO dates.
 */
function normalizeDueDate(dueDate) {
  if (!dueDate || dueDate === 'No date' || dueDate === 'no date') {
    return 'No date';
  }

  const dd = String(dueDate).trim();
  const lower = dd.toLowerCase();

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  if (lower === 'today') {
    return today.toISOString().slice(0, 10);
  }

  if (lower === 'tomorrow') {
    const t = new Date(today);
    t.setDate(t.getDate() + 1);
    return t.toISOString().slice(0, 10);
  }

  if (lower === 'next week' || lower === 'nextweek') {
    const t = new Date(today);
    t.setDate(t.getDate() + 7);
    return t.toISOString().slice(0, 10);
  }

  // Already ISO YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(dd)) {
    return dd;
  }

  // Try parse other formats
  const parsed = new Date(dd);
  if (!isNaN(parsed.getTime())) {
    return parsed.toISOString().slice(0, 10);
  }

  // Fallback – keep original if we can't understand it
  return dd;
}

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
    dueDate: normalizeDueDate(todo.dueDate),
    reminder: todo.reminder ?? false,
    favorite: todo.favorite ?? false,
    deleted: todo.deleted ?? false,

    // Pin feature
    pinned: todo.pinned ?? false,

    // Recurrence: none | daily | weekly | monthly
    recurrence: todo.recurrence || 'none',

    // Timer feature
    timerEndAt: todo.timerEndAt ?? null,
    timerNotificationId: todo.timerNotificationId ?? null,

    // Extra fields (AddTodoScreen se aate hain)
    color: todo.color ?? null,
    status: todo.status ?? 'pending',
    startedAt: todo.startedAt ?? null,
    reminderTime: todo.reminderTime ?? null,

    // Timestamps
    createdAt: todo.createdAt ?? Date.now(),
    completedAt: todo.completedAt ?? null,
    deletedAt: todo.deletedAt ?? null,
    dueDateTimestamp: todo.dueDateTimestamp ?? toDateOnlyTimestamp(todo.dueDate),
  };
}

export const TRASH_RETENTION_DAYS = 30;
export const TRASH_RETENTION_MS = TRASH_RETENTION_DAYS * 24 * 60 * 60 * 1000;

/**
 * Filter out tasks in trash that have exceeded retention period (30 days)
 */
function purgeExpiredTrash(todoList, retentionDays = TRASH_RETENTION_DAYS) {
  const cutoff = Date.now() - retentionDays * 24 * 60 * 60 * 1000;
  return todoList.filter(task => {
    if (!task.deleted) return true;
    if (!task.deletedAt) return true; // keep if no timestamp
    return task.deletedAt > cutoff;
  });
}

function TodoProvider({children}) {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [customCategories, setCustomCategories] = useState([]);
  const [categoriesLoaded, setCategoriesLoaded] = useState(false);

  // Load custom categories from storage
  useEffect(() => {
    let active = true;
    getItem(CUSTOM_CATEGORIES_KEY, [])
      .then(saved => {
        if (active) setCustomCategories(normalizeCategoryList(saved));
      })
      .catch(err => {
        console.warn('[TodoContext] could not load categories:', err);
      })
      .finally(() => {
        if (active) setCategoriesLoaded(true);
      });
    return () => {
      active = false;
    };
  }, []);

  // Save custom categories to storage whenever changed
  useEffect(() => {
    if (categoriesLoaded) {
      setItem(CUSTOM_CATEGORIES_KEY, normalizeCategoryList(customCategories)).catch(err => {
        console.warn('[TodoContext] could not save categories:', err);
      });
    }
  }, [customCategories, categoriesLoaded]);

  /**
   * Load todos from AsyncStorage.
   * ✅ Auto-cleans trash tasks older than 30 days.
   * ✅ App open hote hi active timers reschedule karo.
   */
  const loadTodos = useCallback(async () => {
    try {
      const savedTodos = await getItem(
        APP_CONFIG.STORAGE_KEYS.TODOS,
        null,
      );

      let loaded;
      if (Array.isArray(savedTodos)) {
        const normalized = savedTodos.map(normalizeTodo);
        loaded = purgeExpiredTrash(normalized);
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
      recurrence: todo.recurrence || 'none',
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
            // Always normalize dueDate if it was changed
            dueDate:
              updatedData.dueDate !== undefined
                ? normalizeDueDate(updatedData.dueDate)
                : task.dueDate,
          };
          if (merged.reminder && !merged.completed && !merged.deleted) {
            scheduleTodoReminder(merged).catch(() => {});
          } else if (
            task.reminder &&
            (!merged.reminder || merged.completed || merged.deleted)
          ) {
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
   */
  async function setTodoTimer(id, minutes) {
    const task = tasks.find(t => String(t.id) === String(id));
    if (!task) return;

    if (task.timerNotificationId) {
      await cancelTodoTimer(task);
    }

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
   */
  async function clearTodoTimer(id, isExpired = false) {
    const task = tasks.find(t => String(t.id) === String(id));

    if (task) {
      if (isExpired) {
        await notifyTimerCompleted(task);
        await cancelTodoTimer(task, false);
      } else {
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
   * When completing a recurring task, automatically creates the next occurrence.
   */
  function toggleTodo(id) {
    setTasks(currentTasks => {
      let nextOccurrence = null;

      const updated = currentTasks.map(task => {
        if (String(task.id) !== String(id)) return task;

        const nextCompleted = !task.completed;

        if (nextCompleted && task.reminder) {
          cancelTodoReminder(task).catch(() => {});
        } else if (!nextCompleted && task.reminder) {
          scheduleTodoReminder(task).catch(() => {});
        }

        // When completing a recurring task, schedule the next occurrence
        if (nextCompleted && isRecurring(task)) {
          const nextDue = getNextDueDate(task.dueDate, task.recurrence);
          if (nextDue) {
            nextOccurrence = normalizeTodo({
              ...task,
              id: createId(),
              completed: false,
              completedAt: null,
              deleted: false,
              deletedAt: null,
              dueDate: nextDue,
              timerEndAt: null,
              timerNotificationId: null,
              pinned: false,
              createdAt: Date.now(),
            });
          }
        }

        return {
          ...task,
          completed: nextCompleted,
          completedAt: nextCompleted ? Date.now() : null,
        };
      });

      if (nextOccurrence) {
        if (nextOccurrence.reminder) {
          scheduleTodoReminder(nextOccurrence).catch(() => {});
        }
        return [...updated, nextOccurrence];
      }

      return updated;
    });
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
   * BATCH PERMANENT DELETE
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

  function getTodoById(id) {
    return tasks.find(
      task => String(task.id) === String(id),
    );
  }

  function getActiveTodos() {
    return tasks.filter(
      task => !task.completed && !task.deleted,
    );
  }

  function getCompletedTodos() {
    return tasks.filter(
      task => task.completed && !task.deleted,
    );
  }

  function getFavoriteTodos() {
    return tasks.filter(
      task => task.favorite && !task.deleted,
    );
  }

  function getPinnedTodos() {
    return tasks.filter(
      task => task.pinned && !task.deleted,
    );
  }

  function getTrashTodos() {
    return tasks.filter(
      task => task.deleted,
    );
  }

  function importTodos(importedList, mode = 'replace') {
    if (!Array.isArray(importedList)) return;
    const normalized = importedList.map(normalizeTodo);
    if (mode === 'merge') {
      setTasks(currentTasks => {
        const existingIds = new Set(currentTasks.map(t => String(t.id)));
        const newItems = normalized.filter(t => !existingIds.has(String(t.id)));
        return [...currentTasks, ...newItems];
      });
    } else {
      setTasks(normalized);
    }
  }

  /**
   * ADD CUSTOM CATEGORY
   */
  const addCategory = useCallback((input) => {
    const name = normalizeCategoryName(input);
    if (!name) return false;

    const taken = new Set([
      ...customCategories,
      ...(tasks || []).filter(task => task && !task.deleted).map(task => task.category || 'General'),
    ].map(v => String(v).trim().toLowerCase()));

    if (taken.has(name.toLowerCase())) return false;

    setCustomCategories(current => normalizeCategoryList([...current, name]));
    return true;
  }, [customCategories, tasks]);

  /**
   * RENAME CATEGORY
   */
  const renameCategory = useCallback((oldInput, newInput) => {
    const oldName = normalizeCategoryName(oldInput);
    const newName = normalizeCategoryName(newInput);
    if (!oldName || !newName) return false;
    if (oldName === newName) return true;

    setCustomCategories(current => {
      const exists = current.some(n => n === oldName);
      const updated = current.map(n => n === oldName ? newName : n);
      if (!exists) updated.push(newName);
      return normalizeCategoryList(updated);
    });

    setTasks(current => current.map(task =>
      task && task.category === oldName ? {...task, category: newName} : task
    ));
    return true;
  }, []);

  /**
   * DELETE CATEGORY (re-homes tasks to 'General')
   */
  const deleteCategory = useCallback((input) => {
    const name = normalizeCategoryName(input);
    if (!name) return false;

    setCustomCategories(current => current.filter(c => c !== name));
    setTasks(current => current.map(task =>
      task && task.category === name ? {...task, category: 'General'} : task
    ));
    return true;
  }, []);

  /**
   * MANUALLY TRIGGER AUTO-CLEAN OF EXPIRED TRASH
   */
  const autoCleanTrash = useCallback((retentionDays = TRASH_RETENTION_DAYS) => {
    let purgedCount = 0;
    setTasks(currentTasks => {
      const remaining = purgeExpiredTrash(currentTasks, retentionDays);
      purgedCount = currentTasks.length - remaining.length;
      return remaining;
    });
    return purgedCount;
  }, []);

  return (
    <TodoContext.Provider
      value={{
        tasks,
        loading,
        loadTodos,
        TRASH_RETENTION_DAYS,
        autoCleanTrash,

        // Custom Categories
        customCategories,
        addCategory,
        renameCategory,
        deleteCategory,

        addTodo,
        updateTodo,
        importTodos,

        toggleTodo,
        toggleFavorite,

        togglePinTodo,
        setTodoPinned,

        toggleTodoReminder,

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
