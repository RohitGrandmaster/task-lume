/**
 * RESPONSIBILITY: Canonical typed HTTP client; normalizes responses to the architecture contract.
 * FLOW: Applies shared request headers and returns discriminated success/failure results.
 */
import type { ApiFailure, ApiResponse, ApiSuccess, ValidationErrorItem } from './apiResponse.types';
import { getActiveLocale } from '../i18n/locale';

export interface RequestOptions {
  headers?: Record<string, string>;
  timeoutMs?: number;
  idempotencyKey?: string;
  signal?: AbortSignal;
}

const DEFAULT_TIMEOUT_MS = 30000;
type JsonRecord = Record<string, unknown>;

function isRecord(value: unknown): value is JsonRecord {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function requestIdFrom(headers?: Headers): string {
  return headers?.get('x-request-id') || headers?.get('x-correlation-id') ||
    `mobile-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

function normalizeValidationErrors(value: unknown): ValidationErrorItem[] | undefined {
  if (Array.isArray(value)) {
    return value.filter((item): item is ValidationErrorItem =>
      isRecord(item) && typeof item.field === 'string' && typeof item.message === 'string'
    );
  }
  if (isRecord(value)) {
    return Object.entries(value).flatMap(([field, messages]) =>
      Array.isArray(messages)
        ? messages.filter((message): message is string => typeof message === 'string').map(message => ({ field, message }))
        : typeof messages === 'string' ? [{ field, message: messages }] : []
    );
  }
  return undefined;
}

class NetworkClient {
  private async request<T>(
    endpoint: string,
    method: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE',
    body?: unknown,
    options: RequestOptions = {}
  ): Promise<ApiResponse<T>> {
    const headers: Record<string, string> = {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      ...options.headers,
      'Accept-Language': getActiveLocale(),
    };
    if (options.idempotencyKey && method !== 'GET') headers['Idempotency-Key'] = options.idempotencyKey;

    const controller = new AbortController();
    const abortFromCaller = () => controller.abort();
    if (options.signal?.aborted) controller.abort();
    else options.signal?.addEventListener('abort', abortFromCaller, { once: true });
    const timeout = setTimeout(() => controller.abort(), options.timeoutMs ?? DEFAULT_TIMEOUT_MS);
    let requestId = requestIdFrom();

    try {
      const response = await fetch(endpoint, {
        method,
        headers,
        body: body === undefined ? undefined : JSON.stringify(body),
        signal: controller.signal,
      });
      requestId = requestIdFrom(response.headers) || requestId;
      let payload: unknown = null;
      try {
        payload = await response.json();
      } catch {
        payload = null;
      }
      const json = isRecord(payload) ? payload : {};
      const message = typeof json.message === 'string'
        ? json.message
        : response.ok ? 'Request completed.' : `Request failed with status ${response.status}.`;

      if (!response.ok || json.success === false) {
        const failure: ApiFailure = {
          success: false,
          message,
          data: null,
          error: typeof json.error === 'string' ? json.error : undefined,
          errorCode: typeof json.errorCode === 'string' ? json.errorCode
            : typeof json.code === 'string' ? json.code : `HTTP_${response.status}`,
          statusCode: response.status,
          requestId: typeof json.requestId === 'string' ? json.requestId : requestId,
          validationErrors: normalizeValidationErrors(json.validationErrors),
        };
        return failure;
      }

      const result: ApiSuccess<T> = {
        success: true,
        message,
        data: (json.data !== undefined ? json.data : payload) as T,
        meta: isRecord(json.meta) ? json.meta as unknown as ApiSuccess<T>['meta'] : undefined,
        requestId: typeof json.requestId === 'string' ? json.requestId : requestId,
        statusCode: response.status,
      };
      return result;
    } catch (error: unknown) {
      const timedOut = isRecord(error) && error.name === 'AbortError';
      const failure: ApiFailure = {
        success: false,
        message: timedOut ? 'Request timed out.' : 'Network request failed.',
        data: null,
        errorCode: timedOut ? 'NETWORK_TIMEOUT' : 'NETWORK_ERROR',
        statusCode: timedOut ? 408 : 0,
        requestId,
      };
      return failure;
    } finally {
      clearTimeout(timeout);
      options.signal?.removeEventListener('abort', abortFromCaller);
    }
  }

  get<T>(endpoint: string, options?: RequestOptions): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, 'GET', undefined, options);
  }
  post<T>(endpoint: string, body?: unknown, options?: RequestOptions): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, 'POST', body, options);
  }
  patch<T>(endpoint: string, body?: unknown, options?: RequestOptions): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, 'PATCH', body, options);
  }
  put<T>(endpoint: string, body?: unknown, options?: RequestOptions): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, 'PUT', body, options);
  }
  delete<T>(endpoint: string, options?: RequestOptions): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, 'DELETE', undefined, options);
  }
}

export const networkClient = new NetworkClient();
