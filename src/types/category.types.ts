// Category interface
export interface Category {
  id: number;
  name: string;
  slug: string;
  isActive: boolean;
  children: Category[] | null;
}

// Backend Category interface (from API response)
export interface BackendCategory {
  id: number;
  name: string;
  slug: string;
  isActive: boolean;
  children: BackendCategory[] | null;
}

// Request types
export interface CreateCategoryRequest {
  name: string;
  slug: string;
  parentId: number | null;
}

export interface UpdateCategoryRequest {
  id: number;
  name: string;
  slug: string;
  parentId: number | null;
}

export interface CategoryFilters {
  search?: string;
}
