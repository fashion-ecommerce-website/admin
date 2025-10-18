import { adminApiClient } from './baseApi';
import type { ApiResponse } from './baseApi';
import {
  PromotionListResponse,
  BackendPromotion,
  GetPromotionsRequest,
  CreatePromotionRequest,
  UpdatePromotionRequest,
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
        success: true,
        data: response.data,
        message: 'Promotion created successfully'
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
        success: true,
        data: response.data,
        message: 'Promotion updated successfully'
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
   * Delete a promotion
   */
  async deletePromotion(id: number): Promise<ApiResponse<void>> {
    try {
      await adminApiClient.delete(`/admin${this.endpoint}/${id}`);
      
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
}

export const promotionApi = new PromotionApi();
