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
  product_color?: string;
  product_size?: string;
  product_image?: string;
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
  is_discount?: boolean;
  discounted_total?: number;
}

const axiosInstance = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});






// Add this interface for UserStatistics
interface UserStatistics {
  user_info: {
    id: string
    email: string
    first_name: string
    last_name: string
    phone_number: string
    created_at: string
    is_verified: boolean
  }
  order_statistics: {
    total_orders: number  
    total_spent: number   
    average_order_value: number  
    first_order_date: string
    last_order_date: string
    pending_orders: number  
    accepted_orders: number  
    monthly_spending: Array<{
      month: string
      order_count: number  
      total_spent: number  
    }>
    favorite_categories: Array<{
      category_name: string
      items_ordered: number  
      total_quantity: number  
    }>
  }
  recent_orders: Order[]
  wishlist_items: number  
  cart_items: number  
  saved_addresses: number  
}

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

export async function getOrdersByUserId(
  userId: string,
  options?: {
    page?: number;
    limit?: number;
    status?: 'pending' | 'accepted';
  }
): Promise<{
  user_id: string;
  orders: Order[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
  };
}> {
  try {
    const params = new URLSearchParams();
    if (options?.page) params.append('page', options.page.toString());
    if (options?.limit) params.append('limit', options.limit.toString());
    if (options?.status) params.append('status', options.status);

    const response = await axiosInstance.get(`/orders/user/${userId}?${params.toString()}`);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to fetch user orders');
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


export async function getUserStatistics(userId: string): Promise<UserStatistics> {
  try {
    const response = await axiosInstance.get(`/orders/user/${userId}/statistics`);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to fetch user statistics');
  }
}