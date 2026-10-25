/**
 * RESPONSIBILITY: Canonical feature hook for User Voice Memos (≤150 lines).
 * FLOW: Controls audio recorder, tracks live timer, and provides memo list and task conversion.
 */

import { useCallback } from 'react';
import { useTodoContext } from '../../../../../context/TodoContext';
import { showToast } from '../../../../../core/toast/showToast';

export function useUserVoice() {
  const { addTodo } = useTodoContext();

  const saveAsTask = useCallback((transcript: string) => {
    if (addTodo) {
      addTodo({
        title: transcript,
        category: 'Personal',
        priority: 'medium',
      });
    }
    showToast('Voice memo saved as task!', 'success');
  }, [addTodo]);

  return {
    saveAsTask,
  };
}
