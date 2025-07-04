import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';

export interface Order {
  id: string;
  userId: string;
  status: 'pending' | 'accepted';
  total: number;
  shippingAddressId: string;
  createdAt: string;
  updatedAt: string;
  items?: OrderItem[];
  shippingAddress?: {
    id: string;
    name: string;
    address: string;
    city: string;
    state: string;
    zip: string;
    country: string;
  };
}

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  quantity: number;
  size?: string;
  price: number;
  product?: {
    id: string;
    name: string;
    imageUrl?: string;
  };
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

export async function getUserOrders() {
  try {
    const response = await axiosInstance.get('/orders/user');
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to fetch user orders');
  }
}

export async function getOrderById(orderId: string) {
  try {
    const response = await axiosInstance.get(`/orders/${orderId}`);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to fetch order');
  }
}

export async function createOrder(checkoutData: CheckoutData) {
  try {
    const response = await axiosInstance.post('/orders', checkoutData);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to create order');
  }
}

// =================== Admin ===================

export async function getAllOrders() {
  try {
    const response = await axiosInstance.get('/orders');
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to fetch all orders');
  }
}

export async function updateOrderStatus(orderId: string, status: 'pending' | 'accepted') {
  try {
    const response = await axiosInstance.put(`/orders/${orderId}/status`, { status });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to update order status');
  }
}
