import type { User } from '@/types/auth';

// ─── Envelope ────────────────────────────────────────────────────────────────

export interface ValidationFieldError {
  field: string;
  message: string;
}

export interface ApiEnvelope<T> {
  data: T;
  message: string;
  error: string;
  validation_errors: ValidationFieldError[];
  // some endpoints use these alternative keys
  success?: boolean;
  httpStatus?: number;
  validationErrors?: ValidationFieldError[];
}

// ─── Error ────────────────────────────────────────────────────────────────────

interface ApiErrorInit {
  message: string;
  statusCode: number;
  validationErrors?: ValidationFieldError[];
}

export class ApiClientError extends Error {
  statusCode: number;
  validationErrors: ValidationFieldError[];

  constructor({ message, statusCode, validationErrors = [] }: ApiErrorInit) {
    super(message);
    this.name = 'ApiClientError';
    this.statusCode = statusCode;
    this.validationErrors = validationErrors;
  }
}

// ─── Client ───────────────────────────────────────────────────────────────────

interface RequestConfig extends RequestInit {
  params?: Record<string, string>;
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private unwrap<T>(envelope: ApiEnvelope<T>): T {
    return envelope.data;
  }

  private async request<T>(path: string, config: RequestConfig = {}): Promise<T> {
    const { params, headers, ...rest } = config;

    const url = new URL(`${this.baseUrl}${path}`);
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        if (v !== undefined && v !== '') url.searchParams.set(k, v);
      });
    }

    const mergedHeaders: HeadersInit = {
      'Content-Type': 'application/json',
      ...headers,
    };

    const response = await fetch(url.toString(), {
      ...rest,
      headers: mergedHeaders,
      credentials: 'include', // send/receive HTTP-only auth cookies
    });

    if (!response.ok) {
      let message = response.statusText;
      let validationErrors: ValidationFieldError[] = [];
      try {
        const body = (await response.json()) as {
          message?: string;
          error?: string;
          validation_errors?: ValidationFieldError[];
          validationErrors?: ValidationFieldError[];
        };
        message = body.message ?? body.error ?? message;
        validationErrors = body.validation_errors ?? body.validationErrors ?? [];
      } catch {
        // ignore parse error
      }
      throw new ApiClientError({ message, statusCode: response.status, validationErrors });
    }

    if (response.status === 204) return undefined as T;

    const json = (await response.json()) as ApiEnvelope<T>;

    // If the response has a `data` key, unwrap it; otherwise treat the whole body as T
    if ('data' in json && json.data !== undefined) {
      return this.unwrap(json);
    }
    return json as unknown as T;
  }

  get<T>(path: string, config?: RequestConfig) {
    return this.request<T>(path, { ...config, method: 'GET' });
  }

  post<T>(path: string, body?: unknown, config?: RequestConfig) {
    return this.request<T>(path, {
      ...config,
      method: 'POST',
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  }

  put<T>(path: string, body?: unknown, config?: RequestConfig) {
    return this.request<T>(path, {
      ...config,
      method: 'PUT',
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  }

  patch<T>(path: string, body?: unknown, config?: RequestConfig) {
    return this.request<T>(path, {
      ...config,
      method: 'PATCH',
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  }

  delete<T>(path: string, config?: RequestConfig) {
    return this.request<T>(path, { ...config, method: 'DELETE' });
  }

  // ─── Auth methods ────────────────────────────────────────────────────────────

  login(email: string, password: string): Promise<{ user: User }> {
    return this.post<{ user: User }>('/users/sign-in', { email, password });
  }

  register(name: string, email: string, password: string): Promise<{ user: User }> {
    return this.post<{ user: User }>('/users', { name, email, password });
  }

  forgotPassword(email: string): Promise<{ message: string }> {
    return this.post<{ message: string }>('/users/request-reset-password', { email });
  }

  resetPassword(token: string, newPassword: string): Promise<{ message: string }> {
    return this.post<{ message: string }>('/users/reset-password', {
      token,
      new_password: newPassword,
    });
  }

  logout(): Promise<void> {
    return this.delete<void>('/users/logout');
  }

  renewToken(): Promise<void> {
    return this.post<void>('/users/renew-token');
  }

  getMe(): Promise<User> {
    return this.get<User>('/users/me');
  }
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8080';

export const apiClient = new ApiClient(API_BASE_URL);
