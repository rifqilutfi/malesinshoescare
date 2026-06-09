/**
 * Auth Service - handles authentication API calls (JWT)
 */

import api from '@/lib/api';
import type { AuthResponse, LoginCredentials, User } from '@/types';

export const authService = {
  /**
   * Login user — POST /auth/login
   */
  async login(credentials: LoginCredentials): Promise<{ user: User; token: string }> {
    const response = await api.post<AuthResponse>('/auth/login', credentials);

    if (response.data.token) {
      api.setToken(response.data.token);
    }

    return response.data;
  },

  /**
   * Logout — clear local token (no backend call needed)
   */
  logout(): void {
    api.setToken(null);
  },

  /**
   * Check if user is authenticated by verifying token exists
   */
  isAuthenticated(): boolean {
    return !!api.getToken();
  },

  /**
   * Get user info from JWT token payload (no API call needed)
   */
  getUserFromToken(): User | null {
    const token = api.getToken();
    if (!token) return null;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      // Check expiry
      if (payload.exp && payload.exp * 1000 < Date.now()) {
        api.setToken(null);
        return null;
      }
      return {
        id: payload.id,
        name: payload.name,
        email: payload.email,
      };
    } catch {
      api.setToken(null);
      return null;
    }
  },
};

export default authService;
