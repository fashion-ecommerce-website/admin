interface ApiResponse<T> {
  success: boolean;
  data: T | null;
  message?: string;
}

// Base API configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080/api';

// HTTP methods
type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

// Request options
interface RequestOptions {
  method: HttpMethod;
  headers?: Record<string, string>;
  body?: string | FormData;
}

// Base API class for Admin panel
class AdminBaseApi {
  private baseUrl: string;
  private isRefreshing: boolean = false;
  private failedQueue: Array<{
    resolve: (value: string | null) => void;
    reject: (reason: unknown) => void;
  }> = [];

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  // Process the queue of failed requests
  private processQueue(error: unknown, token?: string) {
    this.failedQueue.forEach(({ resolve, reject }) => {
      if (error) {
        reject(error);
      } else {
        resolve(token ?? null);
      }
    });

    this.failedQueue = [];
  }

  // Refresh admin token logic
  private async refreshToken(): Promise<string | null> {
    if (this.isRefreshing) {
      // If already refreshing, wait for the current refresh to complete
      return new Promise((resolve, reject) => {
        this.failedQueue.push({ resolve, reject });
      });
    }

    this.isRefreshing = true;

    try {
      const refreshToken = typeof window !== 'undefined' ? sessionStorage.getItem('admin_refresh_token') : null;
      if (!refreshToken) {
        throw new Error('No admin refresh token available');
      }
      
      const response = await fetch(`${this.baseUrl}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken }),
      });

      if (!response.ok) {
        throw new Error(`Failed to refresh admin token: ${response.status}`);
      }

      const data = await response.json();
      const newAccessToken = data.accessToken || data.access_token;
      const newRefreshToken = data.refreshToken || data.refresh_token;
      
      if (!newAccessToken || !newRefreshToken) {
        throw new Error('Invalid response structure from admin refresh endpoint');
      }

      if (typeof window !== 'undefined') {
        sessionStorage.setItem('admin_access_token', newAccessToken);
        sessionStorage.setItem('admin_refresh_token', newRefreshToken);
      }

      this.processQueue(null, newAccessToken);
      return newAccessToken;
    } catch (error) {
      this.processQueue(error, undefined);
      // Clear admin tokens if refresh fails
      if (typeof window !== 'undefined') {
        sessionStorage.removeItem('admin_access_token');
        sessionStorage.removeItem('admin_refresh_token');
        sessionStorage.removeItem('admin_user');
      }
      return null;
    } finally {
      this.isRefreshing = false;
    }
  }

  // Get admin authorization header
  private getAuthHeaders(): Record<string, string> {
    const token = typeof window !== 'undefined' ? sessionStorage.getItem('admin_access_token') : null;
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  // Check if admin token is expired or about to expire
  private isTokenExpired(): boolean {
    const token = typeof window !== 'undefined' ? sessionStorage.getItem('admin_access_token') : null;
    if (!token) return true;

    try {
      // Decode JWT token to check expiry
      const payload = JSON.parse(atob(token.split('.')[1]));
      const exp = payload.exp;
      const now = Math.floor(Date.now() / 1000);
      
      // Consider token expired if it expires within next 30 seconds
      const isExpired = exp - now < 30;
      return isExpired;
    } catch {
      return true;
    }
  }

  // Proactive token refresh before making request
  private async ensureValidToken(): Promise<boolean> {
    if (this.isTokenExpired()) {
      const newToken = await this.refreshToken();
      return newToken !== null;
    }
    return true;
  }

  // Make HTTP request
  private async makeRequest<T>(
    endpoint: string,
    options: RequestOptions,
    retry: boolean = true
  ): Promise<ApiResponse<T>> {
    try {
      // Proactively check and refresh token if needed (only for authenticated endpoints)
      if (!endpoint.includes('/auth/') && 
          !endpoint.includes('/public/') && 
          !endpoint.includes('/categories') && 
          !endpoint.includes('/products')) {
        const tokenValid = await this.ensureValidToken();
        if (!tokenValid) {
          return {
            success: false,
            data: null,
            message: 'Admin authentication required',
          };
        }
      }

      const url = `${this.baseUrl}${endpoint}`;

      // Build headers but do not set Content-Type when sending FormData so the browser
      // can set the appropriate multipart/form-data boundary.
      const headers: Record<string, string> = { ...(options.headers || {}) };
      if (!(options.body instanceof FormData)) {
        // Only set default Content-Type for non-FormData bodies
        headers['Content-Type'] = headers['Content-Type'] || 'application/json';
      }

      // Only add auth headers for authenticated endpoints
      if (!endpoint.includes('/auth/') && 
          !endpoint.includes('/public/') && 
          !endpoint.includes('/categories')) {
        Object.assign(headers, this.getAuthHeaders());
      }

      const config: RequestInit = {
        method: options.method,
        headers,
      };

      if (options.body && options.method !== 'GET') {
        // If body is FormData, pass it through as-is. For JSON strings, pass string.
        config.body = options.body as BodyInit;
      }

      const response = await fetch(url, config);
      
      // Handle 401 Unauthorized - try to refresh token
      if (response.status === 401 && retry && !endpoint.includes('/auth/refresh')) {
        const newToken = await this.refreshToken();
        if (newToken) {
          // Retry the request with new token
          return this.makeRequest<T>(endpoint, options, false);
        } else {
          return {
            success: false,
            data: null,
            message: 'Admin authentication failed',
          };
        }
      }

      // Handle 204 No Content or empty responses: do not attempt to parse JSON
      let parsedData: T | null = null;

      // If status is 204 No Content, there's intentionally no body
      if (response.status === 204) {
        parsedData = null;
      } else {
        // Try to parse JSON; if parsing fails (non-JSON body), fall back to null
        try {
          // Some responses may have empty body even if status != 204 (Content-Length: 0)
          // So guard by checking content-length header when available
          const contentLength = response.headers.get('content-length');
          const hasBody = contentLength ? parseInt(contentLength, 10) > 0 : true;

          if (hasBody) {
            // Attempt to parse JSON; if it fails we'll catch and keep parsedData = null
            const jsonData = await response.json();
            parsedData = jsonData as T;
          } else {
            parsedData = null;
          }
        } catch {
          // If response isn't JSON, we don't want to throw here. Keep data null and
          // return message based on status or text if available.
          try {
            const text = await response.text();
            parsedData = (text ? text : null) as T;
          } catch {
            parsedData = null;
          }
        }
      }

      if (!response.ok) {
        // Try to extract error message from response
        let errorMessage = `HTTP Error: ${response.status}`;
        
        if (parsedData && typeof parsedData === 'object' && parsedData !== null) {
          const errorData = parsedData as Record<string, unknown>;
          if ('message' in errorData && typeof errorData.message === 'string') {
            errorMessage = errorData.message;
          } else if ('error' in errorData && typeof errorData.error === 'string') {
            errorMessage = errorData.error;
          }
        }

        return {
          success: false,
          data: null,
          message: errorMessage,
        };
      }

      // Extract message from successful response if available
      let responseMessage: string | undefined;
      if (parsedData && typeof parsedData === 'object' && parsedData !== null) {
        const responseData = parsedData as Record<string, unknown>;
        if ('message' in responseData && typeof responseData.message === 'string') {
          responseMessage = responseData.message;
        }
      }

      return {
        success: true,
        // For successful responses with no JSON body, data will be null which is expected
        data: parsedData,
        message: responseMessage,
      };
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Network error occurred';
      return {
        success: false,
        data: null,
        message: errorMessage,
      };
    }
  }

  // HTTP methods
  async get<T>(endpoint: string, headers?: Record<string, string>): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(endpoint, { method: 'GET', headers });
  }

  async post<T>(
    endpoint: string,
    body?: Record<string, unknown> | FormData | unknown,
    headers?: Record<string, string>
  ): Promise<ApiResponse<T>> {
    const requestBody = body instanceof FormData ? body : body ? JSON.stringify(body) : undefined;
    return this.makeRequest<T>(endpoint, { 
      method: 'POST', 
      body: requestBody, 
      headers 
    });
  }

  async put<T>(
    endpoint: string,
    body?: Record<string, unknown> | FormData | unknown,
    headers?: Record<string, string>
  ): Promise<ApiResponse<T>> {
    const requestBody = body instanceof FormData ? body : body ? JSON.stringify(body) : undefined;
    return this.makeRequest<T>(endpoint, { 
      method: 'PUT', 
      body: requestBody, 
      headers 
    });
  }

  async patch<T>(
    endpoint: string,
    body?: Record<string, unknown> | FormData | unknown,
    headers?: Record<string, string>
  ): Promise<ApiResponse<T>> {
    const requestBody = body instanceof FormData ? body : body ? JSON.stringify(body) : undefined;
    return this.makeRequest<T>(endpoint, { 
      method: 'PATCH', 
      body: requestBody, 
      headers 
    });
  }

  async delete<T>(
    endpoint: string,
    headers?: Record<string, string>
  ): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(endpoint, { method: 'DELETE', headers });
  }
}

// Export singleton instance for Admin API
export const adminApiClient = new AdminBaseApi();
export default AdminBaseApi;
export type { ApiResponse };