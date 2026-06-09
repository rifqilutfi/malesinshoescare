/**
 * TypeScript interfaces for CleanStride Express API
 * All fields use camelCase to match Prisma/Express response format.
 */

// User & Auth
export interface User {
  id: number;
  name: string;
  email: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    user: User;
    token: string;
  };
}

// Service
export interface Service {
  id: number;
  name: string;
  description: string;
  price: string; // Decimal comes as string from Prisma
  duration: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Customer
export interface Customer {
  id: number;
  name: string;
  phone: string;
  address: string | null;
  email: string | null;
  createdAt: string;
  updatedAt: string;
}

// Order Timeline
export interface TimelineStep {
  id: number;
  orderId: number;
  step: string;
  description: string;
  completed: boolean;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

// Order
export interface Order {
  id: number;
  orderNumber: string;
  customerId: number;
  serviceId: number;
  shoeType: string;
  quantity: number;
  notes: string | null;
  pickupDate: string;
  pickupTime: string;
  isUrgent: boolean;
  status: OrderStatus;
  progress: number;
  estimatedCompletion: string | null;
  subtotal: string;
  urgentFee: string;
  total: string;
  customer: Customer;
  service: Service;
  timeline: TimelineStep[];
  createdAt: string;
  updatedAt: string;
}

export type OrderStatus =
  | 'PENDING'
  | 'PICKUP'
  | 'PROCESSING'
  | 'QC'
  | 'READY'
  | 'DELIVERY'
  | 'COMPLETED'
  | 'CANCELLED';

export interface OrderFormData {
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

// API Response wrappers
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface PaginatedData<T> {
  orders: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
