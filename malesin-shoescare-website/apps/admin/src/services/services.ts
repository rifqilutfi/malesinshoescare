/**
 * Services Service - handles laundry service API calls
 */

import api from '@/lib/api';
import type { Service, ApiResponse } from '@/types';

export const servicesService = {
  /**
   * Get all active services — GET /services
   */
  async getAll(): Promise<Service[]> {
    const response = await api.get<ApiResponse<Service[]>>('/services');
    return response.data;
  },
};

export default servicesService;
