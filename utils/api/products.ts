import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';

export interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  categoryId: string;
  gender?: 'men' | 'women' | 'unisex';
  isNew?: boolean;
  isFeatured?: boolean;
  isOnSale?: boolean;
  salePrice?: number;
  stock: number;
  images?: { id: string; imageUrl: string }[];
  sizes?: { id: string; size: string }[];
  colors?: { id: string; color: string }[];
}

export interface ProductFilters {
  category_id?: string;
  gender?: 'men' | 'women' | 'unisex';
  is_new?: boolean;
  is_featured?: boolean;
  is_on_sale?: boolean;
  min_price?: number;
  max_price?: number;
  query?: string;
  sort?: string;
}

const axiosInstance = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

// ✅ Use `/products/search` for filtering
export async function getProducts(filters: ProductFilters = {}) {
  try {
    const response = await axiosInstance.get('/products/search', { params: filters });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to fetch products');
  }
}

export async function getProductById(id: string) {
  try {
    const response = await axiosInstance.get(`/products/${id}`);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to fetch product');
  }
}

// Admin: Create product
export async function createProduct(data: Partial<Product>) {
  try {
    const response = await axiosInstance.post('/products', data);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to create product');
  }
}

// Admin: Update product
export async function updateProduct(id: string, data: Partial<Product>) {
  try {
    const response = await axiosInstance.put(`/products/${id}`, data);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to update product');
  }
}

// Admin: Delete product
export async function deleteProduct(id: string) {
  try {
    const response = await axiosInstance.delete(`/products/${id}`);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to delete product');
  }
}
