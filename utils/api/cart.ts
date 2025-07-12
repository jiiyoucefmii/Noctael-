import axios from 'axios';

const API_URL = 'https://noctael.onrender.com'

export interface CartItem {
  id: string;
  variant_id: string;
  product_id: string;
  quantity: number;
  name: string;
  price: number;
  color?: string;
  size?: string;
  image?: string;
  item_total: number;
}

export interface Cart {
  cart_id: string;
  items: CartItem[];
  count: number;
  subtotal: number;
}

const axiosInstance = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

export async function getCart(): Promise<Cart> {
  try {
    const response = await axiosInstance.get('/cart');
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to fetch cart');
  }
}

export async function addToCart(variant_id: string, quantity: number = 1): Promise<{ message: string; cart_item: CartItem }> {
  try {
    const response = await axiosInstance.post('/cart/add', {
      variant_id,
      quantity,
    });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to add to cart');
  }
}

export async function updateCartItem(cart_item_id: string, quantity: number): Promise<{ message: string; cart_item: CartItem }> {
  try {
    const response = await axiosInstance.put(`/cart/${cart_item_id}`, { quantity });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to update cart item');
  }
}

export async function removeFromCart(cart_item_id: string): Promise<{ message: string; removed_id: string }> {
  try {
    const response = await axiosInstance.delete(`/cart/${cart_item_id}`);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to remove item from cart');
  }
}

export async function clearCart(): Promise<{ message: string }> {
  try {
    const response = await axiosInstance.delete('/cart/clear');
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to clear cart');
  }
}

export async function transferGuestCart(): Promise<{ message: string }> {
  try {
    const response = await axiosInstance.post('/cart/transfer');
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to transfer guest cart');
  }
}
