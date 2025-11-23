interface RequestOptions extends RequestInit {
  headers?: Record<string, string>;
  fetch?: typeof fetch;
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
    this.baseURL = "/api";
    this.defaultHeaders = {
      "Content-Type": "application/json",
    };
  }

  private getHeaders(
    customHeaders: Record<string, string> = {},
  ): Record<string, string> {
    const headers: Record<string, string> = {
      ...this.defaultHeaders,
      ...customHeaders,
    };

    console.log("Headers:", headers);

    return headers;
  }

  private async handleResponse<T>(response: Response): Promise<T | null> {
    console.log("handleResponse llamado con status:", response.status);
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      const apiError: ApiError = {
        status: response.status,
        message: error.message || "Error en la petición",
        data: error,
      };
      console.log("handleResponse - respuesta no ok:", apiError);
      throw apiError;
    }

    if (response.status === 204) {
      console.log("handleResponse - status 204, retornando null");
      return null;
    }

    console.log("handleResponse - convirtiendo respuesta a JSON...");
    const result = (await response.json()) as Promise<T>;

    return result;
  }

  async get<T>(
    endpoint: string,
    options: RequestOptions = {},
  ): Promise<T | null> {
    const fetcher = options.fetch || fetch;
    try {
      const response = await fetcher(`${this.baseURL}${endpoint}`, {
        method: "GET",
        headers: this.getHeaders(options.headers),
        credentials: "include",
        ...options,
      });

      return await this.handleResponse<T>(response);
    } catch (error) {
      console.error("GET Error:", error);
      throw error;
    }
  }

  async post<T>(
    endpoint: string,
    data = {},
    options: RequestOptions = {},
  ): Promise<T | null> {
    const fetcher = options.fetch || fetch;
    try {
      const response = await fetcher(`${this.baseURL}${endpoint}`, {
        method: "POST",
        headers: this.getHeaders(options.headers),
        body: JSON.stringify(data),
        credentials: "include",
        ...options,
      });

      console.log("Response:", response);

      return await this.handleResponse<T>(response);
    } catch (error) {
      console.error("POST Error:", error);
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
        method: "PUT",
        headers: this.getHeaders(options.headers),
        body: JSON.stringify(data),
        credentials: "include",
        ...options,
      });

      return await this.handleResponse<T>(response);
    } catch (error) {
      console.error("PUT Error:", error);
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
        method: "PATCH",
        headers: this.getHeaders(options.headers),
        body: JSON.stringify(data),
        credentials: "include",
        ...options,
      });

      return await this.handleResponse<T>(response);
    } catch (error) {
      console.error("PATCH Error:", error);
      throw error;
    }
  }

  async delete<T>(
    endpoint: string,
    options: RequestOptions = {},
  ): Promise<T | null> {
    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        method: "DELETE",
        headers: this.getHeaders(options.headers),
        credentials: "include",
        ...options,
      });

      return await this.handleResponse<T>(response);
    } catch (error) {
      console.error("DELETE Error:", error);
      throw error;
    }
  }

  async postFormData<T>(
    endpoint: string,
    formData: FormData,
    options: RequestOptions = {},
  ): Promise<T | null> {
    try {
      const token = localStorage.getItem("jwt-token");
      const headers: Record<string, string> = { ...options.headers };

      if (token && token !== "cookie_auth") {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const response = await fetch(`${this.baseURL}${endpoint}`, {
        method: "POST",
        headers: headers,
        body: formData,
        credentials: "include",
        ...options,
      });

      return await this.handleResponse<T>(response);
    } catch (error) {
      console.error("POST FormData Error:", error);
      throw error;
    }
  }
}

export const api = new ApiService();

export type { ApiError, RequestOptions };
