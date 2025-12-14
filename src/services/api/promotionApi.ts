import { adminApiClient } from './baseApi';
import type { ApiResponse } from './baseApi';
import {
  PromotionListResponse,
  BackendPromotion,
  GetPromotionsRequest,
  CreatePromotionRequest,
  UpdatePromotionRequest,
  UpsertTargetsRequest,
  TargetsUpsertResult,
  PromotionTargetsListResponse,
  PromotionTargetType,
} from '../../types/promotion.types';

class PromotionApi {
  private readonly endpoint = '/promotions';

  /**
   * Get all promotions with pagination, search and filtering
   */
  async getAllPromotions(params?: GetPromotionsRequest): Promise<ApiResponse<PromotionListResponse>> {
    try {
      // Build query parameters
      const queryParams = new URLSearchParams();
      
      if (params?.page !== undefined) queryParams.append('page', params.page.toString());
      if (params?.pageSize !== undefined) queryParams.append('pageSize', params.pageSize.toString());
      if (params?.name) queryParams.append('name', params.name);
      if (params?.isActive !== undefined) queryParams.append('isActive', params.isActive.toString());
      if (params?.type) queryParams.append('type', params.type);
      if (params?.sortBy) queryParams.append('sort', params.sortBy);

      const queryString = queryParams.toString();
      const endpoint = `/admin${this.endpoint}${queryString ? `?${queryString}` : ''}`;

      const response = await adminApiClient.get<PromotionListResponse>(endpoint);
      
      return {
        success: true,
        data: response.data,
        message: 'Promotions fetched successfully'
      };
    } catch (error: unknown) {
      console.error('Error fetching promotions:', error);
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'Failed to fetch promotions';
      return {
        success: false,
        data: null,
        message: errorMessage
      };
    }
  }

  /**
   * Get promotion by ID
   */
  async getPromotionById(id: number): Promise<ApiResponse<BackendPromotion>> {
    try {
      const response = await adminApiClient.get<BackendPromotion>(`/admin${this.endpoint}/${id}`);
      
      return {
        success: true,
        data: response.data,
        message: 'Promotion fetched successfully'
      };
    } catch (error: unknown) {
      console.error('Error fetching promotion:', error);
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'Failed to fetch promotion';
      return {
        success: false,
        data: null,
        message: errorMessage
      };
    }
  }

  /**
   * Create a new promotion
   */
  async createPromotion(promotionData: CreatePromotionRequest): Promise<ApiResponse<BackendPromotion>> {
    try {
      const response = await adminApiClient.post<BackendPromotion>(`/admin${this.endpoint}`, promotionData);
      
      return {
        success: response.success,
        data: response.data,
        message: response.message || (response.success ? 'Promotion created successfully' : 'Failed to create promotion')
      };
    } catch (error: unknown) {
      console.error('Error creating promotion:', error);
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'Failed to create promotion';
      return {
        success: false,
        data: null,
        message: errorMessage
      };
    }
  }

  /**
   * Update an existing promotion
   */
  async updatePromotion(id: number, promotionData: UpdatePromotionRequest): Promise<ApiResponse<BackendPromotion>> {
    try {
      const response = await adminApiClient.put<BackendPromotion>(`/admin${this.endpoint}/${id}`, promotionData);
      
      return {
        success: response.success,
        data: response.data,
        message: response.message || (response.success ? 'Promotion updated successfully' : 'Failed to update promotion')
      };
    } catch (error: unknown) {
      console.error('Error updating promotion:', error);
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'Failed to update promotion';
      return {
        success: false,
        data: null,
        message: errorMessage
      };
    }
  }

  /**
   * Toggle promotion active status
   */
  async togglePromotionActive(id: number): Promise<ApiResponse<BackendPromotion>> {
    try {
      const response = await adminApiClient.post<BackendPromotion>(`/admin${this.endpoint}/${id}:toggle`, {});
      
      // Status 204 No Content means success but no response body
      if (response.success) {
        return {
          success: true,
          data: response.data, // Will be null for 204, which is expected
          message: response.message || 'Promotion status toggled successfully'
        };
      }
      
      return {
        success: false,
        data: null,
        message: response.message || 'Failed to toggle promotion status'
      };
    } catch (error: unknown) {
      console.error('Error toggling promotion status:', error);
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'Failed to toggle promotion status';
      return {
        success: false,
        data: null,
        message: errorMessage
      };
    }
  }

  /**
   * Delete a promotion (soft delete - toggle to inactive)
   */
  async deletePromotion(id: number): Promise<ApiResponse<void>> {
    try {
      // Thay vì DELETE, gọi toggle API để set isActive = false
      const response = await adminApiClient.post<BackendPromotion>(`/admin${this.endpoint}/${id}:toggle`, {});
      
      return {
        success: true,
        data: null,
        message: 'Promotion deleted successfully'
      };
    } catch (error: unknown) {
      console.error('Error deleting promotion:', error);
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'Failed to delete promotion';
      return {
        success: false,
        data: null,
        message: errorMessage
      };
    }
  }

  /**
   * Upsert promotion targets (add products/categories/SKUs to promotion)
   */
  async upsertTargets(promotionId: number, request: UpsertTargetsRequest): Promise<ApiResponse<TargetsUpsertResult>> {
    try {
      const response = await adminApiClient.post<TargetsUpsertResult>(
        `/admin${this.endpoint}/${promotionId}/targets:upsert`,
        request
      );
      
      return {
        success: true,
        data: response.data,
        message: `Added ${response.data?.added || 0} targets, skipped ${response.data?.skipped || 0}`
      };
    } catch (error: unknown) {
      console.error('Error upserting promotion targets:', error);
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'Failed to add targets to promotion';
      return {
        success: false,
        data: null,
        message: errorMessage
      };
    }
  }

  /**
   * Get promotion targets list
   */
  async getTargets(
    promotionId: number, 
    type?: PromotionTargetType, 
    page: number = 0, 
    pageSize: number = 50
  ): Promise<ApiResponse<PromotionTargetsListResponse>> {
    try {
      const queryParams = new URLSearchParams();
      if (type) queryParams.append('type', type);
      queryParams.append('page', page.toString());
      queryParams.append('pageSize', pageSize.toString());

      const queryString = queryParams.toString();
      const response = await adminApiClient.get<PromotionTargetsListResponse>(
        `/admin${this.endpoint}/${promotionId}/targets${queryString ? `?${queryString}` : ''}`
      );
      
      return {
        success: true,
        data: response.data,
        message: 'Targets fetched successfully'
      };
    } catch (error: unknown) {
      console.error('Error fetching promotion targets:', error);
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'Failed to fetch promotion targets';
      return {
        success: false,
        data: null,
        message: errorMessage
      };
    }
  }

  /**
   * Remove promotion targets
   */
  async removeTargets(
    promotionId: number, 
    items: Array<{ targetType: PromotionTargetType; targetId: number }>
  ): Promise<ApiResponse<number>> {
    try {
      // Use fetch directly since adminApiClient.delete doesn't support body
      const token = typeof window !== 'undefined' ? sessionStorage.getItem('admin_access_token') : null;
      const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080/api';
      
      const response = await fetch(`${baseUrl}/admin${this.endpoint}/${promotionId}/targets`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ items }),
      });

      if (!response.ok) {
        throw new Error(`Failed to remove targets: ${response.status}`);
      }

      const data = await response.json();
      
      return {
        success: true,
        data: data,
        message: `Removed ${data || 0} targets`
      };
    } catch (error: unknown) {
      console.error('Error removing promotion targets:', error);
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'Failed to remove targets from promotion';
      return {
        success: false,
        data: null,
        message: errorMessage
      };
    }
  }
}

export const promotionApi = new PromotionApi();
