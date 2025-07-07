import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';

export interface Address {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  country: string;
}

export interface OrderItem {
  id: string;
  variant_id: string;
  quantity: number;
  price: number;
  product_name: string;
  product_color: string;
  product_size: string;
  product_image: string;
}

export interface OrderStatusHistory {
  status: 'pending' | 'accepted';
  changed_at: string;
}

export interface Discount {
  id: string;
  code: string;
  percent: number;
  amount: number;
}

export interface Order {
  id: string;
  user_id: string;
  status: 'pending' | 'accepted';
  subtotal: number;
  discount_amount?: number;
  total: number;
  created_at: string;
  updated_at: string;
  items: OrderItem[];
  shipping_address: Address;
  user?: {
    id: string;
    email: string;
    first_name: string;
    last_name: string;
  };
  status_history: OrderStatusHistory[];
  discount?: Discount;
}

export interface CheckoutData {
  shipping_address_id: string;
  cart_id: string;
  promo_code?: string;
}

const axiosInstance = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

// =================== User ===================

export async function getUserOrders(): Promise<{ orders: Order[]; count: number }> {
  try {
    const response = await axiosInstance.get('/orders/user/me');
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to fetch user orders');
  }
}

export async function getOrderById(orderId: string): Promise<{ order: Order }> {
  try {
    const response = await axiosInstance.get(`/orders/${orderId}`);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to fetch order');
  }
}

export async function createOrder(checkoutData: CheckoutData): Promise<{ message: string; order: Order }> {
  try {
    const response = await axiosInstance.post('/orders', checkoutData);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to create order');
  }
}

// =================== Admin ===================

export async function getAllOrders(): Promise<{ orders: Order[]; count: number }> {
  try {
    const response = await axiosInstance.get('/orders');
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to fetch all orders');
  }
}

export async function updateOrderStatus(orderId: string, status: 'pending' | 'accepted'): Promise<{ message: string; order: Order }> {
  try {
    const response = await axiosInstance.patch(`/orders/${orderId}/status`, { status });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to update order status');
  }
}
