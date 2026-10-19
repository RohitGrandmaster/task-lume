import {useTodoContext} from '../context/TodoContext';

/**
 * Convenience hook for accessing todo state and actions.
 * Must be used inside TodoProvider.
 */
function useTodos() {
  return useTodoContext();
}

export default useTodos;
export {useTodos};
