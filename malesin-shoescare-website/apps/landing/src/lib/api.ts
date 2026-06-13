/**
 * API Service for CleanStride Landing Page
 * Connects to the Express backend API
 */

const API_URL = import.meta.env.VITE_API_URL || '';

export interface Service {
  id: number;
  name: string;
  description: string;
  price: string;
  duration: string;
  isActive: boolean;
  categoryId: number | null;
  imageUrl: string | null;
  category: Category | null;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: number;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface BookingData {
  customerName: string;
  phone: string;
  address?: string;
  email?: string;
  serviceId: number;
  shoeType: string;
  quantity: number;
  notes?: string;
  pickupDate: string;
  pickupTime: string;
  isUrgent?: boolean;
}

export interface TrackingData {
  orderNumber: string;
  status: string;
  progress: number;
  shoeType: string;
  service: {
    name: string;
    description: string;
  };
  isUrgent: boolean;
  estimatedCompletion: string | null;
  total: string;
  timeline: {
    id: number;
    orderId: number;
    step: string;
    description: string;
    completed: boolean;
    completedAt: string | null;
    createdAt: string;
    updatedAt: string;
  }[];
  createdAt: string;
}

export interface AIRecommendation {
  recommendedService: string;
  estimatedDuration: string;
  estimatedPrice: number;
  reason: string;
}

export interface AIImageAnalysis {
  recommendedService: string;
  condition: string;
  explanation: string;
  confidence: number;
}

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

class ApiService {
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = endpoint.startsWith('/') ? `${API_URL}${endpoint}` : `${API_URL}/${endpoint}`;

    const config: RequestInit = {
      ...options,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        ...options.headers,
      },
    };

    const response = await fetch(url, config);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'API request failed');
    }

    return data;
  }

  /**
   * Get all active services — GET /services
   */
  async getServices(): Promise<Service[]> {
    try {
      const response = await this.request<ApiResponse<Service[]>>('/services');
      return response.data || [];
    } catch (error) {
      console.warn('Failed to fetch services from API, using fallback data:', error);
      return [
        { id: 1, name: 'Quick Clean', description: 'Pembersihan cepat untuk sepatu yang tidak terlalu kotor. Cocok untuk perawatan rutin.', price: '25000', duration: '1 Day', isActive: true, categoryId: null, imageUrl: null, category: null, createdAt: '', updatedAt: '' },
        { id: 2, name: 'Regular Wash', description: 'Pencucian standar dengan deep cleaning untuk sepatu sehari-hari. Termasuk pengeringan.', price: '45000', duration: '2-3 Days', isActive: true, categoryId: null, imageUrl: null, category: null, createdAt: '', updatedAt: '' },
        { id: 3, name: 'Deep Clean', description: 'Pencucian mendalam untuk noda membandel. Termasuk treatment khusus untuk material sensitif.', price: '75000', duration: '3-5 Days', isActive: true, categoryId: null, imageUrl: null, category: null, createdAt: '', updatedAt: '' },
        { id: 4, name: 'Premium Care', description: 'Layanan premium lengkap: deep clean, deodorizing, waterproofing, dan sole restoration.', price: '120000', duration: '5-7 Days', isActive: true, categoryId: null, imageUrl: null, category: null, createdAt: '', updatedAt: '' },
      ];
    }
  }

  /**
   * Get all categories — GET /services/categories
   */
  async getCategories(): Promise<Category[]> {
    try {
      const response = await this.request<ApiResponse<Category[]>>('/services/categories');
      return response.data || [];
    } catch (error) {
      console.warn('Failed to fetch categories:', error);
      return [];
    }
  }

  /**
   * Submit a booking/order — POST /orders
   */
  async submitBooking(data: BookingData): Promise<{ success: boolean; orderNumber?: string; message: string }> {
    try {
      const response = await this.request<ApiResponse<{ orderNumber: string }>>('/orders', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      return {
        success: true,
        orderNumber: response.data.orderNumber,
        message: response.message,
      };
    } catch (error: any) {
      console.warn('Booking API error:', error.message);
      return {
        success: false,
        message: error.message || 'Gagal mengirim booking. Silakan hubungi via WhatsApp.',
      };
    }
  }

  /**
   * Track order by code — GET /track/:orderCode
   */
  async trackOrder(orderCode: string): Promise<TrackingData | null> {
    try {
      const response = await this.request<ApiResponse<TrackingData>>(`/track/${orderCode}`);
      return response.data;
    } catch (error) {
      console.warn('Tracking API error:', error);
      return null;
    }
  }

  /**
   * Get AI recommendation (text-based) — POST /ai/recommend
   */
  async getRecommendation(material: string, condition: string): Promise<AIRecommendation | null> {
    try {
      const response = await this.request<ApiResponse<AIRecommendation>>('/ai/recommend', {
        method: 'POST',
        body: JSON.stringify({ material, condition }),
      });
      return response.data;
    } catch (error) {
      console.warn('AI recommendation error:', error);
      return null;
    }
  }

  /**
   * Analyze shoe image with AI — POST /ai/analyze
   * Uses FormData (no JSON Content-Type header so browser sets multipart boundary)
   */
  async analyzeShoeImage(file: File): Promise<AIImageAnalysis | null> {
    try {
      const formData = new FormData();
      formData.append('image', file);

      const url = `${API_URL}/ai/analyze`;
      const response = await fetch(url, {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Image analysis failed');
      }

      return (data as ApiResponse<AIImageAnalysis>).data;
    } catch (error) {
      console.warn('AI image analysis error:', error);
      return null;
    }
  }
}

export const api = new ApiService();
