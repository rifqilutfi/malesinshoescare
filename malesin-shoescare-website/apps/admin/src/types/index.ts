/**
 * TypeScript interfaces for CleanStride API
 */

// User & Auth
export interface User {
  id: number;
  name: string;
  email: string;
  created_at: string;
  updated_at: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
}

export interface AuthResponse {
  message: string;
  user: User;
  token?: string;
}

// Service
export interface Service {
  id: number;
  name: string;
  description: string;
  price: number;
  price_formatted: string;
  duration: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ServiceFormData {
  name: string;
  description: string;
  price: number;
  duration: string;
  is_active?: boolean;
}

// Customer
export interface Customer {
  id: number;
  name: string;
  phone: string;
  address: string;
}

// Order Timeline
export interface TimelineStep {
  step: string;
  description: string;
  completed: boolean;
  completed_at: string | null;
}

// Order
export interface Order {
  id: number;
  order_number: string;
  customer: Customer;
  service: Service;
  shoe_type: string;
  quantity: number;
  notes: string | null;
  pickup_date: string;
  pickup_time: string;
  is_urgent: boolean;
  status: OrderStatus;
  progress: number;
  estimated_completion: string | null;
  subtotal: number;
  urgent_fee: number;
  total: number;
  total_formatted: string;
  timeline: TimelineStep[];
  photos?: OrderPhoto[];
  transaction?: Transaction;
  created_at: string;
  updated_at: string;
}

export type OrderStatus = 
  | 'pending'
  | 'pickup'
  | 'processing'
  | 'qc'
  | 'ready'
  | 'delivery'
  | 'completed'
  | 'cancelled';

export interface OrderFormData {
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
  is_urgent?: boolean;
}

export interface OrderPhoto {
  id: number;
  url: string;
  type: 'before' | 'after';
}

// Transaction
export interface Transaction {
  id: number;
  transaction_number: string;
  order_id: number;
  order?: {
    id: number;
    order_number: string;
    customer_name?: string;
  };
  amount: number;
  amount_formatted: string;
  method: PaymentMethod;
  method_label: string;
  status: TransactionStatus;
  paid_at: string | null;
  created_at: string;
}

export type PaymentMethod = 'cod' | 'transfer' | 'ewallet' | 'credit';
export type TransactionStatus = 'pending' | 'completed' | 'failed';

export interface TransactionFormData {
  order_id: number;
  method: PaymentMethod;
}

// Dashboard & Reports
export interface DashboardStats {
  today: {
    orders: number;
    revenue: number;
    orders_change: number;
    revenue_change: number;
  };
  processing_orders: number;
  active_customers: number;
}

export interface RevenueData {
  month: string;
  year: number;
  revenue: number;
  orders: number;
}

export interface ServiceReport {
  name: string;
  orders: number;
  revenue: number;
}

export interface CustomerReport {
  total: number;
  new: number;
  repeat: number;
  retention_rate: number;
}

export interface OperationalReport {
  completion_rate: number;
  cancelled_rate: number;
  total_orders: number;
  completed_orders: number;
}

// API Response wrappers
export interface ApiResponse<T> {
  message?: string;
  data: T;
}

export interface PaginatedResponse<T> {
  data: T[];
  links: {
    first: string;
    last: string;
    prev: string | null;
    next: string | null;
  };
  meta: {
    current_page: number;
    from: number;
    last_page: number;
    per_page: number;
    to: number;
    total: number;
  };
}
