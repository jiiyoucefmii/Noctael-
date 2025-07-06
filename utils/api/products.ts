import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';

export interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  categoryId: string;
  category_name: string;
  gender?: "men" | "women" | "unisex";
  isNew: boolean;
  isFeatured: boolean;
  isOnSale: boolean;
  salePrice?: number;
  stock: number;
  images: string[];
  sizes?: string[];
  colors?: string[];
  createdAt: string;
  updatedAt: string;
}


export interface ProductsResponse {
  products: Product[];
  count: number;
}

export interface ProductResponse {
  product: Product;
}

export interface ProductsQueryParams {
  category?: string;
  gender?: string;
  featured?: boolean;
  new?: boolean;
  onSale?: boolean;
  sort?: string;
  limit?: number;
  page?: number;
}

const axiosInstance = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

export async function getProducts(params?: ProductsQueryParams): Promise<Product[]> {
  try {
    // Convert filter parameters to match the API's expected format
    const apiParams: Record<string, any> = {};
    
    if (params) {
      // Map our frontend filter params to API params
      if (params.category) apiParams.category_id = params.category;
      if (params.gender) apiParams.gender = params.gender;
      if (params.new) apiParams.is_new = params.new;
      if (params.onSale) apiParams.is_on_sale = params.onSale;
      if (params.featured) apiParams.is_featured = params.featured;
      if (params.sort) apiParams.sort = params.sort;
      if (params.limit) apiParams.limit = params.limit;
      if (params.page) apiParams.page = params.page;
    }
    
    console.log('API request params:', apiParams);
    
    const response = await axiosInstance.get<ProductsResponse>('/products', { 
      params: apiParams
    });
    
    // Handle both possible API response structures
    const products = response.data.products || response.data;
    return Array.isArray(products) ? products : [];
    
  } catch (error: any) {
    console.error("Error fetching products:", error);
    throw new Error(error.response?.data?.message || 'Failed to fetch products');
  }
}

export async function getProductById(id: string): Promise<Product> {
  try {
    const response = await axiosInstance.get<ProductResponse>(`/products/${id}`);
    return response.data.product;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to fetch product');
  }
}

export async function getProductsByCategory(category: string): Promise<Product[]> {
  try {
    const response = await axiosInstance.get<ProductsResponse>('/products', {
      params: { category }
    });
    return response.data.products;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to fetch products by category');
  }
}

export async function getFeaturedProducts(limit = 4): Promise<Product[]> {
  try {
    const response = await axiosInstance.get<ProductsResponse>('/products', { 
      params: { featured: true, limit }
    });
    return response.data.products;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to fetch featured products');
  }
}

// Admin endpoints
export async function createProduct(productData: Partial<Product>) {
  try {
    const response = await axiosInstance.post('/products', productData);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to create product');
  }
}

export async function updateProduct(id: string, productData: Partial<Product>) {
  try {
    const response = await axiosInstance.put(`/products/${id}`, productData);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to update product');
  }
}

export async function deleteProduct(id: string) {
  try {
    const response = await axiosInstance.delete(`/products/${id}`);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to delete product');
  }
}
