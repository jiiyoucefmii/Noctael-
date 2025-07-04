import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';

export interface CartItem {
  id: string;
  productId: string;
  quantity: number;
  size?: string;
  color?: string;
  product?: {
    id: string;
    name: string;
    price: number;
    salePrice?: number;
    imageUrl?: string;
  };
}

// Use shared axios instance for credentials/session-based auth
const axiosInstance = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

export async function getCart() {
  try {
    const response = await axiosInstance.get('/cart');
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to fetch cart');
  }
}

export async function addToCart(productId: string, quantity: number, size?: string, color?: string) {
  try {
    const response = await axiosInstance.post('/cart/add', {
      product_id: productId,
      quantity,
      size,
      color,
    });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to add to cart');
  }
}

export async function updateCartItem(cartItemId: string, quantity: number) {
  try {
    const response = await axiosInstance.put(`/cart/items/${cartItemId}`, { quantity });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to update cart item');
  }
}

export async function removeFromCart(cartItemId: string) {
  try {
    const response = await axiosInstance.delete(`/cart/items/${cartItemId}`);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to remove from cart');
  }
}

export async function clearCart() {
  try {
    const response = await axiosInstance.delete('/cart/clear');
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to clear cart');
  }
}

export async function mergeCart() {
  try {
    const response = await axiosInstance.post('/cart/merge');
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to merge cart');
  }
}
