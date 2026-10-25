/**
 * RESPONSIBILITY: Canonical feature hook for User Todos Management (≤150 lines).
 * FLOW: Connects UI components to todos state and local actions.
 */

import { useTodoContext } from '../../../../../context/TodoContext';

export function useUserTodos() {
  return useTodoContext();
}
