const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080/api';

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

class AdminAuthApi {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  /**
   * Admin login API call
   */
  async login(credentials: AdminLoginRequest): Promise<AdminLoginResponse> {
    const response = await fetch(`${this.baseUrl}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      throw new Error('Login Failure!');
    }

    const data = await response.json();
    return data;
  }

  /**
   * Refresh admin token
   */
  async refreshToken(refreshToken: string): Promise<AdminRefreshTokenResponse> {
    const response = await fetch(`${this.baseUrl}/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refreshToken }),
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Phiên đăng nhập đã hết hạn');
      } else {
        throw new Error('Không thể làm mới token');
      }
    }

    const data = await response.json();
    return data;
  }

  /**
   * Admin logout API call (if implemented in backend)
   */
  async logout(accessToken: string): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/auth/logout`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        console.warn('Backend logout failed, but continuing with local cleanup');
      }
    } catch (error) {
      console.warn('Logout API call failed:', error);
    }
  }

  /**
   * Get user profile with access token
   */
  async getProfile(accessToken: string): Promise<any> {
    const response = await fetch(`${this.baseUrl}/auth/me`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Token không hợp lệ');
      } else {
        throw new Error('Không thể lấy thông tin người dùng');
      }
    }

    const data = await response.json();
    return data;
  }
}

// Export singleton instance
export const adminAuthApi = new AdminAuthApi();