// Promotion interface for Admin panel
export interface Promotion {
  id: number;
  name: string;
  type: 'PERCENT';
  value: number;
  startAt: string;
  endAt: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Backend Promotion interface (from API response)
export interface BackendPromotion {
  id: number;
  name: string;
  type: 'PERCENT';
  value: number;
  startAt: string;
  endAt: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Promotion list response from API
export interface PromotionListResponse {
  items: BackendPromotion[];
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

// Request types
export interface GetPromotionsRequest {
  page?: number;
  pageSize?: number;
  name?: string;
  isActive?: boolean;
  type?: 'PERCENT';
  sortBy?: 'createdAt' | 'updatedAt' | 'name' | 'value';
  sortDirection?: 'asc' | 'desc';
}

export interface CreatePromotionRequest {
  name: string;
  type: 'PERCENT';
  value: number;
  startAt: string;
  endAt: string;
  isActive: boolean;
}

export interface UpdatePromotionRequest {
  name: string;
  type: 'PERCENT';
  value: number;
  startAt: string;
  endAt: string;
  isActive: boolean;
}

export interface PromotionFilters {
  name?: string;
  isActive?: boolean | null;
  type?: 'PERCENT' | '';
  sortBy?: 'createdAt' | 'updatedAt' | 'name' | 'value';
  sortDirection?: 'asc' | 'desc';
}
