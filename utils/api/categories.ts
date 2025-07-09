import axios from 'axios';

const API_URL = 'https://noctael.onrender.com';
export interface Category {
  id: string;
  name: string;
  slug: string;
  parent_id?: string;
  parent_name?: string;
  parent_slug?: string;
}

const axiosInstance = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

// ======================
// Public Endpoints
// ======================

export async function getCategories() {
  
  try {
    const response = await axiosInstance.get('/categories');
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to fetch categories');
  }
}

export async function getCategoryBySlug(slug: string) {
  try {
    const response = await axiosInstance.get(`/categories/slug/${slug}`);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to fetch category by slug');
  }
}

export async function getCategoryById(id: string) {
  try {
    const response = await axiosInstance.get(`/categories/${id}`);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to fetch category by ID');
  }
}

export async function getRootCategories() {
  try {
    const response = await axiosInstance.get('/categories/root');
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to fetch root categories');
  }
}

export async function getCategoryTree() {
  try {
    const response = await axiosInstance.get('/categories/tree');
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to fetch category tree');
  }
}

// ======================
// Admin (Authenticated)
// ======================

export async function createCategory(categoryData: Partial<Category>) {
  try {
    const response = await axiosInstance.post('/categories', categoryData);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to create category');
  }
}

export async function updateCategory(id: string, categoryData: Partial<Category>) {
  try {
    const response = await axiosInstance.put(`/categories/${id}`, categoryData);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to update category');
  }
}

export async function deleteCategory(id: string) {
  try {
    const response = await axiosInstance.delete(`/categories/${id}`);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to delete category');
  }
}
