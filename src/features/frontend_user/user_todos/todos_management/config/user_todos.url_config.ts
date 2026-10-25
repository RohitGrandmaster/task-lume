/**
 * RESPONSIBILITY: Centralized navigation route names and API endpoint paths for user_todos domain.
 * FLOW: Consumed by navigators, screens, and link handlers. Prevents hardcoded route strings.
 */

export const USER_TODOS_ROUTES = {
  HOME: 'UserTodosHome',
  ADD: 'UserTodosAdd',
  EDIT: 'UserTodosEdit',
  DETAIL: 'UserTodosDetail',
  TRASH: 'UserTodosTrash',
  FAVORITES: 'UserTodosFavorites',
  CATEGORIES: 'UserTodosCategories',
} as const;

export const USER_TODOS_ENDPOINTS = {
  BASE: '/api/v1/user/todos',
  DETAIL: (id: string) => `/api/v1/user/todos/${id}`,
  TOGGLE: (id: string) => `/api/v1/user/todos/${id}/toggle`,
  TRASH: (id: string) => `/api/v1/user/todos/${id}/trash`,
} as const;

/**
 * Typed route parameter contract for the Todo navigation stack.
 * Pass entity IDs only; each detail/edit screen resolves its record from the owning data source.
 */
export type UserTodosStackParamList = {
  [USER_TODOS_ROUTES.HOME]: undefined;
  [USER_TODOS_ROUTES.ADD]: undefined;
  [USER_TODOS_ROUTES.EDIT]: { id: string };
  [USER_TODOS_ROUTES.DETAIL]: { id: string };
  [USER_TODOS_ROUTES.TRASH]: undefined;
  [USER_TODOS_ROUTES.FAVORITES]: undefined;
  [USER_TODOS_ROUTES.CATEGORIES]: undefined;
};

export const USER_TODOS_URL_CONFIG = {
  API: { TODOS: USER_TODOS_ENDPOINTS.BASE },
} as const;
