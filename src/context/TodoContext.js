import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useRef,
} from 'react';
import {AppState} from 'react-native';

import {getItem, setItem} from '../storage/storage';

import APP_CONFIG from '../constants/appConfig';
import {createId} from '../utils/helpers';
import {getNextDueDate, isRecurring} from '../utils/recurrence';
import {stopSound} from '../services/soundService';

import {
  prepareTodoTimerNotifications,
  showTimerStartedNotification,
  scheduleTodoTimerAt,
  cancelTodoTimer,
  notifyTimerCompleted,
  scheduleTodoReminder,
  cancelTodoReminder,
  rescheduleAllReminders,
} from '../utils/todoTimerNotifications';

import {
  normalizeCategoryName,
  normalizeCategoryList,
  normalizeDueDate,
  normalizeTodo,
  purgeExpiredTrash,
  TRASH_RETENTION_DAYS,
  TRASH_RETENTION_MS,
} from '../utils/todoHelpers';

const TodoContext = createContext(null);
const CUSTOM_CATEGORIES_KEY = '@todomaster/custom_categories';

function TodoProvider({children}) {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [customCategories, setCustomCategories] = useState([]);
  const [categoriesLoaded, setCategoriesLoaded] = useState(false);

  const tasksRef = useRef(tasks);
  useEffect(() => {
    tasksRef.current = tasks;
  }, [tasks]);

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

  useEffect(() => {
    if (categoriesLoaded) {
      setItem(
        CUSTOM_CATEGORIES_KEY,
        normalizeCategoryList(customCategories),
      ).catch(err => {
        console.warn('[TodoContext] could not save categories:', err);
      });
    }
  }, [customCategories, categoriesLoaded]);

  const loadTodos = useCallback(async () => {
    try {
      const savedTodos = await getItem(APP_CONFIG.STORAGE_KEYS.TODOS, null);

      let loaded;
      if (Array.isArray(savedTodos)) {
        const normalized = savedTodos.map(normalizeTodo);
        loaded = purgeExpiredTrash(normalized);
      } else {
        loaded = [];
      }

      setTasks(loaded);
      setLoading(false);

      prepareTodoTimerNotifications()
        .then(() => {
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

  useEffect(() => {
    if (!loading) {
      setItem(APP_CONFIG.STORAGE_KEYS.TODOS, tasks).catch(error => {
        console.log('Failed to save todos:', error);
      });
    }
  }, [tasks, loading]);

  useEffect(() => {
    const handleChange = next => {
      const currentTasks = tasksRef.current || [];
      if (next === 'background') {
        currentTasks.forEach(task => {
          if (task.timerEndAt && task.timerEndAt > Date.now()) {
            scheduleTodoTimerAt(task, task.timerEndAt).catch(() => {});
          }
        });
      } else if (next === 'active') {
        currentTasks.forEach(task => {
          if (task.timerEndAt) {
            cancelTodoTimer(task).catch(() => {});
          }
        });
      }
    };
    const sub = AppState.addEventListener('change', handleChange);
    return () => sub.remove();
  }, []);

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
      timerDuration: todo.timerDuration ?? 0,
      timerRemaining: todo.timerRemaining ?? 0,
      createdAt: Date.now(),
    });

    if (newTodo.reminder) {
      scheduleTodoReminder(newTodo).catch(() => {});
    }

    setTasks(currentTasks => [...currentTasks, newTodo]);
  }

  function updateTodo(id, updatedData) {
    setTasks(currentTasks =>
      currentTasks.map(task => {
        if (String(task.id) === String(id)) {
          const merged = {
            ...task,
            ...updatedData,
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

  function togglePinTodo(id) {
    setTasks(currentTasks =>
      currentTasks.map(task =>
        String(task.id) === String(id)
          ? {...task, pinned: !task.pinned}
          : task,
      ),
    );
  }

  function setTodoPinned(id, pinned) {
    setTasks(currentTasks =>
      currentTasks.map(task =>
        String(task.id) === String(id)
          ? {...task, pinned: Boolean(pinned)}
          : task,
      ),
    );
  }

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
          ? {...t, reminder: nextVal}
          : t,
      ),
    );
  }

  // ═══════════════════════════════════════════════════════════════════
  // ✅ setTodoTimer — minutes accept karta hai
  //    exactMs optional: resume jaise cases me exact milliseconds preserve
  // ═══════════════════════════════════════════════════════════════════
  const setTodoTimer = useCallback(
    async (id, minutes, exactMs = null) => {
      const task = (tasksRef.current || []).find(
        t => String(t.id) === String(id),
      );
      if (!task) return;

      // ✅ exactMs diya ho to wahi use karo (no rounding loss)
      const durationMs =
        exactMs != null && Number(exactMs) > 0
          ? Number(exactMs)
          : Math.max(1, Number(minutes) || 1) * 60 * 1000;
      const endAt = Date.now() + durationMs;

      if (task.timerEndAt || task.timerNotificationId) {
        cancelTodoTimer(task).catch(() => {});
      }

      setTasks(currentTasks =>
        currentTasks.map(t =>
          String(t.id) === String(id)
            ? {
                ...t,
                timerEndAt: endAt,
                timerDuration: durationMs,
                timerRemaining: 0,
                timerNotificationId: null,
              }
            : t,
        ),
      );

      // ✅ START quiet notification
      const minsLabel = Math.max(1, Math.round(durationMs / 60000));
      await showTimerStartedNotification(task, minsLabel);
    },
    [],
  );

  const clearTodoTimer = useCallback(
    async (id, isExpired = false) => {
      const task = (tasksRef.current || []).find(
        t => String(t.id) === String(id),
      );
      if (!task) return;

      const nowMs = Date.now();
      const remainingMs = task.timerEndAt
        ? Math.max(0, Number(task.timerEndAt) - nowMs)
        : Number(task.timerRemaining) || 0;

      try {
        if (isExpired) {
          // ✅ cancel pehle, phir notify (race avoid)
          await cancelTodoTimer(task, false);
          await notifyTimerCompleted(task);
        } else {
          stopSound();
          await cancelTodoTimer(task, true);
        }
      } catch (e) {
        console.log('[TodoContext] clearTodoTimer error:', e);
      }

      setTasks(currentTasks =>
        currentTasks.map(t =>
          String(t.id) === String(id)
            ? {
                ...t,
                timerEndAt: null,
                timerNotificationId: null,
                timerRemaining: isExpired ? 0 : remainingMs,
                timerDuration: Number(t.timerDuration) || 0,
              }
            : t,
        ),
      );
    },
    [],
  );

  // ═══════════════════════════════════════════════════════════════════
  // ✅ FIX: startTodoTimer — paused exact remaining ms se resume
  //    (pehle Math.round se seconds kho jaate the → timer "shuru se" lagta tha)
  // ═══════════════════════════════════════════════════════════════════
  const startTodoTimer = useCallback(async id => {
    const task = (tasksRef.current || []).find(
      t => String(t.id) === String(id),
    );
    if (!task) return;
    const remaining = Number(task.timerRemaining) || 0;
    if (remaining <= 0) return;

    // ✅ exact ms → setTodoTimer ko exactMs pass karo (koi rounding nahi)
    return setTodoTimer(id, null, remaining);
  }, [setTodoTimer]);

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

        if (nextCompleted && (task.timerEndAt || task.timerNotificationId)) {
          cancelTodoTimer(task, true).catch(() => {});
          stopSound();
        }

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
              timerDuration: 0,
              timerRemaining: 0,
              pinned: false,
              createdAt: Date.now(),
            });
          }
        }

        return {
          ...task,
          completed: nextCompleted,
          completedAt: nextCompleted ? Date.now() : null,
          timerEndAt: nextCompleted ? null : task.timerEndAt,
          timerNotificationId: nextCompleted ? null : task.timerNotificationId,
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

  function toggleFavorite(id) {
    setTasks(currentTasks =>
      currentTasks.map(task =>
        String(task.id) === String(id)
          ? {...task, favorite: !task.favorite}
          : task,
      ),
    );
  }

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
      currentTasks.map(t =>
        String(t.id) === String(id)
          ? {
              ...t,
              deleted: true,
              deletedAt: Date.now(),
              timerEndAt: null,
              timerNotificationId: null,
              timerRemaining: 0,
            }
          : t,
      ),
    );
  }

  function restoreTodo(id) {
    setTasks(currentTasks =>
      currentTasks.map(t => {
        if (String(t.id) === String(id)) {
          if (t.reminder && !t.completed) {
            scheduleTodoReminder(t).catch(() => {});
          }
          return {...t, deleted: false};
        }
        return t;
      }),
    );
  }

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
      currentTasks.filter(t => String(t.id) !== String(id)),
    );
  }

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
    return tasks.find(task => String(task.id) === String(id));
  }

  function getActiveTodos() {
    return tasks.filter(task => !task.completed && !task.deleted);
  }

  function getCompletedTodos() {
    return tasks.filter(task => task.completed && !task.deleted);
  }

  function getFavoriteTodos() {
    return tasks.filter(task => task.favorite && !task.deleted);
  }

  function getPinnedTodos() {
    return tasks.filter(task => task.pinned && !task.deleted);
  }

  function getTrashTodos() {
    return tasks.filter(task => task.deleted);
  }

  function importTodos(importedList, mode = 'replace') {
    if (!Array.isArray(importedList)) return;
    const normalized = importedList.map(normalizeTodo);
    if (mode === 'merge') {
      setTasks(currentTasks => {
        const existingIds = new Set(currentTasks.map(t => String(t.id)));
        const newItems = normalized.filter(
          t => !existingIds.has(String(t.id)),
        );
        return [...currentTasks, ...newItems];
      });
    } else {
      setTasks(normalized);
    }
  }

  const addCategory = useCallback(
    input => {
      const name = normalizeCategoryName(input);
      if (!name) return false;
      const taken = new Set(
        [
          ...customCategories,
          ...(tasks || [])
            .filter(task => task && !task.deleted)
            .map(task => task.category || 'General'),
        ].map(v => String(v).trim().toLowerCase()),
      );
      if (taken.has(name.toLowerCase())) return false;
      setCustomCategories(current =>
        normalizeCategoryList([...current, name]),
      );
      return true;
    },
    [customCategories, tasks],
  );

  const renameCategory = useCallback((oldInput, newInput) => {
    const oldName = normalizeCategoryName(oldInput);
    const newName = normalizeCategoryName(newInput);
    if (!oldName || !newName) return false;
    if (oldName === newName) return true;

    setCustomCategories(current => {
      const exists = current.some(n => n === oldName);
      const updated = current.map(n => (n === oldName ? newName : n));
      if (!exists) updated.push(newName);
      return normalizeCategoryList(updated);
    });

    setTasks(current =>
      current.map(task =>
        task && task.category === oldName
          ? {...task, category: newName}
          : task,
      ),
    );
    return true;
  }, []);

  const deleteCategory = useCallback(input => {
    const name = normalizeCategoryName(input);
    if (!name) return false;
    setCustomCategories(current => current.filter(c => c !== name));
    setTasks(current =>
      current.map(task =>
        task && task.category === name
          ? {...task, category: 'General'}
          : task,
      ),
    );
    return true;
  }, []);

  const autoCleanTrash = useCallback(
    (retentionDays = TRASH_RETENTION_DAYS) => {
      let purgedCount = 0;
      setTasks(currentTasks => {
        const remaining = purgeExpiredTrash(currentTasks, retentionDays);
        purgedCount = currentTasks.length - remaining.length;
        return remaining;
      });
      return purgedCount;
    },
    [],
  );

  return (
    <TodoContext.Provider
      value={{
        tasks,
        loading,
        loadTodos,
        TRASH_RETENTION_DAYS,
        autoCleanTrash,

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
        startTodoTimer,

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
    throw new Error('useTodoContext must be used inside TodoProvider.');
  }
  return context;
}

export {
  TodoProvider,
  useTodoContext,
  TRASH_RETENTION_DAYS,
  TRASH_RETENTION_MS,
};