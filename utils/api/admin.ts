import axios from 'axios';

import { API_URL } from './config';

export interface AdminLoginCredentials {
  email: string;
  password: string;
}

export interface AdminRegisterCredentials extends AdminLoginCredentials {
  name: string;
}

const axiosInstance = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

export async function adminRegister(data: AdminRegisterCredentials) {
  try {
    const response = await axiosInstance.post('/admin/register', data);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Admin registration failed');
  }
}

export async function adminLogin(credentials: AdminLoginCredentials) {
  try {
    const response = await axiosInstance.post('/admin/login', credentials);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Login failed');
  }
}

export async function adminLogout() {
  try {
    const response = await axiosInstance.post('/admin/logout');
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Admin logout failed');
  }
}

export async function logoutAdmin() {
  await axios.post(`${API_URL}/admin/logout`, {}, { withCredentials: true });
}
