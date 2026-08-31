import { AxiosError } from 'axios';
import type { ApiErrorResponse } from '@/api/types';

export interface ParsedApiError {
  status: number;
  message: string;
  fieldErrors?: Record<string, string>;
}

export function parseApiError(error: unknown): ParsedApiError {
  if (error instanceof AxiosError && error.response) {
    const body = error.response.data as ApiErrorResponse;
    const status = error.response.status;

    const raw = body?.message;
    const message = Array.isArray(raw) ? raw[0] : (raw ?? 'An unexpected error occurred');

    // extract field-level validation errors from NestJS class-validator format
    const fieldErrors: Record<string, string> = {};
    if (Array.isArray(body?.message)) {
      body.message.forEach((msg) => {
        const match = msg.match(/^(\w+)\s+(.*)/);
        if (match) {
          const [, field, err] = match;
          fieldErrors[field] = err;
        }
      });
    }

    return {
      status,
      message: friendlyMessage(status, message),
      fieldErrors: Object.keys(fieldErrors).length ? fieldErrors : undefined,
    };
  }

  if (error instanceof Error) {
    return { status: 0, message: error.message };
  }

  return { status: 0, message: 'An unexpected error occurred' };
}

function friendlyMessage(status: number, serverMessage: string): string {
  switch (status) {
    case 400:
      return serverMessage || 'Invalid request. Please check your input.';
    case 401:
      return 'Your session has expired. Please log in again.';
    case 403:
      return 'You do not have permission to perform this action.';
    case 404:
      return 'The requested resource was not found.';
    case 409:
      return serverMessage || 'This action conflicts with existing data.';
    case 422:
      return serverMessage || 'Validation failed. Please review the form.';
    case 429:
      return 'Too many requests. Please wait a moment and try again.';
    default:
      if (status >= 500) return 'A server error occurred. Please try again later.';
      return serverMessage || 'An unexpected error occurred';
  }
}
