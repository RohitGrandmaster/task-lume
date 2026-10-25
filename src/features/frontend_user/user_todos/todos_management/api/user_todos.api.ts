/**
 * RESPONSIBILITY: Canonical API service for User Todos Management (≤150 lines).
 * FLOW: Dispatches typed HTTP requests via networkClient and returns ApiResponse<T>.
 */

import { networkClient } from '../../../../../core/network/networkClient';
import type { ApiResponse } from '../../../../../core/network/apiResponse.types';
import { USER_TODOS_URL_CONFIG } from '../config/user_todos.url_config';

export interface TodoDto {
  id: string;
  title: string;
  description?: string;
  category?: string;
  priority?: 'low' | 'medium' | 'high';
  dueDate?: string;
  completed?: boolean;
  favorite?: boolean;
}

export const userTodosApi = {
  fetchTodos: async (): Promise<ApiResponse<TodoDto[]>> => {
    return networkClient.get<TodoDto[]>(USER_TODOS_URL_CONFIG.API.TODOS);
  },
  createTodo: async (dto: Partial<TodoDto>, idempotencyKey: string): Promise<ApiResponse<TodoDto>> => {
    return networkClient.post<TodoDto>(USER_TODOS_URL_CONFIG.API.TODOS, dto, { idempotencyKey });
  },
  updateTodo: async (id: string, dto: Partial<TodoDto>): Promise<ApiResponse<TodoDto>> => {
    return networkClient.patch<TodoDto>(`${USER_TODOS_URL_CONFIG.API.TODOS}/${id}`, dto);
  },
  deleteTodo: async (id: string): Promise<ApiResponse<null>> => {
    return networkClient.delete<null>(`${USER_TODOS_URL_CONFIG.API.TODOS}/${id}`);
  },
};
