/**
 * RESPONSIBILITY: Pure response normalization shared by the canonical Axios network client.
 * FLOW: Axios response/error → these typed helpers → ApiResponse contract.
 */
import axios from 'axios';
import type { ApiFailure, ApiSuccess, ValidationErrorItem } from './apiResponse.types';

type JsonRecord = Record<string, unknown>;

export function isRecord(value: unknown): value is JsonRecord {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function headerValue(headers: unknown, name: string): string | undefined {
  if (!headers || typeof headers !== 'object') return undefined;
  const source = headers as Record<string, unknown> & { get?: (key: string) => unknown };
  const value = typeof source.get === 'function' ? source.get(name) : source[name.toLowerCase()] ?? source[name];
  return typeof value === 'string' && value.length > 0 ? value : undefined;
}

/**
 * Keeps an existing request correlation ID when the response does not echo one.
 */
export function requestIdFrom(headers?: unknown, fallback?: string): string {
  return headerValue(headers, 'x-request-id')
    ?? headerValue(headers, 'x-correlation-id')
    ?? fallback
    ?? `mobile-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

export function normalizeValidationErrors(value: unknown): ValidationErrorItem[] | undefined {
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

/**
 * Maps an accepted HTTP response into the normative success envelope.
 */
export function normalizeHttpSuccess<T>(payload: unknown, statusCode: number, requestId: string): ApiSuccess<T> {
  const json = isRecord(payload) ? payload : {};
  return {
    success: true,
    message: typeof json.message === 'string' ? json.message : 'Request completed.',
    data: (isRecord(payload) && payload.data !== undefined ? payload.data : payload) as T,
    meta: isRecord(json.meta) ? json.meta as unknown as ApiSuccess<T>['meta'] : undefined,
    requestId: typeof json.requestId === 'string' ? json.requestId : requestId,
    statusCode,
  };
}

/**
 * Maps an HTTP error into a stable failure envelope including field validation errors.
 */
export function normalizeHttpFailure(payload: unknown, statusCode: number, requestId: string): ApiFailure {
  const json = isRecord(payload) ? payload : {};
  return {
    success: false,
    message: typeof json.message === 'string' ? json.message : `Request failed with status ${statusCode}.`,
    data: null,
    error: typeof json.error === 'string' ? json.error : undefined,
    errorCode: typeof json.errorCode === 'string'
      ? json.errorCode
      : typeof json.code === 'string' ? json.code : `HTTP_${statusCode}`,
    statusCode,
    requestId: typeof json.requestId === 'string' ? json.requestId : requestId,
    validationErrors: normalizeValidationErrors(json.validationErrors),
  };
}

/**
 * Maps Axios timeouts/cancellation/network errors to typed transport failures.
 */
export function normalizeTransportFailure(error: unknown, timedOut: boolean, abortedByCaller: boolean, requestId: string): ApiFailure {
  const axiosError = axios.isAxiosError(error) ? error : undefined;
  const isTimeout = timedOut || axiosError?.code === 'ECONNABORTED' || axiosError?.code === 'ETIMEDOUT';
  const isCancelled = abortedByCaller || axiosError?.code === 'ERR_CANCELED';
  return {
    success: false,
    message: isTimeout ? 'Request timed out.' : isCancelled ? 'Request cancelled.' : 'Network request failed.',
    data: null,
    errorCode: isTimeout ? 'NETWORK_TIMEOUT' : isCancelled ? 'NETWORK_ABORTED' : 'NETWORK_ERROR',
    statusCode: isTimeout ? 408 : isCancelled ? 499 : 0,
    requestId,
  };
}
