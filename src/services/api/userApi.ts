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
   * Get all users with pagination and filtering
   */
  async getAllUsers(params?: GetUsersRequest): Promise<ApiResponse<UserListResponse>> {
    try {
      // Build query parameters
      const queryParams = new URLSearchParams();
      
      if (params?.page) queryParams.append('page', params.page.toString());
      if (params?.limit) queryParams.append('limit', params.limit.toString());
      if (params?.search) queryParams.append('search', params.search);
      if (params?.status) queryParams.append('status', params.status);
      if (params?.role) queryParams.append('role', params.role);
      if (params?.sortBy) queryParams.append('sortBy', params.sortBy);
      if (params?.sortOrder) queryParams.append('sortOrder', params.sortOrder);

      const queryString = queryParams.toString();
      const endpoint = `${this.endpoint}/all${queryString ? `?${queryString}` : ''}`;
      
      const response = await adminApiClient.get<BackendUser[]>(endpoint);
      
      // If response is successful and contains data
      if (response.success && response.data) {
        // Transform the array response into UserListResponse format
        const userListResponse: UserListResponse = {
          users: response.data,
          total: response.data.length,
          page: params?.page || 1,
          limit: params?.limit || 10,
          totalPages: Math.ceil(response.data.length / (params?.limit || 10))
        };
        
        return {
          success: true,
          data: userListResponse,
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