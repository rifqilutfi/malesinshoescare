/**
 * Services Service — handles laundry service CRUD API calls
 */

import api from '@/lib/api';
import type { Service, Category, ApiResponse } from '@/types';

export const servicesService = {
  /**
   * Get all active services (public) — GET /services
   */
  async getAll(): Promise<Service[]> {
    const response = await api.get<ApiResponse<Service[]>>('/services');
    return response.data;
  },

  /**
   * Get all services including inactive (admin) — GET /services/admin
   */
  async getAllAdmin(): Promise<Service[]> {
    const response = await api.get<ApiResponse<Service[]>>('/services/admin');
    return response.data;
  },

  /**
   * Get all categories — GET /services/categories
   */
  async getCategories(): Promise<Category[]> {
    const response = await api.get<ApiResponse<Category[]>>('/services/categories');
    return response.data;
  },

  /**
   * Create a new service — POST /services (FormData for image upload)
   */
  async create(data: {
    name: string;
    description: string;
    price: number;
    duration: string;
    categoryId?: number | null;
    isActive?: boolean;
    image?: File | null;
  }): Promise<Service> {
    const formData = new FormData();
    formData.append('name', data.name);
    formData.append('description', data.description);
    formData.append('price', String(data.price));
    formData.append('duration', data.duration);
    if (data.categoryId) formData.append('categoryId', String(data.categoryId));
    formData.append('isActive', String(data.isActive ?? true));
    if (data.image) formData.append('image', data.image);

    const response = await api.postForm<ApiResponse<Service>>('/services', formData);
    return response.data;
  },

  /**
   * Update a service — PUT /services/:id (FormData for image upload)
   */
  async update(id: number, data: {
    name: string;
    description: string;
    price: number;
    duration: string;
    categoryId?: number | null;
    isActive?: boolean;
    image?: File | null;
  }): Promise<Service> {
    const formData = new FormData();
    formData.append('name', data.name);
    formData.append('description', data.description);
    formData.append('price', String(data.price));
    formData.append('duration', data.duration);
    if (data.categoryId) formData.append('categoryId', String(data.categoryId));
    formData.append('isActive', String(data.isActive ?? true));
    if (data.image) formData.append('image', data.image);

    const response = await api.putForm<ApiResponse<Service>>(`/services/${id}`, formData);
    return response.data;
  },

  /**
   * Toggle service active status — PATCH /services/:id/toggle
   */
  async toggleActive(id: number): Promise<Service> {
    const response = await api.patch<ApiResponse<Service>>(`/services/${id}/toggle`);
    return response.data;
  },

  /**
   * Delete a service — DELETE /services/:id
   */
  async delete(id: number): Promise<void> {
    await api.delete<ApiResponse<null>>(`/services/${id}`);
  },
};

export default servicesService;
