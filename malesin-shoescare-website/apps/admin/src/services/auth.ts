/**
 * Auth Service - handles authentication API calls (token-based)
 */

import api from '@/lib/api';
import type { AuthResponse, LoginCredentials, RegisterData, User } from '@/types';

export const authService = {
  /**
   * Login user
   */
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/api/login', credentials);
    
    // Save token for subsequent requests
    if (response.token) {
      api.setToken(response.token);
    }
    
    return response;
  },

  /**
   * Register new user
   */
  async register(data: RegisterData): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/api/register', data);
    
    if (response.token) {
      api.setToken(response.token);
    }
    
    return response;
  },

  /**
   * Logout current user
   */
  async logout(): Promise<void> {
    try {
      await api.post('/api/logout');
    } catch (e) {
      // Ignore logout errors
    }
    api.setToken(null);
  },

  /**
   * Get current authenticated user
   */
  async getUser(): Promise<User> {
    return api.get<User>('/api/user');
  },

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return !!api.getToken();
  },
};

export default authService;
