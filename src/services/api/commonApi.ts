import { adminApiClient } from './baseApi';
import { CommonEnumsResponse } from '@/types/common.types';
import { colorApi } from './colorApi';
import { sizeApi } from './sizeApi';

class CommonApi {
  /**
   * Get all common enums including colors and sizes
   */
  async getEnums(): Promise<CommonEnumsResponse> {
    const response = await adminApiClient.get<CommonEnumsResponse>('/common/enums');
    const enumsData = response.data as CommonEnumsResponse;
    
    // Fetch colors and sizes in parallel
    const [colorsResponse, sizesResponse] = await Promise.all([
      colorApi.getAllColors(),
      sizeApi.getAllSizes()
    ]);
    
    // Add colors and sizes to the enums response
    if (colorsResponse.success && colorsResponse.data) {
      enumsData.colors = colorsResponse.data.items;
      console.log('🎨 Loaded colors in enums:', enumsData.colors.length, 'items');
    }
    if (sizesResponse.success && sizesResponse.data) {
      enumsData.sizes = sizesResponse.data.items;
      console.log('📏 Loaded sizes in enums:', enumsData.sizes.length, 'items');
    }
    
    return enumsData;
  }
}

export const commonApi = new CommonApi();
