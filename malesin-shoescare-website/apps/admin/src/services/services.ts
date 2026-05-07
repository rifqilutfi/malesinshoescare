/**
 * Services Service - handles laundry service API calls
 */

import api from '@/lib/api';
import type { Service, ServiceFormData, ApiResponse } from '@/types';

interface ServicesResponse {
  data: Service[];
}

export const servicesService = {
  /**
   * Get all services
   */
  async getAll(activeOnly?: boolean): Promise<Service[]> {
    const endpoint = activeOnly !== undefined 
      ? `/api/services?active=${activeOnly}` 
      : '/api/services';
    
    const response = await api.get<ServicesResponse>(endpoint);
    return response.data;
  },

  /**
   * Get single service by ID
   */
  async getById(id: number): Promise<Service> {
    const response = await api.get<{ data: Service }>(`/api/services/${id}`);
    return response.data;
  },

  /**
   * Create new service
   */
  async create(data: ServiceFormData): Promise<ApiResponse<Service>> {
    return api.post<ApiResponse<Service>>('/api/services', data);
  },

  /**
   * Update service
   */
  async update(id: number, data: Partial<ServiceFormData>): Promise<ApiResponse<Service>> {
    return api.put<ApiResponse<Service>>(`/api/services/${id}`, data);
  },

  /**
   * Toggle service active status
   */
  async toggle(id: number): Promise<ApiResponse<Service>> {
    return api.patch<ApiResponse<Service>>(`/api/services/${id}/toggle`);
  },

  /**
   * Delete service
   */
  async delete(id: number): Promise<void> {
    await api.delete(`/api/services/${id}`);
  },
};

export default servicesService;
