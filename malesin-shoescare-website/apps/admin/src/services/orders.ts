/**
 * Orders Service - handles order API calls against Express backend
 */

import api from '@/lib/api';
import type {
  Order,
  OrderFormData,
  ApiResponse,
  PaginatedData,
} from '@/types';

interface OrdersParams {
  status?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export const ordersService = {
  /**
   * Get all orders (paginated) — GET /orders
   */
  async getAll(params?: OrdersParams): Promise<PaginatedData<Order>> {
    const queryParams = new URLSearchParams();

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          queryParams.append(key, String(value));
        }
      });
    }

    const query = queryParams.toString();
    const endpoint = query ? `/orders?${query}` : '/orders';

    const response = await api.get<ApiResponse<PaginatedData<Order>>>(endpoint);
    return response.data;
  },

  /**
   * Create new order — POST /orders
   */
  async create(data: OrderFormData): Promise<Order> {
    const response = await api.post<ApiResponse<Order>>('/orders', data);
    return response.data;
  },

  /**
   * Update order status — PATCH /orders/:id/status
   */
  async updateStatus(id: number, status: string): Promise<Order> {
    const response = await api.patch<ApiResponse<Order>>(`/orders/${id}/status`, {
      status: status.toLowerCase(),
    });
    return response.data;
  },
};

export default ordersService;
