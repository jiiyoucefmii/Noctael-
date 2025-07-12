// lib/api/products.ts

import axios from 'axios';

const API_URL = 'https://noctael.onrender.com'

export interface ProductVariant {
  id?: string;
  product_id?: string;
  color: string;
  size: string;
  price: number;
  sale_price?: number;
  stock: number;
  images?: ProductImage[];
}

export interface ProductImage {
  image_url: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  category_id: string;
  category_name: string;
  gender: "men" | "women" | "unisex";
  is_new: boolean;
  is_featured: boolean;
  is_on_sale: boolean;
  created_at: string;
  updated_at: string;
  variants: ProductVariant[];
  colors: string[];
  sizes: string[];
  main_image: string;
}

export interface ProductsResponse {
  products: Product[];
  count: number;
}

export interface ProductResponse {
  product: Product;
}

export interface ProductsQueryParams {
  query?: string;
  category_id?: string;
  gender?: string;
  min_price?: number;
  max_price?: number;
  is_new?: boolean;
  is_featured?: boolean;
  is_on_sale?: boolean;
  sort?: string;
  limit?: number;
  page?: number;
}

const axiosInstance = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

// --- Products ---

export async function getProducts(): Promise<Product[]> {
  const res = await axiosInstance.get<ProductsResponse>('/products');
  return res.data.products;
}

export async function searchProducts(params: ProductsQueryParams): Promise<Product[]> {
  const res = await axiosInstance.get<ProductsResponse>('/products/search', { params });
  return res.data.products;
}

export async function getProductById(id: string): Promise<Product> {
  const res = await axiosInstance.get<ProductResponse>(`/products/${id}`);
  return res.data.product;
}

export async function createProduct(productData: Partial<Product>) {
  const res = await axiosInstance.post('/products', productData);
  return res.data;
}

export async function updateProduct(id: string, productData: Partial<Product>) {
  const res = await axiosInstance.put(`/products/${id}`, productData);
  return res.data;
}

export async function deleteProduct(id: string) {
  const res = await axiosInstance.delete(`/products/${id}`);
  return res.data;
}

// --- Product Variants ---

export async function getProductVariants(productId: string): Promise<ProductVariant[]> {
  const res = await axiosInstance.get<{ variants: ProductVariant[] }>(`/products/${productId}/variants`);
  return res.data.variants;
}

export async function addProductVariant(productId: string, variantData: Omit<ProductVariant, 'id' | 'product_id'>) {
  const res = await axiosInstance.post(`/products/${productId}/variants`, variantData);
  return res.data;
}

export async function updateProductVariant(variantId: string, updateData: Partial<ProductVariant>) {
  const res = await axiosInstance.put(`/products/variants/${variantId}`, updateData);
  return res.data;
}

export async function deleteProductVariant(variantId: string) {
  const res = await axiosInstance.delete(`/products/variants/${variantId}`);
  return res.data;
}

// --- Additional Product Routes ---


export async function getFeaturedProducts(): Promise<Product[]> {
  
  const res = await axiosInstance.get<ProductsResponse>('/products/featured');
  return res.data.products;
}

export async function getFeaturedProductsWithLimit(limit: number): Promise<Product[]> {
  console.log(API_URL)
  if (isNaN(limit) || limit <= 0) {
    throw new Error('Limit must be a positive number');
  }
  const res = await axiosInstance.get<ProductsResponse>(`/products/featured/${limit}`);
  return res.data.products;
}


export async function getNewProducts(): Promise<Product[]> {
  const res = await axiosInstance.get<ProductsResponse>('/products/new');
  return res.data.products;
}

export async function getSaleProducts(): Promise<Product[]> {
  const res = await axiosInstance.get<ProductsResponse>('/products/sale');
  return res.data.products;
}

export async function getProductsByCategory(categoryId: string): Promise<Product[]> {
  const res = await axiosInstance.get(`/products/category/${categoryId}`);
  return res.data.products;
}

export async function getProductColors(productId: string): Promise<{ color: string; thumbnail?: string }[]> {
  const res = await axiosInstance.get<{ colors: { color: string; thumbnail?: string }[] }>(`/products/${productId}/colors`);
  return res.data.colors;
}

export async function getProductSizes(productId: string, color?: string): Promise<{ size: string; available: boolean }[]> {
  const res = await axiosInstance.get<{ sizes: { size: string; available: boolean }[] }>(
    `/products/${productId}/sizes`,
    { params: color ? { color } : {} }
  );
  return res.data.sizes;
}

export async function getVariantsByColor(productId: string, color: string): Promise<ProductVariant[]> {
  const res = await axiosInstance.get<{ variants: ProductVariant[] }>(
    `/products/${productId}/variants-by-color`,
    { params: { color } }
  );
  return res.data.variants;
}

export async function checkVariantAvailability(
  productId: string,
  color: string,
  size: string
): Promise<{
  variant_id: string;
  product_id: string;
  color: string;
  size: string;
  available: boolean;
  in_stock: number;
  price: number;
  image?: string;
}> {
  const res = await axiosInstance.get(`/products/${productId}/check-variant`, {
    params: { color, size },
  });
  return res.data;
}
