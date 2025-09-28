import { adminApiClient } from './baseApi';
import type { ApiResponse } from './baseApi';

export interface CategoryBackend {
  id: number;
  name: string;
  slug: string;
  isActive: boolean;
  children: CategoryBackend[] | null;
}

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

export interface CategoryListResponse {
  items: CategoryBackend[];
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

export interface GetCategoriesRequest {
  page?: number;
  pageSize?: number;
  search?: string;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
}

class CategoryApi {
  private readonly endpoint = '/categories';

  async getAllCategories(params?: GetCategoriesRequest): Promise<ApiResponse<CategoryListResponse>> {
    try {
      const query = new URLSearchParams();
      if (params?.page !== undefined) query.append('page', String(params.page));
      if (params?.pageSize !== undefined) query.append('pageSize', String(params.pageSize));
      if (params?.search) query.append('search', params.search);
      if (params?.sortBy) query.append('sortBy', params.sortBy);
      if (params?.sortDirection) query.append('sortDirection', params.sortDirection);

      const suffix = query.toString() ? `?${query.toString()}` : '';
      return await adminApiClient.get<CategoryListResponse>(`${this.endpoint}${suffix}`);
    } catch (error) {
      return {
        success: false,
        data: null,
        message: error instanceof Error ? error.message : 'Failed to fetch categories',
      };
    }
  }

  async createCategory(categoryData: CreateCategoryRequest): Promise<ApiResponse<CategoryBackend>> {
    try {
      return await adminApiClient.post<CategoryBackend>(`${this.endpoint}`, categoryData);
    } catch (error) {
      return {
        success: false,
        data: null,
        message: error instanceof Error ? error.message : 'Failed to create category',
      };
    }
  }

  async updateCategory(categoryData: UpdateCategoryRequest): Promise<ApiResponse<CategoryBackend>> {
    try {
      const { id, ...updateData } = categoryData;
      return await adminApiClient.put<CategoryBackend>(`${this.endpoint}/${id}`, updateData);
    } catch (error) {
      return {
        success: false,
        data: null,
        message: error instanceof Error ? error.message : 'Failed to update category',
      };
    }
  }
}

export const categoryApi = new CategoryApi();
export default CategoryApi;
