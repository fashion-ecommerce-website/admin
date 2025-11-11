import { adminApiClient } from './baseApi';
import { CommonEnumsResponse } from '@/types/common.types';

class CommonApi {
  /**
   * Get all common enums
   */
  async getEnums(): Promise<CommonEnumsResponse> {
    const response = await adminApiClient.get<CommonEnumsResponse>('/common/enums');
    return response.data as CommonEnumsResponse;
  }
}

export const commonApi = new CommonApi();
