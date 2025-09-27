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

class CategoryApi {
  private readonly endpoint = '/categories';

  async getAllCategories(): Promise<ApiResponse<CategoryBackend[]>> {
    try {
      return await adminApiClient.get<CategoryBackend[]>(`${this.endpoint}`);
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
