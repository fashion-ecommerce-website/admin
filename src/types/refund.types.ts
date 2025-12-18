// Refund types for Admin panel

// Refund status enum
export enum RefundStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  COMPLETED = 'COMPLETED',
}

// Refund item interface (matching backend response)
export interface Refund {
  id: number;
  orderId: number;
  userId: number;
  userEmail: string;
  status: RefundStatus;
  reason: string;
  refundAmount: number;
  adminNote: string | null;
  processedBy: number | null;
  processedAt: string | null;
  stripeRefundId: string | null;
  createdAt: string;
  updatedAt: string;
  imageUrls: string[] | null; // List of image URLs from Cloudinary
}

// Re-export BackendPaginatedResponse as PaginatedResponse
export type { BackendPaginatedResponse as PaginatedResponse } from './common.types';

// Refund query parameters for admin
export interface RefundQueryParams {
  status?: RefundStatus;
  page?: number;
  size?: number;
}

// Update refund status request
export interface UpdateRefundStatusRequest {
  status: 'APPROVED' | 'REJECTED';
  adminNote?: string;
}

// Refund state for Redux store
export interface RefundState {
  refunds: Refund[];
  selectedRefund: Refund | null;
  loading: boolean;
  error: string | null;
  total: number;
  currentPage: number;
  totalPages: number;
  pageSize: number;
}
