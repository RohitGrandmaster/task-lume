/**
 * RESPONSIBILITY: Canonical feature hook for User Voice Memos (≤150 lines).
 * FLOW: Controls audio recorder, tracks live timer, and provides memo list and task conversion.
 */

import { useCallback } from 'react';
import { useTodoContext } from '../../../../../context/TodoContext';
import { showToast } from '../../../../../core/toast/showToast';

export function useUserVoice() {
  const todoCtx = useTodoContext();
  const addTodo = todoCtx?.addTodo;

  const saveAsTask = useCallback((transcript: string): boolean => {
    const title = transcript.trim();
    if (!title) {
      showToast('A non-empty transcript is required to create a task.', 'error', 'user_voice:task:empty');
      return false;
    }
    if (typeof addTodo !== 'function') {
      showToast('Task creation is unavailable in this app session.', 'error', 'user_voice:task:unavailable');
      return false;
    }
    try {
      addTodo({ title, category: 'Personal', priority: 'medium' });
      showToast('Task created from voice memo.', 'success', 'user_voice:task:created');
      return true;
    } catch {
      showToast('Task could not be created from this voice memo.', 'error', 'user_voice:task:failed');
      return false;
    }
  }, [addTodo]);

  return {
    saveAsTask,
  };
}
