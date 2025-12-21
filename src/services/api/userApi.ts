import { adminApiClient } from './baseApi';
import type { ApiResponse } from './baseApi';
import {
  UserListResponse,
  BackendUser,
  GetUsersRequest,
  UpdateUserRequest,
  CreateUserRequest,
  UserRank,
} from '../../types/user.types';

class UserApi {
  private readonly endpoint = '/users';

  /**
   * Get all users with pagination
   * Backend API: GET /api/users/all?page={page}&pageSize={pageSize}&keyword={keyword}&active={active}
   * Returns: PageResult<UserResponse>
   */
  async getAllUsers(params?: GetUsersRequest): Promise<ApiResponse<UserListResponse>> {
    try {
      const queryParams = new URLSearchParams();
      
      // Backend uses 0-based page index
      if (params?.page !== undefined) queryParams.append('page', params.page.toString());
      if (params?.pageSize) queryParams.append('pageSize', params.pageSize.toString());
      if (params?.search) queryParams.append('keyword', params.search);
      if (params?.isActive !== undefined) queryParams.append('active', params.isActive.toString());

      const queryString = queryParams.toString();
      const endpoint = `${this.endpoint}/all${queryString ? `?${queryString}` : ''}`;
      
      const response = await adminApiClient.get<UserListResponse>(endpoint);
      
      if (response.success && response.data) {
        return {
          success: true,
          data: response.data,
          message: response.message,
        };
      }
      
      return {
        success: false,
        data: null,
        message: response.message || 'Failed to fetch users',
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        message: error instanceof Error ? error.message : 'Failed to fetch users',
      };
    }
  }

  /**
   * Get user by ID
   */
  async getUserById(id: number): Promise<ApiResponse<BackendUser>> {
    try {
      return await adminApiClient.get<BackendUser>(`${this.endpoint}/${id}`);
    } catch (error) {
      return {
        success: false,
        data: null,
        message: error instanceof Error ? error.message : 'Failed to fetch user',
      };
    }
  }

  /**
   * Create new user
   */
  async createUser(userData: CreateUserRequest): Promise<ApiResponse<BackendUser>> {
    try {
      return await adminApiClient.post<BackendUser>(this.endpoint, userData);
    } catch (error) {
      return {
        success: false,
        data: null,
        message: error instanceof Error ? error.message : 'Failed to create user',
      };
    }
  }

  /**
   * Update existing user
   */
  async updateUser(userData: UpdateUserRequest): Promise<ApiResponse<BackendUser>> {
    try {
      return await adminApiClient.put<BackendUser>(`${this.endpoint}/${userData.id}`, userData);
    } catch (error) {
      return {
        success: false,
        data: null,
        message: error instanceof Error ? error.message : 'Failed to update user',
      };
    }
  }

  /**
   * Delete user by ID
   */
  async deleteUser(id: number): Promise<ApiResponse<{ message: string }>> {
    try {
      return await adminApiClient.delete<{ message: string }>(`${this.endpoint}/${id}`);
    } catch (error) {
      return {
        success: false,
        data: null,
        message: error instanceof Error ? error.message : 'Failed to delete user',
      };
    }
  }

  /**
   * Update user status (Active, Inactive, Blocked)
   */
  async updateUserStatus(
    id: number, 
    status: 'Active' | 'Inactive' | 'Blocked'
  ): Promise<ApiResponse<BackendUser>> {
    try {
      return await adminApiClient.patch<BackendUser>(`${this.endpoint}/${id}/status`, { status });
    } catch (error) {
      return {
        success: false,
        data: null,
        message: error instanceof Error ? error.message : 'Failed to update user status',
      };
    }
  }

  /**
   * Toggle user active status (lock/unlock)
   */
  async toggleUserActiveStatus(
    userId: number, 
    isActive: boolean
  ): Promise<ApiResponse<BackendUser>> {
    try {
      return await adminApiClient.put<BackendUser>('/users/status', { 
        userId, 
        isActive 
      });
    } catch (error) {
      return {
        success: false,
        data: null,
        message: error instanceof Error ? error.message : 'Failed to toggle user status',
      };
    }
  }

  /**
   * Bulk update users
   */
  async bulkUpdateUsers(
    userIds: number[], 
    updates: Partial<UpdateUserRequest>
  ): Promise<ApiResponse<{ updated: number; message: string }>> {
    try {
      return await adminApiClient.post<{ updated: number; message: string }>(
        `${this.endpoint}/bulk-update`, 
        { userIds, updates }
      );
    } catch (error) {
      return {
        success: false,
        data: null,
        message: error instanceof Error ? error.message : 'Failed to bulk update users',
      };
    }
  }

  /**
   * Get user statistics
   */
  async getUserStats(): Promise<ApiResponse<{
    totalUsers: number;
    activeUsers: number;
    inactiveUsers: number;
    blockedUsers: number;
    vipUsers: number;
    recentJoins: number;
  }>> {
    try {
      return await adminApiClient.get<{
        totalUsers: number;
        activeUsers: number;
        inactiveUsers: number;
        blockedUsers: number;
        vipUsers: number;
        recentJoins: number;
      }>(`${this.endpoint}/stats`);
    } catch (error) {
      return {
        success: false,
        data: null,
        message: error instanceof Error ? error.message : 'Failed to fetch user statistics',
      };
    }
  }

  /**
   * Get all user ranks (membership tiers)
   */
  async getUserRanks(): Promise<ApiResponse<UserRank[]>> {
    try {
      return await adminApiClient.get<UserRank[]>(`${this.endpoint}/ranks`);
    } catch (error) {
      return {
        success: false,
        data: null,
        message: error instanceof Error ? error.message : 'Failed to fetch user ranks',
      };
    }
  }
}

// Export singleton instance
export const userApi = new UserApi();
export default UserApi;