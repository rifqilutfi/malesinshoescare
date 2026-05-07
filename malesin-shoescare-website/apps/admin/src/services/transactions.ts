/**
 * Transactions Service - handles payment API calls
 */

import api from '@/lib/api';
import type { Transaction, TransactionFormData, ApiResponse, PaginatedResponse, TransactionStatus, PaymentMethod } from '@/types';

interface TransactionsParams {
  status?: TransactionStatus;
  method?: PaymentMethod;
  date?: string;
  per_page?: number;
  page?: number;
}

export const transactionsService = {
  /**
   * Get all transactions (paginated)
   */
  async getAll(params?: TransactionsParams): Promise<PaginatedResponse<Transaction>> {
    const queryParams = new URLSearchParams();
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, String(value));
        }
      });
    }
    
    const query = queryParams.toString();
    const endpoint = query ? `/api/transactions?${query}` : '/api/transactions';
    
    return api.get<PaginatedResponse<Transaction>>(endpoint);
  },

  /**
   * Get single transaction by ID
   */
  async getById(id: number): Promise<Transaction> {
    const response = await api.get<{ data: Transaction }>(`/api/transactions/${id}`);
    return response.data;
  },

  /**
   * Create payment transaction
   */
  async create(data: TransactionFormData): Promise<ApiResponse<Transaction>> {
    return api.post<ApiResponse<Transaction>>('/api/transactions', data);
  },
};

export default transactionsService;
