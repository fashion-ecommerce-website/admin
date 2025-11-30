import { adminApiClient, ApiResponse } from './baseApi';
import type { PaginatedResponse } from '../../types/common.types';

export interface Size {
  id: number;
  code: string;
  label?: string;
  isActive?: boolean;
}

export interface GetSizesRequest {
  page?: number;
  pageSize?: number;
  codeOrLabel?: string;
}

export type SizeListResponse = PaginatedResponse<Size>;

export interface CreateSizeRequest {
  code: string;
  label?: string;
}

export type UpdateSizeRequest = CreateSizeRequest;

export const sizeApi = {
  async getAllSizes(): Promise<ApiResponse<SizeListResponse>> {
    try {
      const response = await adminApiClient.get<Array<{ id: number; code: string; label?: string; isActive: boolean }>>(`/sizes`);
      if (response.success && response.data) {
        const all = (response.data || []).map((s) => ({
          id: s.id,
          code: s.code,
          label: s.label,
          isActive: s.isActive,
        }));
        const list: SizeListResponse = {
          items: all,
          page: 1,
          pageSize: all.length,
          totalItems: all.length,
          totalPages: 1,
        };
        return { success: true, data: list, message: response.message };
      }
      return { success: false, data: null, message: response.message || 'Failed to fetch sizes' };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch sizes';
      return { success: false, data: null, message };
    }
  },

  async createSize(body: CreateSizeRequest): Promise<ApiResponse<Size>> {
    try {
      const response = await adminApiClient.post<{ id: number; code: string; label?: string; isActive: boolean }>(`/sizes`, body as unknown as Record<string, unknown>);
      if (response.success && response.data) {
        const s = response.data;
        return { success: true, data: { id: s.id, code: s.code, label: s.label, isActive: s.isActive }, message: response.message };
      }
      return { success: false, data: null, message: response.message || 'Create size failed' };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Create size failed';
      return { success: false, data: null, message };
    }
  },

  async updateSize(id: number, body: UpdateSizeRequest): Promise<ApiResponse<Size>> {
    try {
      const response = await adminApiClient.put<{ id: number; code: string; label?: string; isActive: boolean }>(`/sizes/${id}`, body as unknown as Record<string, unknown>);
      if (response.success && response.data) {
        const s = response.data;
        return { success: true, data: { id: s.id, code: s.code, label: s.label, isActive: s.isActive }, message: response.message };
      }
      return { success: false, data: null, message: response.message || 'Update size failed' };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Update size failed';
      return { success: false, data: null, message };
    }
  },

  async toggleSizeStatus(id: number): Promise<ApiResponse<null>> {
    try {
      const response = await adminApiClient.patch<null>(`/sizes/toggle/${id}`);
      return { success: response.success, data: null, message: response.message };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Toggle size status failed';
      return { success: false, data: null, message };
    }
  },

  async deleteSize(id: number): Promise<ApiResponse<null>> {
    try {
      const response = await adminApiClient.delete<null>(`/sizes/${id}`);
      return { success: response.success, data: null, message: response.message };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Delete size failed';
      return { success: false, data: null, message };
    }
  },
};

export default sizeApi;