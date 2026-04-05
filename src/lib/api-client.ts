import type { AuthResponse } from '@/types/auth';

interface RequestConfig extends RequestInit {
  params?: Record<string, string>;
}

interface ApiError {
  message: string;
  statusCode: number;
}

export class ApiClientError extends Error {
  statusCode: number;

  constructor({ message, statusCode }: ApiError) {
    super(message);
    this.name = 'ApiClientError';
    this.statusCode = statusCode;
  }
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private getAccessToken(): string | null {
    try {
      const raw = localStorage.getItem('manga-go-auth');
      if (!raw) return null;
      const parsed = JSON.parse(raw) as { state?: { accessToken?: string } };
      return parsed.state?.accessToken ?? null;
    } catch {
      return null;
    }
  }

  private async request<T>(path: string, config: RequestConfig = {}): Promise<T> {
    const { params, headers, ...rest } = config;

    const url = new URL(`${this.baseUrl}${path}`);
    if (params) {
      Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
    }

    const token = this.getAccessToken();
    const mergedHeaders: HeadersInit = {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    };

    const response = await fetch(url.toString(), { ...rest, headers: mergedHeaders });

    if (!response.ok) {
      let message = response.statusText;
      try {
        const body = (await response.json()) as { message?: string };
        message = body.message ?? message;
      } catch {
        // ignore parse error — keep statusText
      }
      throw new ApiClientError({ message, statusCode: response.status });
    }

    if (response.status === 204) return undefined as T;

    return response.json() as Promise<T>;
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

  // Auth-specific methods that don't require a token
  async login(email: string, password: string): Promise<AuthResponse> {
    return this.post<AuthResponse>('/auth/login', { email, password });
  }

  async register(
    username: string,
    email: string,
    password: string
  ): Promise<AuthResponse> {
    return this.post<AuthResponse>('/auth/register', { username, email, password });
  }

  async forgotPassword(email: string): Promise<{ message: string }> {
    return this.post<{ message: string }>('/auth/forgot-password', { email });
  }

  async resetPassword(token: string, password: string): Promise<{ message: string }> {
    return this.post<{ message: string }>('/auth/reset-password', { token, password });
  }
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8080/api/v1';

export const apiClient = new ApiClient(API_BASE_URL);
