/**
 * Orders Service - handles order API calls
 */

import api from '@/lib/api';
import type { 
  Order, 
  OrderFormData, 
  OrderStatus,
  ApiResponse, 
  PaginatedResponse 
} from '@/types';

interface OrdersParams {
  status?: OrderStatus;
  from?: string;
  to?: string;
  search?: string;
  limit?: number;
  per_page?: number;
  page?: number;
}

export const ordersService = {
  /**
   * Get all orders (paginated)
   */
  async getAll(params?: OrdersParams): Promise<PaginatedResponse<Order>> {
    const queryParams = new URLSearchParams();
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, String(value));
        }
      });
    }
    
    const query = queryParams.toString();
    const endpoint = query ? `/api/orders?${query}` : '/api/orders';
    
    return api.get<PaginatedResponse<Order>>(endpoint);
  },

  /**
   * Get single order by ID
   */
  async getById(id: number): Promise<Order> {
    const response = await api.get<{ data: Order }>(`/api/orders/${id}`);
    return response.data;
  },

  /**
   * Get order by order number
   */
  async getByOrderNumber(orderNumber: string): Promise<Order | null> {
    const result = await this.getAll({ search: orderNumber });
    return result.data.find(o => o.order_number === orderNumber) || null;
  },

  /**
   * Create new order
   */
  async create(data: OrderFormData): Promise<ApiResponse<Order>> {
    return api.post<ApiResponse<Order>>('/api/orders', data);
  },

  /**
   * Update order
   */
  async update(id: number, data: Partial<OrderFormData>): Promise<ApiResponse<Order>> {
    return api.put<ApiResponse<Order>>(`/api/orders/${id}`, data);
  },

  /**
   * Update order status
   */
  async updateStatus(id: number, status: OrderStatus): Promise<ApiResponse<Order>> {
    return api.patch<ApiResponse<Order>>(`/api/orders/${id}/status`, { status });
  },

  /**
   * Delete order
   */
  async delete(id: number): Promise<void> {
    await api.delete(`/api/orders/${id}`);
  },

  /**
   * Upload photo for an order
   */
  async uploadPhoto(orderId: number, file: File, type: 'before' | 'after' = 'before'): Promise<{ url: string }> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('order_id', String(orderId));
    formData.append('type', type);
    
    const response = await api.upload<{ data: { url: string } }>('/api/upload', formData);
    return response.data;
  },
};

export default ordersService;
