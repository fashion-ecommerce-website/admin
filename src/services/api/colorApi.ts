import { adminApiClient, ApiResponse } from './baseApi';

export interface Color {
  id: number;
  name: string;
  hexCode?: string;
  isActive?: boolean;
}

export interface GetColorsRequest {
  page?: number;
  pageSize?: number;
  name?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}

export interface ColorListResponse extends PaginatedResponse<Color> { }

export interface CreateColorRequest {
  name: string;
  hexCode?: string;
}

export interface UpdateColorRequest extends CreateColorRequest { }

export const colorApi = {
  async getAllColors(_params: GetColorsRequest): Promise<ApiResponse<ColorListResponse>> {
    try {
      const response = await adminApiClient.get<Array<{ id: number; name: string; hex?: string; isActive: boolean }>>(`/colors`);
      if (response.success && response.data) {
        const all = (response.data || []).map((c) => ({
          id: c.id,
          name: c.name,
          hexCode: c.hex, // Map 'hex' from backend to 'hexCode'
          isActive: c.isActive,
        }));
        const list: ColorListResponse = {
          items: all,
          page: 1,
          pageSize: all.length,
          totalItems: all.length,
          totalPages: 1,
        };
        return { success: true, data: list, message: response.message };
      }
      return { success: false, data: null, message: response.message || 'Failed to fetch colors' };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch colors';
      return { success: false, data: null, message };
    }
  },

  async createColor(body: CreateColorRequest): Promise<ApiResponse<Color>> {
    try {
      const payload = { name: body.name, hex: body.hexCode }; // Map hexCode to hex for backend
      const response = await adminApiClient.post<{ id: number; name: string; hex?: string; isActive: boolean }>(`/colors`, payload as unknown as Record<string, unknown>);
      if (response.success && response.data) {
        const c = response.data;
        return { success: true, data: { id: c.id, name: c.name, hexCode: c.hex, isActive: c.isActive }, message: response.message };
      }
      return { success: false, data: null, message: response.message || 'Create color failed' };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Create color failed';
      return { success: false, data: null, message };
    }
  },

  async updateColor(id: number, body: UpdateColorRequest): Promise<ApiResponse<Color>> {
    try {
      const payload = { name: body.name, hex: body.hexCode }; // Map hexCode to hex for backend
      const response = await adminApiClient.put<{ id: number; name: string; hex?: string; isActive: boolean }>(`/colors/${id}`, payload as unknown as Record<string, unknown>);
      if (response.success && response.data) {
        const c = response.data;
        return { success: true, data: { id: c.id, name: c.name, hexCode: c.hex, isActive: c.isActive }, message: response.message };
      }
      return { success: false, data: null, message: response.message || 'Update color failed' };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Update color failed';
      return { success: false, data: null, message };
    }
  },

  async toggleColorStatus(id: number): Promise<ApiResponse<null>> {
    try {
      const response = await adminApiClient.patch<null>(`/colors/toggle/${id}`);
      return { success: response.success, data: null, message: response.message };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Toggle color status failed';
      return { success: false, data: null, message };
    }
  },

  async deleteColor(id: number): Promise<ApiResponse<null>> {
    try {
      const response = await adminApiClient.delete<null>(`/colors/${id}`);
      return { success: response.success, data: null, message: response.message };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Delete color failed';
      return { success: false, data: null, message };
    }
  },
};

export default colorApi;