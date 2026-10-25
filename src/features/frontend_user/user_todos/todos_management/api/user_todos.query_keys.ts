/**
 * RESPONSIBILITY: Canonical TanStack Query Key factory for user_todos domain.
 * FLOW: Consumed by queries, mutations, and cache invalidation handlers to namespace query cache.
 */

export const USER_TODOS_QUERY_KEYS = {
  all: ['user_todos'] as const,
  lists: () => [...USER_TODOS_QUERY_KEYS.all, 'list'] as const,
  list: (filters?: Record<string, unknown>) => [...USER_TODOS_QUERY_KEYS.lists(), { filters }] as const,
  details: () => [...USER_TODOS_QUERY_KEYS.all, 'detail'] as const,
  detail: (id: string) => [...USER_TODOS_QUERY_KEYS.details(), id] as const,
  categories: () => [...USER_TODOS_QUERY_KEYS.all, 'categories'] as const,
  trash: () => [...USER_TODOS_QUERY_KEYS.all, 'trash'] as const,
  favorites: () => [...USER_TODOS_QUERY_KEYS.all, 'favorites'] as const,
} as const;
