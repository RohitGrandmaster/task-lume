import {useTodoContext} from '../context/TodoContext';



function useTodos() {
  
  return useTodoContext();
}

export default useTodos;