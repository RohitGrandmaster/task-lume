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
const CUSTOM_CATEGORIES_KEY = '@todomaster/custom_categories';

function normalizeCategoryName(name) {
  if (typeof name !== 'string') return '';
  const normalized = name.trim().replace(/\s+/g, ' ');
  return normalized.length >= 1 && normalized.length <= 40 ? normalized : '';
}

function normalizeCategoryList(value) {
  if (!Array.isArray(value)) return [];
  const seen = new Set();
  const result = [];
  value.forEach(entry => {
    const name = normalizeCategoryName(entry);
    const key = name.toLocaleLowerCase();
    if (name && !seen.has(key)) {
      seen.add(key);
      result.push(name);
    }
  });
  return result;
}

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
    reminderTime: typeof source.reminderTime === 'string' ? source.reminderTime : null,
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
  const [customCategories, setCustomCategories] = useState([]);
  const [categoriesLoaded, setCategoriesLoaded] = useState(false);

  useEffect(() => {
    let active = true;
    getItem(CUSTOM_CATEGORIES_KEY, [])
      .then(saved => {
        if (active) setCustomCategories(normalizeCategoryList(saved));
      })
      .catch(error => {
        console.warn('[TodoContext] could not load categories:', error);
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
      setItem(CUSTOM_CATEGORIES_KEY, normalizeCategoryList(customCategories)).catch(error => {
        console.warn('[TodoContext] could not save categories:', error);
      });
    }
  }, [customCategories, categoriesLoaded]);

  function applyReminderScheduleResults(results) {
    if (!Array.isArray(results) || results.length === 0) return;
    const byId = new Map(results.map(item => [String(item.id), item.result]));
    setTasks(currentTasks => currentTasks.map(task => {
      if (!byId.has(String(task.id))) return task;
      const result = byId.get(String(task.id));
      if (!result) {
        return {
          ...task,
          reminder: false,
          reminderNotificationId: null,
          reminderTimestamp: null,
        };
      }
      return {
        ...task,
        reminder: true,
        reminderNotificationId: result.reminderNotificationId,
        reminderTimestamp: result.reminderTimestamp,
      };
    }));
  }

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
        .then(async () => {
          await rescheduleActiveTimers(loaded).catch(() => {});
          const reminderResults = await rescheduleAllReminders(loaded).catch(() => []);
          applyReminderScheduleResults(reminderResults);
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

    setTasks(currentTasks => [
      ...currentTasks,
      newTodo,
    ]);

    if (newTodo.reminder) {
      scheduleTodoReminder(newTodo)
        .then(result => {
          setTasks(current => current.map(task =>
            String(task.id) === String(newTodo.id)
              ? result
                ? {
                    ...task,
                    reminderNotificationId: result.reminderNotificationId,
                    reminderTimestamp: result.reminderTimestamp,
                  }
                : {
                    ...task,
                    reminder: false,
                    reminderNotificationId: null,
                    reminderTimestamp: null,
                  }
              : task,
          ));
        })
        .catch(() => {
          setTasks(current => current.map(task =>
            String(task.id) === String(newTodo.id)
              ? {...task, reminder: false, reminderNotificationId: null, reminderTimestamp: null}
              : task,
          ));
        });
    }
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
          if (Object.prototype.hasOwnProperty.call(updatedData || {}, 'dueDate')) {
            merged.dueDateTimestamp = toDateOnlyTimestamp(merged.dueDate);
            if (!merged.dueDateTimestamp) {
              merged.reminder = false;
              merged.reminderNotificationId = null;
              merged.reminderTimestamp = null;
            }
          }
          if (merged.reminder && !merged.completed && !merged.deleted) {
            scheduleTodoReminder(merged)
              .then(result => {
                setTasks(current => current.map(currentTask =>
                  String(currentTask.id) === String(id)
                    ? result
                      ? {
                          ...currentTask,
                          reminder: true,
                          reminderNotificationId: result.reminderNotificationId,
                          reminderTimestamp: result.reminderTimestamp,
                        }
                      : {
                          ...currentTask,
                          reminder: false,
                          reminderNotificationId: null,
                          reminderTimestamp: null,
                        }
                    : currentTask,
                ));
              })
              .catch(() => {
                setTasks(current => current.map(currentTask =>
                  String(currentTask.id) === String(id)
                    ? {...currentTask, reminder: false, reminderNotificationId: null, reminderTimestamp: null}
                    : currentTask,
                ));
              });
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
      // Only reflect an enabled reminder after the OS successfully schedules it.
      const result = await scheduleTodoReminder({...task, reminder: true}, true);
      if (!result) return false;
      setTasks(currentTasks =>
        currentTasks.map(t =>
          String(t.id) === String(id)
            ? {
                ...t,
                reminder: true,
                reminderNotificationId: result.reminderNotificationId,
                reminderTimestamp: result.reminderTimestamp,
              }
            : t,
        ),
      );
      return true;
    }

    await cancelTodoReminder(task);
    setTasks(currentTasks =>
      currentTasks.map(t =>
        String(t.id) === String(id)
          ? {
              ...t,
              reminder: false,
              reminderNotificationId: null,
              reminderTimestamp: null,
            }
          : t,
      ),
    );
    return true;
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
          const restored = {
            ...task,
            deleted: false,
          };
          if (restored.reminder && !restored.completed) {
            scheduleTodoReminder(restored).then(result => {
              setTasks(current => current.map(currentTask =>
                String(currentTask.id) === String(id)
                  ? result
                    ? {
                        ...currentTask,
                        reminderNotificationId: result.reminderNotificationId,
                        reminderTimestamp: result.reminderTimestamp,
                      }
                    : {
                        ...currentTask,
                        reminder: false,
                        reminderNotificationId: null,
                        reminderTimestamp: null,
                      }
                  : currentTask,
              ));
            }).catch(() => {
              setTasks(current => current.map(currentTask =>
                String(currentTask.id) === String(id)
                  ? {...currentTask, reminder: false, reminderNotificationId: null, reminderTimestamp: null}
                  : currentTask,
              ));
            });
          }
          return restored;
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
    setCustomCategories([]);
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

  function addCategory(input) {
    const name = normalizeCategoryName(input);
    if (!name) return false;

    const taken = new Set([
      ...customCategories,
      ...(tasks || []).filter(task => task && !task.deleted).map(task => task.category || 'General'),
    ].map(value => String(value).trim().toLocaleLowerCase()));
    if (taken.has(name.toLocaleLowerCase())) return false;

    setCustomCategories(current => normalizeCategoryList([...current, name]));
    return true;
  }

  function renameCategory(oldInput, newInput) {
    const oldName = normalizeCategoryName(oldInput);
    const newName = normalizeCategoryName(newInput);
    if (!oldName || !newName) return false;
    if (oldName === newName) return true;

    const allNames = [
      ...customCategories,
      ...(tasks || []).filter(task => task && !task.deleted).map(task => task.category || 'General'),
    ];
    if (!allNames.some(name => name === oldName)) return false;
    if (allNames.some(name => name !== oldName && String(name).toLocaleLowerCase() === newName.toLocaleLowerCase())) {
      return false;
    }

    setCustomCategories(current => {
      const exists = current.some(name => name === oldName);
      const updated = current.map(name => name === oldName ? newName : name);
      if (!exists) updated.push(newName);
      return normalizeCategoryList(updated);
    });
    setTasks(current => current.map(task =>
      task && task.category === oldName ? {...task, category: newName} : task,
    ));
    return true;
  }

  function deleteCategory(input) {
    const name = normalizeCategoryName(input);
    if (!name) return false;
    const exists = customCategories.includes(name) ||
      (tasks || []).some(task => task && task.category === name && !task.deleted);
    if (!exists) return false;

    setCustomCategories(current => current.filter(category => category !== name));
    // Never discard a task because its category is removed; re-home it to General.
    setTasks(current => current.map(task =>
      task && task.category === name ? {...task, category: 'General'} : task,
    ));
    return true;
  }

  /**
   * IMPORT TODOS FROM BACKUP
   */
  function importTodos(importedList, importedCategories) {
    if (!Array.isArray(importedList) || importedList.length > 10000) {
      throw new Error('Backup must contain a tasks array with no more than 10,000 tasks.');
    }

    const validRecords = importedList.every(item =>
      item &&
      typeof item === 'object' &&
      !Array.isArray(item) &&
      (item.title === undefined || typeof item.title === 'string') &&
      (item.description === undefined || typeof item.description === 'string') &&
      (item.id === undefined || typeof item.id === 'string' || typeof item.id === 'number') &&
      (item.dueDate === undefined || typeof item.dueDate === 'string' || typeof item.dueDate === 'number')
    );
    if (!validRecords) {
      throw new Error('Backup contains invalid task records. Your existing tasks were not changed.');
    }

    if (
      importedCategories !== undefined &&
      (!Array.isArray(importedCategories) ||
        importedCategories.length > 200 ||
        importedCategories.some(name => typeof name !== 'string' || !normalizeCategoryName(name)))
    ) {
      throw new Error('Backup contains invalid custom categories. Your current tasks were not changed.');
    }

    const normalized = importedList.map(normalizeTodo);
    const ids = new Set();
    const unique = normalized.map(todo => {
      const id = String(todo.id);
      if (ids.has(id)) todo.id = createId();
      ids.add(String(todo.id));
      return todo;
    });

    setTasks(unique);
    if (Array.isArray(importedCategories)) {
      setCustomCategories(normalizeCategoryList(importedCategories));
    }
    prepareTodoTimerNotifications()
      .then(async () => {
        await rescheduleActiveTimers(unique).catch(() => {});
        const reminderResults = await rescheduleAllReminders(unique).catch(() => []);
        applyReminderScheduleResults(reminderResults);
      })
      .catch(() => {});
    return true;
  }

  return (
    <TodoContext.Provider
      value={{
        tasks,
        loading,
        loadTodos,
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