// Promotion Target types
export type PromotionTargetType = 'PRODUCT' | 'CATEGORY' | 'SKU';

// Inline target in promotion list response
export interface PromotionTarget {
  targetType: PromotionTargetType;
  targetId: number;
  targetName?: string;
}

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
  targets: PromotionTarget[];
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
  targets: PromotionTarget[];
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
  targets?: PromotionTarget[];
}

export interface UpdatePromotionRequest {
  name: string;
  type: 'PERCENT';
  value: number;
  startAt: string;
  endAt: string;
  isActive: boolean;
  targets?: PromotionTarget[];
}

export interface PromotionFilters {
  name?: string;
  isActive?: boolean | null;
  type?: 'PERCENT' | '';
  sortBy?: 'createdAt' | 'updatedAt' | 'name' | 'value';
  sortDirection?: 'asc' | 'desc';
}

export interface PromotionTargetItem {
  targetType: PromotionTargetType;
  targetId: number;
}

export interface UpsertTargetsRequest {
  items: PromotionTargetItem[];
}

export interface TargetsUpsertResult {
  added: number;
  skipped: number;
}

export interface PromotionTargetResponse {
  id: number;
  targetType: PromotionTargetType;
  targetId: number;
  targetName?: string;
}

export interface PromotionTargetsListResponse {
  items: PromotionTargetResponse[];
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}
