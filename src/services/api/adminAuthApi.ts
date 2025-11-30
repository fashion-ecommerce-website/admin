const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080/api';
import { adminApiClient, type ApiResponse } from './baseApi';

// API Response types based on your actual backend response
export interface AdminLoginRequest {
  email: string;
  password: string;
}

export interface AdminLoginResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string | null;
  expiresIn: number;
  username: string;
  email: string;
}

export interface AdminRefreshTokenRequest {
  refreshToken: string;
}

export interface AdminRefreshTokenResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string | null;
  expiresIn: number;
}

export interface AdminProfile {
  id: number;
  username: string;
  email: string;
  role?: string;
}

export interface AuthenticatedUser {
  id: number;
  username: string;
  email: string;
  role: string;
}

class AdminAuthApi {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  /**
   * Admin login API call
   */
  async login(credentials: AdminLoginRequest): Promise<AdminLoginResponse> {
    const res: ApiResponse<AdminLoginResponse> = await adminApiClient.post('/auth/login', credentials);
    if (!res.success || !res.data) throw new Error(res.message || 'Login Failure!');
    return res.data;
  }

  /**
   * Refresh admin token
   */
  async refreshToken(refreshToken: string): Promise<AdminRefreshTokenResponse> {
    const res: ApiResponse<AdminRefreshTokenResponse> = await adminApiClient.post('/auth/refresh', { refreshToken });
    if (!res.success || !res.data) throw new Error(res.message || 'Unable to refresh token');
    return res.data;
  }

  /**
   * Admin logout API call (if implemented in backend)
   */
  async logout(): Promise<void> {
    try {
      const res: ApiResponse<unknown> = await adminApiClient.post('/auth/logout', {}, {
        Authorization: `Bearer ${this.refreshToken}`,
      });
      if (!res.success) {
        console.warn('Backend logout failed, but continuing with local cleanup');
      }
    } catch (error) {
      console.warn('Logout API call failed:', error);
    }
  }

  /**
   * Get user profile with access token
   */
  async getProfile(accessToken: string): Promise<AdminProfile> {
    const res: ApiResponse<AdminProfile> = await adminApiClient.get('/auth/me', {
      Authorization: `Bearer ${accessToken}`,
    });
    if (!res.success) {
      throw new Error(res.message || 'Unable to fetch user profile');
    }
    return res.data!;
  }

  /**
   * Get authenticated user info (including role) via auth/users
   */
  async getAuthenticatedUser(accessToken: string): Promise<AuthenticatedUser> {
    const res: ApiResponse<AuthenticatedUser> = await adminApiClient.get('/users', {
      Authorization: `Bearer ${accessToken}`,
    });
    if (!res.success) {
      throw new Error(res.message || 'Unable to fetch authenticated user');
    }
    return res.data!;
  }
}

// Export singleton instance
export const adminAuthApi = new AdminAuthApi();