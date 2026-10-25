/**
 * RESPONSIBILITY: Canonical API response and pagination interfaces for the mobile application.
 * FLOW: Imported by networkClient, feature API services, and TanStack Query consumers.
 */

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  validationErrors?: Record<string, string[]>;
  code?: string;
  meta?: PaginationMeta;
}
