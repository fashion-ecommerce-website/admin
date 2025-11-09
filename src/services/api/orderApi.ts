import { adminApiClient } from './baseApi';
import type { ApiResponse } from './baseApi';
import {
  Order,
  PaginatedResponse,
  OrderQueryParams,
  UpdateOrderRequest,
} from '../../types/order.types';

class OrderApi {
  private readonly endpoint = '/orders';

  /**
   * Get all orders with pagination and filtering
   */
  async getAllOrders(params?: OrderQueryParams): Promise<ApiResponse<PaginatedResponse<Order>>> {
    try {
      // Build query parameters
      const queryParams = new URLSearchParams();
      
      if (params?.page !== undefined) queryParams.append('page', params.page.toString());
      if (params?.size !== undefined) queryParams.append('size', params.size.toString());
      if (params?.userId) queryParams.append('userId', params.userId.toString());
      if (params?.status) queryParams.append('status', params.status);
      if (params?.paymentStatus) queryParams.append('paymentStatus', params.paymentStatus);
      if (params?.sortBy) queryParams.append('sortBy', params.sortBy);
      if (params?.direction) queryParams.append('direction', params.direction);

      const queryString = queryParams.toString();
      const endpoint = `${this.endpoint}${queryString ? `?${queryString}` : ''}`;
      
      const response = await adminApiClient.get<PaginatedResponse<Order>>(endpoint);
      
      return {
        success: response.success,
        data: response.data,
        message: response.message,
      };
    } catch (error: any) {
      console.error('Error fetching orders:', error);
      return {
        success: false,
        data: null,
        message: error.message || 'Failed to fetch orders',
      };
    }
  }

  /**
   * Get order by ID
   */
  async getOrderById(orderId: number): Promise<ApiResponse<Order>> {
    try {
      const response = await adminApiClient.get<Order>(`${this.endpoint}/${orderId}`);
      
      return {
        success: response.success,
        data: response.data,
        message: response.message,
      };
    } catch (error: any) {
      console.error('Error fetching order:', error);
      return {
        success: false,
        data: null,
        message: error.message || 'Failed to fetch order',
      };
    }
  }

  /**
   * Update order status and payment status
   */
  async updateOrder(orderId: number, data: UpdateOrderRequest): Promise<ApiResponse<Order>> {
    try {
      const response = await adminApiClient.put<Order>(`${this.endpoint}/${orderId}`, data);
      
      return {
        success: response.success,
        data: response.data,
        message: response.message || 'Order updated successfully',
      };
    } catch (error: any) {
      console.error('Error updating order:', error);
      return {
        success: false,
        data: null,
        message: error.message || 'Failed to update order',
      };
    }
  }

  /**
   * Update order status only (using updateOrder endpoint)
   */
  async updateOrderStatus(orderId: number, status: string): Promise<ApiResponse<Order>> {
    try {
      // Backend doesn't have separate /status endpoint, use PUT
      const response = await adminApiClient.put<Order>(
        `${this.endpoint}/${orderId}`,
        { status }
      );
      
      return {
        success: response.success,
        data: response.data,
        message: response.message || 'Order status updated successfully',
      };
    } catch (error: any) {
      console.error('Error updating order status:', error);
      return {
        success: false,
        data: null,
        message: error.message || 'Failed to update order status',
      };
    }
  }

  /**
   * Cancel order (using updateOrder with CANCELLED status)
   */
  async cancelOrder(orderId: number): Promise<ApiResponse<Order>> {
    try {
      // Backend doesn't have /cancel endpoint, use PUT with CANCELLED status
      const response = await adminApiClient.put<Order>(
        `${this.endpoint}/${orderId}`,
        { status: 'CANCELLED' }
      );
      
      return {
        success: response.success,
        data: response.data,
        message: response.message || 'Order cancelled successfully',
      };
    } catch (error: any) {
      console.error('Error cancelling order:', error);
      return {
        success: false,
        data: null,
        message: error.message || 'Failed to cancel order',
      };
    }
  }

  /**
   * Delete order (admin only)
   */
  async deleteOrder(orderId: number): Promise<ApiResponse<void>> {
    try {
      const response = await adminApiClient.delete(`${this.endpoint}/${orderId}`);
      
      return {
        success: response.success,
        data: null,
        message: response.message || 'Order deleted successfully',
      };
    } catch (error: any) {
      console.error('Error deleting order:', error);
      return {
        success: false,
        data: null,
        message: error.message || 'Failed to delete order',
      };
    }
  }
}

// Export a singleton instance
export const orderApi = new OrderApi();
export default orderApi;
