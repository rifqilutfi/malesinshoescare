/**
 * Reports Service - handles dashboard and reporting API calls
 */

import api from '@/lib/api';
import type { 
  DashboardStats, 
  RevenueData, 
  ServiceReport, 
  CustomerReport, 
  OperationalReport 
} from '@/types';

export const reportsService = {
  /**
   * Get dashboard stats
   */
  async getDashboardStats(): Promise<DashboardStats> {
    return api.get<DashboardStats>('/api/dashboard/stats');
  },

  /**
   * Get revenue report
   */
  async getRevenueReport(months?: number): Promise<RevenueData[]> {
    const endpoint = months ? `/api/reports/revenue?months=${months}` : '/api/reports/revenue';
    const response = await api.get<{ data: RevenueData[] }>(endpoint);
    return response.data;
  },

  /**
   * Get services popularity report
   */
  async getServicesReport(): Promise<ServiceReport[]> {
    const response = await api.get<{ data: ServiceReport[] }>('/api/reports/services');
    return response.data;
  },

  /**
   * Get customer metrics report
   */
  async getCustomersReport(): Promise<CustomerReport> {
    const response = await api.get<{ data: CustomerReport }>('/api/reports/customers');
    return response.data;
  },

  /**
   * Get operational efficiency report
   */
  async getOperationalReport(): Promise<OperationalReport> {
    const response = await api.get<{ data: OperationalReport }>('/api/reports/operational');
    return response.data;
  },
};

export default reportsService;
