/**
 * RESPONSIBILITY: Canonical Axios HTTP client; enforces headers, timeout, cancellation, idempotency and ApiResponse.
 * FLOW: Feature API → networkClient → configured base URL + Axios → normalized ApiResponse<T>.
 */
import axios from 'axios';
import type { ApiFailure, ApiResponse } from './apiResponse.types';
import { getActiveLocale } from '../i18n/locale';
import {
  normalizeHttpFailure,
  normalizeHttpSuccess,
  normalizeTransportFailure,
  requestIdFrom,
} from './networkClient.helpers';

export interface RequestOptions {
  headers?: Record<string, string>;
  timeoutMs?: number;
  idempotencyKey?: string;
  signal?: AbortSignal;
}

const DEFAULT_TIMEOUT_MS = 30000;

/**
 * Owns transport configuration; it deliberately does not guess deployment hosts.
 */
class NetworkClient {
  private baseURL = '';

  /**
   * Configures the API host supplied by the app's deployment environment.
   * @param baseURL - Absolute HTTP(S) API base URL.
   * @throws Error if the provided host is not an absolute HTTP(S) URL.
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
    const abortFromCaller = () => { abortedByCaller = true; controller.abort(); };
    if (options.signal?.aborted) controller.abort();
    else options.signal?.addEventListener('abort', abortFromCaller, { once: true });
    const timeout = setTimeout(() => { timedOut = true; controller.abort(); }, timeoutMs);

    try {
      const response = await axios.request<unknown>({
        url, method, data: body, headers, signal: controller.signal, timeout: timeoutMs,
        responseType: 'json', validateStatus: () => true,
      });
      const responseRequestId = requestIdFrom(response.headers, requestId);
      if (response.status < 200 || response.status >= 300 ||
          (typeof response.data === 'object' && response.data !== null &&
            !Array.isArray(response.data) && (response.data as Record<string, unknown>).success === false)) {
        return normalizeHttpFailure(response.data, response.status, responseRequestId);
      }
      return normalizeHttpSuccess<T>(response.data, response.status, responseRequestId);
    } catch (error: unknown) {
      return normalizeTransportFailure(error, timedOut, abortedByCaller, requestId);
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
