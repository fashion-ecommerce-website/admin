import { adminApiClient } from './baseApi';
import type { ApiResponse } from './baseApi';
import {
  Refund,
  RefundQueryParams,
  UpdateRefundStatusRequest,
} from '../../types/refund.types';
import { BackendPaginatedResponse } from '../../types/common.types';

class RefundApi {
  private readonly endpoint = '/refunds';

  /**
   * Get all refunds with pagination and filtering
   * GET /api/refunds?page=0&size=10&status=PENDING
   */
  async getAllRefunds(
    params?: RefundQueryParams
  ): Promise<ApiResponse<BackendPaginatedResponse<Refund>>> {
    try {
      const queryParams = new URLSearchParams();

      if (params?.page !== undefined)
        queryParams.append('page', params.page.toString());
      if (params?.size !== undefined)
        queryParams.append('size', params.size.toString());
      if (params?.status) queryParams.append('status', params.status);

      const queryString = queryParams.toString();
      const url = `${this.endpoint}${queryString ? `?${queryString}` : ''}`;

      const response =
        await adminApiClient.get<BackendPaginatedResponse<Refund>>(url);

      return {
        success: response.success,
        data: response.data,
        message: response.message,
      };
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to fetch refunds';
      console.error('Error fetching refunds:', error);
      return {
        success: false,
        data: null,
        message,
      };
    }
  }

  /**
   * Get refund by ID
   * GET /api/refunds/{id}
   */
  async getRefundById(refundId: number): Promise<ApiResponse<Refund>> {
    try {
      const response = await adminApiClient.get<Refund>(
        `${this.endpoint}/${refundId}`
      );

      return {
        success: response.success,
        data: response.data,
        message: response.message,
      };
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to fetch refund';
      console.error('Error fetching refund:', error);
      return {
        success: false,
        data: null,
        message,
      };
    }
  }

  /**
   * Update refund status (approve or reject)
   * PUT /api/refunds/{id}
   */
  async updateRefundStatus(
    refundId: number,
    data: UpdateRefundStatusRequest
  ): Promise<ApiResponse<Refund>> {
    try {
      const response = await adminApiClient.put<Refund>(
        `${this.endpoint}/${refundId}`,
        data
      );

      return {
        success: response.success,
        data: response.data,
        message: response.message || 'Refund status updated successfully',
      };
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to update refund status';
      console.error('Error updating refund status:', error);
      return {
        success: false,
        data: null,
        message,
      };
    }
  }
}

// Export a singleton instance
export const refundApi = new RefundApi();
export default refundApi;
