/**
 * RESPONSIBILITY: Canonical typed HTTP network client for the mobile application (≤120 lines).
 * FLOW: Dispatches requests through fetch/axios, injects headers, and wraps responses in ApiResponse<T>.
 */

import type { ApiResponse } from './apiResponse.types';
import { getActiveLocale } from '../i18n/locale';

export interface RequestOptions {
  headers?: Record<string, string>;
  timeoutMs?: number;
  idempotencyKey?: string;
}

const DEFAULT_TIMEOUT_MS = 30000; // Rule 47: 30s standard timeout

class NetworkClient {
  private async request<T>(
    endpoint: string,
    method: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE',
    body?: unknown,
    options: RequestOptions = {}
  ): Promise<ApiResponse<T>> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...options.headers,
      'Accept-Language': getActiveLocale(),
    };

    if (options.idempotencyKey && method !== 'GET') {
      headers['Idempotency-Key'] = options.idempotencyKey;
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), options.timeoutMs ?? DEFAULT_TIMEOUT_MS);

    try {
      // In development/offline bare-metal, safely resolve or mock
      const response = await fetch(endpoint, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
        signal: controller.signal,
      });

      clearTimeout(timeout);
      const json = await response.json();

      if (!response.ok) {
        return {
          success: false,
          data: null as unknown as T,
          message: json.message || `Request failed with status ${response.status}`,
          validationErrors: json.validationErrors,
          code: json.code,
        };
      }

      return {
        success: true,
        data: json.data !== undefined ? json.data : json,
        message: json.message,
        meta: json.meta,
      };
    } catch (err: any) {
      clearTimeout(timeout);
      const isTimeout = err?.name === 'AbortError';
      return {
        success: false,
        data: null as unknown as T,
        message: isTimeout ? 'Request timed out after 30 seconds.' : err?.message || 'Network error occurred',
        code: isTimeout ? 'NETWORK_TIMEOUT' : 'NETWORK_ERROR',
      };
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
