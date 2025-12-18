// Voucher interface for Admin panel
export interface Voucher {
  id: number;
  name: string;
  code: string;
  type: 'PERCENT' | 'FIXED';
  value: number;
  maxDiscount?: number;
  minOrderAmount: number;
  usageLimitTotal: number;
  usageLimitPerUser: number;
  startAt: string;
  endAt: string;
  isActive: boolean;
  audienceType: 'ALL' | 'RANK';
  rankIds: number[];
  createdAt: string;
  updatedAt: string;
  usedCount?: number;
  usageCount?: number;
}

// Backend Voucher interface (from API response)
export interface BackendVoucher {
  id: number;
  name: string;
  code: string;
  type: 'PERCENT' | 'FIXED';
  value: number;
  maxDiscount?: number;
  minOrderAmount: number;
  usageLimitTotal: number;
  usageLimitPerUser: number;
  startAt: string;
  endAt: string;
  isActive: boolean;
  audienceType: 'ALL' | 'RANK';
  rankIds: number[];
  createdAt: string;
  updatedAt: string;
  usedCount?: number;
  usageCount?: number;
}

// Voucher list response from API
export interface VoucherListResponse {
  items: BackendVoucher[];
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

// Request types
export interface GetVouchersRequest {
  page?: number;
  pageSize?: number;
  name?: string;
  type?: 'PERCENT' | 'FIXED';
  isActive?: boolean;
  audienceType?: 'ALL' | 'RANK';
  sortBy?: 'createdAt' | 'updatedAt' | 'name' | 'value';
  sortDirection?: 'asc' | 'desc';
}

export interface CreateVoucherRequest {
  name: string;
  type: 'PERCENT' | 'FIXED';
  value: number;
  maxDiscount?: number;
  minOrderAmount: number;
  usageLimitTotal: number;
  usageLimitPerUser: number;
  startAt: string;
  endAt: string;
  isActive: boolean;
  audienceType: 'ALL' | 'RANK';
  rankIds: number[];
}

export interface UpdateVoucherRequest {
  name: string;
  code: string;
  type: 'PERCENT' | 'FIXED';
  value: number;
  maxDiscount?: number;
  minOrderAmount: number;
  usageLimitTotal: number;
  usageLimitPerUser: number;
  startAt: string;
  endAt: string;
  isActive: boolean;
  audienceType: 'ALL' | 'RANK';
  rankIds: number[];
}

export interface VoucherFilters {
  name?: string;
  type?: 'PERCENT' | 'FIXED' | '';
  isActive?: boolean | null;
  audienceType?: 'ALL' | 'RANK' | '';
  sortBy?: 'createdAt' | 'updatedAt' | 'name' | 'value';
  sortDirection?: 'asc' | 'desc';
}

// Voucher state for Redux store
export interface VoucherState {
  vouchers: Voucher[];
  currentVoucher: Voucher | null;
  loading: boolean;
  error: string | null;
  pagination: {
    page: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
    hasNext: boolean;
    hasPrevious: boolean;
  };
  filters: VoucherFilters;
}
