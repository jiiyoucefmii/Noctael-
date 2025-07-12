import axios from 'axios';

const API_URL = 'https://noctael.onrender.com'

// Interfaces
export interface WishlistItem {
  wishlist_item_id: string;
  product_id: string;
  name: string;
  price: number;
  is_on_sale: boolean;
  sale_price?: number | null;
  description: string;
  image: string;
  added_at: string;
}

export interface WishlistResponse {
  count: number;
  items: WishlistItem[];
}

export interface AddWishlistResponse {
  message: string;
  item: WishlistItem;
}

export interface RemoveWishlistResponse {
  message: string;
}

export interface ClearWishlistResponse {
  message: string;
  count: number;
  items: WishlistItem[];
}

export interface CheckWishlistResponse {
  inWishlist: boolean;
  wishlist_item_id?: string | null;
}

// API Functions

export async function getWishlist(): Promise<WishlistResponse> {
  const res = await axios.get(`${API_URL}/wishlist`, { withCredentials: true });
  return res.data;
}

export async function addToWishlist(product_id: string): Promise<AddWishlistResponse> {
  const res = await axios.post(
    `${API_URL}/wishlist/add`,
    { product_id },
    { withCredentials: true }
  );
  return res.data;
}

export async function removeFromWishlist(wishlist_item_id: string): Promise<RemoveWishlistResponse> {
  const res = await axios.delete(`${API_URL}/wishlist/${wishlist_item_id}`, {
    withCredentials: true,
  });
  return res.data;
}

export async function checkWishlistItem(product_id: string): Promise<CheckWishlistResponse> {
  const res = await axios.get(`${API_URL}/wishlist/check/${product_id}`, {
    withCredentials: true,
  });
  return res.data;
}

export async function clearWishlist(): Promise<ClearWishlistResponse> {
  const res = await axios.delete(`${API_URL}/wishlist/clear`, {
    withCredentials: true,
  });
  return res.data;
}
