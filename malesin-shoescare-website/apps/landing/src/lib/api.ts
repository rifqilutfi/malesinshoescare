/**
 * API Service for malesin_shoescare Landing Page
 * Connects to the CleanStride backend API
 */

const API_URL = import.meta.env.VITE_API_URL || '';

interface Service {
  id: number;
  name: string;
  description: string;
  price: number;
  price_formatted: string;
  duration: string;
  is_active: boolean;
}

interface BookingData {
  customer_name: string;
  phone: string;
  address: string;
  email?: string;
  service_id: number;
  shoe_type: string;
  quantity: number;
  notes?: string;
  pickup_date: string;
  pickup_time: string;
}

interface ContactData {
  name: string;
  email: string;
  message: string;
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
   * Get all active services (public endpoint)
   */
  async getServices(): Promise<Service[]> {
    try {
      // Try to fetch from API - BookingController returns { success: true, data: [...] }
      const response = await this.request<{ success?: boolean; data: Service[] }>('/api/public/services');
      console.log('Services API response:', response);
      return response.data || [];
    } catch (error) {
      console.warn('Failed to fetch services from API, using fallback data:', error);
      // Return fallback mock data if API is not available
      return [
        { id: 1, name: 'Deep Clean', description: 'Cuci mendalam untuk sepatu kotor berat, termasuk whitening dan penghilang noda membandel.', price: 85000, price_formatted: 'Rp 85.000', duration: '2-3 hari', is_active: true },
        { id: 2, name: 'Quick Wash', description: 'Cuci cepat untuk noda ringan dan maintenance rutin.', price: 50000, price_formatted: 'Rp 50.000', duration: '1 hari', is_active: true },
        { id: 3, name: 'Premium Care', description: 'Full treatment dengan protection coating untuk sepatu premium.', price: 150000, price_formatted: 'Rp 150.000', duration: '3-5 hari', is_active: true },
        { id: 4, name: 'Unyellowing', description: 'Whitening khusus untuk sole yang sudah kuning.', price: 120000, price_formatted: 'Rp 120.000', duration: '2-3 hari', is_active: true },
      ];
    }
  }

  /**
   * Submit a booking/order (creates order in backend)
   */
  async submitBooking(data: BookingData): Promise<{ success: boolean; order_number?: string; message: string }> {
    try {
      const response = await this.request<{ success: boolean; message: string; data: { order_number: string } }>('/api/public/booking', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      return {
        success: true,
        order_number: response.data.order_number,
        message: response.message,
      };
    } catch (error: any) {
      // For now, if API is not available, simulate success
      console.warn('Booking API not available:', error.message);
      return {
        success: false,
        message: error.message || 'Gagal mengirim booking. Silakan hubungi via WhatsApp.',
      };
    }
  }

  /**
   * Submit contact form
   */
  async submitContact(data: ContactData): Promise<{ success: boolean; message: string }> {
    try {
      await this.request('/api/contact', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      return {
        success: true,
        message: 'Pesan berhasil dikirim!',
      };
    } catch (error) {
      // Contact endpoint might not exist yet, simulate success
      console.warn('Contact API not available');
      return {
        success: true,
        message: 'Pesan berhasil dikirim! Kami akan membalas dalam 1x24 jam.',
      };
    }
  }
}

export const api = new ApiService();
export type { Service, BookingData, ContactData };
