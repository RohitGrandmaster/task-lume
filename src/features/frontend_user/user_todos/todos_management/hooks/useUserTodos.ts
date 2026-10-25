/**
 * RESPONSIBILITY: Canonical feature hook for User Todos Management (≤150 lines).
 * FLOW: Connects UI components to todos state and local actions with complete parameter alignment.
 */

import { useMemo, useCallback } from 'react';
import { useTodoContext } from '../../../../../context/TodoContext';

export function useUserTodos() {
  const ctx = useTodoContext();
  const tasks = ctx.tasks || [];

  const categories = useMemo(() => {
    return ['All', ...(ctx.customCategories || [])];
  }, [ctx.customCategories]);

  const toggleComplete = useCallback((id: string) => {
    return ctx.toggleTodo(id);
  }, [ctx]);

  const permanentDeleteTodo = useCallback((id: string) => {
    return ctx.permanentlyDeleteTodo ? ctx.permanentlyDeleteTodo(id) : ctx.deleteTodo(id);
  }, [ctx]);

  const emptyTrash = useCallback(() => {
    if (ctx.batchPermanentlyDelete) {
      const trashIds = tasks.filter((t: any) => t.deleted).map((t: any) => t.id);
      return ctx.batchPermanentlyDelete(trashIds);
    }
  }, [ctx, tasks]);

  return {
    ...ctx,
    todos: tasks,
    categories,
    loading: ctx.loading,
    refreshTodos: ctx.loadTodos,
    toggleComplete,
    permanentDeleteTodo,
    emptyTrash,
  };
}

