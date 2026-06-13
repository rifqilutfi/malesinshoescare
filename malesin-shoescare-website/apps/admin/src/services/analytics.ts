/**
 * Analytics Service — handles analytics API calls
 */

import api from '@/lib/api';
import type { AnalyticsDashboard, ApiResponse } from '@/types';

export const analyticsService = {
  /**
   * Get dashboard data — GET /analytics/dashboard
   */
  async getDashboard(): Promise<AnalyticsDashboard> {
    const response = await api.get<ApiResponse<AnalyticsDashboard>>('/analytics/dashboard');
    return response.data;
  },
};

export default analyticsService;
