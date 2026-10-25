/**
 * RESPONSIBILITY: Canonical Axios HTTP client; enforces headers, timeout, cancellation, idempotency and ApiResponse.
 * FLOW: Feature API → networkClient → configured base URL + Axios → normalized ApiResponse<T>.
 */
import axios from 'axios';
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

function headerValue(headers: unknown, name: string): string | undefined {
  if (!headers || typeof headers !== 'object') return undefined;
  const source = headers as Record<string, unknown> & { get?: (key: string) => unknown };
  const value = typeof source.get === 'function' ? source.get(name) : source[name.toLowerCase()] ?? source[name];
  return typeof value === 'string' && value.length > 0 ? value : undefined;
}

function requestIdFrom(headers?: unknown): string {
  return headerValue(headers, 'x-request-id')
    ?? headerValue(headers, 'x-correlation-id')
    ?? `mobile-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

function normalizeValidationErrors(value: unknown): ValidationErrorItem[] | undefined {
  if (Array.isArray(value)) {
    return value.filter((item): item is ValidationErrorItem =>
      isRecord(item) && typeof item.field === 'string' && typeof item.message === 'string');
  }
  if (!isRecord(value)) return undefined;
  return Object.entries(value).flatMap(([field, messages]) =>
    Array.isArray(messages)
      ? messages.filter((message): message is string => typeof message === 'string').map(message => ({ field, message }))
      : typeof messages === 'string' ? [{ field, message: messages }] : []);
}

class NetworkClient {
  private baseURL = '';

  /**
   * Configures the API host supplied by the app's environment; no server host is guessed by the client.
   * @param baseURL - Absolute HTTP(S) origin/base path from the deployment environment.
   * @throws Error if the host is not an absolute HTTP(S) URL.
   */
  configureBaseURL(baseURL: string): void {
    const normalized = baseURL.trim().replace(/\/+$/, '');
    if (!/^https?:\/\/[^/\s]+(?:\/.*)?$/i.test(normalized)) {
      throw new Error('API base URL must be an absolute HTTP(S) URL.');
    }
    this.baseURL = normalized;
  }

  private resolveEndpoint(endpoint: string): string | undefined {
    if (/^https?:\/\//i.test(endpoint)) return endpoint;
    if (!this.baseURL) return undefined;
    return `${this.baseURL}/${endpoint.replace(/^\/+/, '')}`;
  }

  private async request<T>(
    endpoint: string,
    method: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE',
    body?: unknown,
    options: RequestOptions = {},
  ): Promise<ApiResponse<T>> {
    const url = this.resolveEndpoint(endpoint);
    const requestId = requestIdFrom();
    if (!url) {
      const failure: ApiFailure = {
        success: false,
        message: 'API base URL is not configured for this build.',
        data: null,
        errorCode: 'API_BASE_URL_MISSING',
        statusCode: 0,
        requestId,
      };
      return failure;
    }

    const headers: Record<string, string> = {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      ...options.headers,
      'Accept-Language': getActiveLocale(),
    };
    if (options.idempotencyKey && method !== 'GET') headers['Idempotency-Key'] = options.idempotencyKey;

    const timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;
    const controller = new AbortController();
    let timedOut = false;
    let abortedByCaller = Boolean(options.signal?.aborted);
    const abortFromCaller = () => {
      abortedByCaller = true;
      controller.abort();
    };
    if (options.signal?.aborted) controller.abort();
    else options.signal?.addEventListener('abort', abortFromCaller, { once: true });
    const timeout = setTimeout(() => {
      timedOut = true;
      controller.abort();
    }, timeoutMs);

    try {
      const response = await axios.request<unknown>({
        url,
        method,
        data: body,
        headers,
        signal: controller.signal,
        timeout: timeoutMs,
        responseType: 'json',
        validateStatus: () => true,
      });
      const responseRequestId = requestIdFrom(response.headers) || requestId;
      const json = isRecord(response.data) ? response.data : {};
      const message = typeof json.message === 'string'
        ? json.message
        : response.status >= 200 && response.status < 300
          ? 'Request completed.'
          : `Request failed with status ${response.status}.`;

      if (response.status < 200 || response.status >= 300 || json.success === false) {
        const failure: ApiFailure = {
          success: false,
          message,
          data: null,
          error: typeof json.error === 'string' ? json.error : undefined,
          errorCode: typeof json.errorCode === 'string'
            ? json.errorCode
            : typeof json.code === 'string' ? json.code : `HTTP_${response.status}`,
          statusCode: response.status,
          requestId: typeof json.requestId === 'string' ? json.requestId : responseRequestId,
          validationErrors: normalizeValidationErrors(json.validationErrors),
        };
        return failure;
      }

      const result: ApiSuccess<T> = {
        success: true,
        message,
        data: (isRecord(response.data) && response.data.data !== undefined ? response.data.data : response.data) as T,
        meta: isRecord(json.meta) ? json.meta as unknown as ApiSuccess<T>['meta'] : undefined,
        requestId: typeof json.requestId === 'string' ? json.requestId : responseRequestId,
        statusCode: response.status,
      };
      return result;
    } catch (error: unknown) {
      const axiosError = axios.isAxiosError(error) ? error : undefined;
      const isTimeout = timedOut || axiosError?.code === 'ECONNABORTED' || axiosError?.code === 'ETIMEDOUT';
      const isCancelled = abortedByCaller || axiosError?.code === 'ERR_CANCELED';
      const failure: ApiFailure = {
        success: false,
        message: isTimeout ? 'Request timed out.' : isCancelled ? 'Request cancelled.' : 'Network request failed.',
        data: null,
        errorCode: isTimeout ? 'NETWORK_TIMEOUT' : isCancelled ? 'NETWORK_ABORTED' : 'NETWORK_ERROR',
        statusCode: isTimeout ? 408 : isCancelled ? 499 : 0,
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
