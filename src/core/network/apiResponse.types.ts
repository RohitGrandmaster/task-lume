/**
 * RESPONSIBILITY: Canonical API response and pagination contracts for the mobile application.
 * FLOW: Shared by the network client, feature API services, and query consumers.
 */

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface ValidationErrorItem {
  field: string;
  message: string;
}

export interface ApiSuccess<T> {
  success: true;
  message: string;
  data: T;
  meta?: PaginationMeta;
  requestId: string;
  statusCode?: number;
}

export interface ApiFailure {
  success: false;
  message: string;
  data: null;
  error?: string;
  errorCode: string;
  statusCode: number;
  requestId: string;
  validationErrors?: ValidationErrorItem[];
}

export type ApiResponse<T> = ApiSuccess<T> | ApiFailure;
