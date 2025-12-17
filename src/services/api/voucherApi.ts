import { adminApiClient } from './baseApi';
import type { ApiResponse } from './baseApi';
import {
  VoucherListResponse,
  BackendVoucher,
  GetVouchersRequest,
  CreateVoucherRequest,
  UpdateVoucherRequest,
} from '../../types/voucher.types';

class VoucherApi {
  private readonly endpoint = '/vouchers';

  /**
   * Get all vouchers with pagination, search and filtering
   */
  async getAllVouchers(params?: GetVouchersRequest): Promise<ApiResponse<VoucherListResponse>> {
    try {
      // Build query parameters
      const queryParams = new URLSearchParams();
      
      if (params?.page !== undefined) queryParams.append('page', params.page.toString());
      if (params?.pageSize !== undefined) queryParams.append('pageSize', params.pageSize.toString());
      if (params?.name) queryParams.append('name', params.name);
      if (params?.type) queryParams.append('type', params.type);
      if (params?.isActive !== undefined) queryParams.append('isActive', params.isActive.toString());
      if (params?.audienceType) queryParams.append('audienceType', params.audienceType);
      if (params?.sortBy) queryParams.append('sortBy', params.sortBy);
      if (params?.sortDirection) queryParams.append('sortDirection', params.sortDirection);

      const queryString = queryParams.toString();
      const endpoint = `/admin${this.endpoint}${queryString ? `?${queryString}` : ''}`;

      const response = await adminApiClient.get<VoucherListResponse>(endpoint);
      
      if (!response.success) {
        return {
          success: false,
          data: null,
          message: response.message || 'Failed to fetch vouchers'
        };
      }
      
      return {
        success: true,
        data: response.data,
        message: 'Vouchers fetched successfully'
      };
    } catch (error: unknown) {
      console.error('Error fetching vouchers:', error);
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'Failed to fetch vouchers';
      return {
        success: false,
        data: null,
        message: errorMessage
      };
    }
  }

  /**
   * Get voucher by ID
   */
  async getVoucherById(id: number): Promise<ApiResponse<BackendVoucher>> {
    try {
      const response = await adminApiClient.get<BackendVoucher>(`/admin${this.endpoint}/${id}`);
      
      if (!response.success) {
        return {
          success: false,
          data: null,
          message: response.message || 'Failed to fetch voucher'
        };
      }
      
      return {
        success: true,
        data: response.data,
        message: 'Voucher fetched successfully'
      };
    } catch (error: unknown) {
      console.error('Error fetching voucher:', error);
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'Failed to fetch voucher';
      return {
        success: false,
        data: null,
        message: errorMessage
      };
    }
  }

  /**
   * Create a new voucher
   */
  async createVoucher(voucherData: CreateVoucherRequest): Promise<ApiResponse<BackendVoucher>> {
    try {
      const response = await adminApiClient.post<BackendVoucher>(`/admin${this.endpoint}`, voucherData);
      
      // Check if the API call was successful
      if (!response.success) {
        return {
          success: false,
          data: null,
          message: response.message || 'Failed to create voucher'
        };
      }
      
      return {
        success: true,
        data: response.data,
        message: 'Voucher created successfully'
      };
    } catch (error: unknown) {
      console.error('Error creating voucher:', error);
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'Failed to create voucher';
      return {
        success: false,
        data: null,
        message: errorMessage
      };
    }
  }

  /**
   * Update voucher
   */
  async updateVoucher(id: number, voucherData: UpdateVoucherRequest): Promise<ApiResponse<BackendVoucher>> {
    try {
      const response = await adminApiClient.put<BackendVoucher>(`/admin${this.endpoint}/${id}`, voucherData);
      
      if (!response.success) {
        return {
          success: false,
          data: null,
          message: response.message || 'Failed to update voucher'
        };
      }
      
      return {
        success: true,
        data: response.data,
        message: 'Voucher updated successfully'
      };
    } catch (error: unknown) {
      console.error('Error updating voucher:', error);
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'Failed to update voucher';
      return {
        success: false,
        data: null,
        message: errorMessage
      };
    }
  }

  /**
   * Toggle voucher active status
   */
  async toggleVoucherActive(id: number): Promise<ApiResponse<BackendVoucher | null>> {
    try {
      const response = await adminApiClient.patch(
        `/admin${this.endpoint}/${id}/toggle-active`,
        {}
      );
      
      if (!response.success) {
        return {
          success: false,
          data: null,
          message: response.message || 'Failed to update voucher status'
        };
      }
      
      return {
        success: true,
        data: response.data && typeof response.data === 'object' && 'id' in response.data 
          ? response.data as BackendVoucher 
          : null,
        message: 'Voucher status updated successfully'
      };
    } catch (error: unknown) {
      console.error('Error toggling voucher status:', error);
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'Failed to update voucher status';
      return {
        success: false,
        data: null,
        message: errorMessage
      };
    }
  }

  /**
   * Delete voucher
   */
  async deleteVoucher(id: number): Promise<ApiResponse<void>> {
    try {
      const response = await adminApiClient.delete(`/admin${this.endpoint}/${id}`);
      
      if (!response.success) {
        return {
          success: false,
          data: null,
          message: response.message || 'Failed to delete voucher'
        };
      }
      
      return {
        success: true,
        data: null,
        message: 'Voucher deleted successfully'
      };
    } catch (error: unknown) {
      console.error('Error deleting voucher:', error);
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'Failed to delete voucher';
      return {
        success: false,
        data: null,
        message: errorMessage
      };
    }
  }
}

export const voucherApi = new VoucherApi();