import { PUBLIC_API_URL } from '$env/static/public';
import { browser } from '$app/environment';

interface RequestOptions extends RequestInit {
  headers?: Record<string, string>;
  token?: string;
}

interface ApiError {
  status: number;
  message: string;
  data?: any;
}

class ApiService {
  private baseURL: string;
  private defaultHeaders: Record<string, string>;

  constructor() {
    this.baseURL = PUBLIC_API_URL;
    this.defaultHeaders = {
      'Content-Type': 'application/json',
    };
  }

  private getHeaders(
    customHeaders: Record<string, string> = {},
    customToken: string | null = null,
  ): Record<string, string> {
    const headers: Record<string, string> = {
      ...this.defaultHeaders,
      ...customHeaders,
    };

    let token: string | null = customToken;

    if (!token && browser) {
      token = localStorage.getItem('jwt-token');
    }

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    console.log('Headers:', headers);

    return headers;
  }

  private async handleResponse<T>(response: Response): Promise<T | null> {
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      const apiError: ApiError = {
        status: response.status,
        message: error.message || 'Error en la petición',
        data: error,
      };
      throw apiError;
    }

    if (response.status === 204) {
      return null;
    }

    return response.json() as Promise<T>;
  }

  async get<T>(
    endpoint: string,
    options: RequestOptions = {},
  ): Promise<T | null> {
    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        method: 'GET',
        headers: this.getHeaders(options.headers, options.token),
        ...options,
      });

      return await this.handleResponse<T>(response);
    } catch (error) {
      console.error('GET Error:', error);
      throw error;
    }
  }

  async post<T>(
    endpoint: string,
    data = {},
    options: RequestOptions = {},
  ): Promise<T | null> {
    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        method: 'POST',
        headers: this.getHeaders(options.headers),
        body: JSON.stringify(data),
        ...options,
      });

      return await this.handleResponse<T>(response);
    } catch (error) {
      console.error('POST Error:', error);
      throw error;
    }
  }

  async put<T>(
    endpoint: string,
    data = {},
    options: RequestOptions = {},
  ): Promise<T | null> {
    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        method: 'PUT',
        headers: this.getHeaders(options.headers),
        body: JSON.stringify(data),
        ...options,
      });

      return await this.handleResponse<T>(response);
    } catch (error) {
      console.error('PUT Error:', error);
      throw error;
    }
  }

  async patch<T>(
    endpoint: string,
    data = {},
    options: RequestOptions = {},
  ): Promise<T | null> {
    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        method: 'PATCH',
        headers: this.getHeaders(options.headers),
        body: JSON.stringify(data),
        ...options,
      });

      return await this.handleResponse<T>(response);
    } catch (error) {
      console.error('PATCH Error:', error);
      throw error;
    }
  }

  async delete<T>(
    endpoint: string,
    options: RequestOptions = {},
  ): Promise<T | null> {
    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        method: 'DELETE',
        headers: this.getHeaders(options.headers),
        ...options,
      });

      return await this.handleResponse<T>(response);
    } catch (error) {
      console.error('DELETE Error:', error);
      throw error;
    }
  }

  async postFormData<T>(
    endpoint: string,
    formData: FormData,
    options: RequestOptions = {},
  ): Promise<T | null> {
    try {
      const token = localStorage.getItem('jwt-token');
      const headers: Record<string, string> = { ...options.headers };

      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`${this.baseURL}${endpoint}`, {
        method: 'POST',
        headers: headers,
        body: formData,
        ...options,
      });

      return await this.handleResponse<T>(response);
    } catch (error) {
      console.error('POST FormData Error:', error);
      throw error;
    }
  }
}

export const api = new ApiService();

export type { ApiError, RequestOptions };
