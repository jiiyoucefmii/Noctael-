import axios from 'axios';
import { Order } from './orders';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export interface User {
  id?: number;
  email: string;
  first_name: string;
  last_name: string;
  phone_number: string;
}


interface UserWithOrders extends User {
  orders?: {
    id: string
    created_at: string
    total: number
    // other order fields
  }[]
  createdAt: string
}


export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  phone_number: string;
}

export interface UpdatePasswordData {
  current_password: string;
  new_password: string;
  confirm_password: string;
}

// Auth APIs
export async function loginUser(credentials: LoginCredentials) {
  const res = await axios.post(`${API_URL}/auth/login`, credentials, { withCredentials: true });
  return res.data;
}

export async function registerUser(data: RegisterData) {
  const res = await axios.post(`${API_URL}/auth/register`, data, { withCredentials: true });
  return res.data;
}

export async function logoutUser() {
  const res = await axios.post(`${API_URL}/auth/logout`, {}, { withCredentials: true });
  return res.data;
}

export async function getCurrentUser() {
  const res = await axios.get(`${API_URL}/auth/me`, { withCredentials: true });
  return res.data;
}

export async function verifyEmail(token: string) {
  const res = await axios.post(`${API_URL}/auth/verify-email`, { token }, { withCredentials: true });
  return res.data;
}

export async function resendVerification(email: string) {
  const res = await axios.post(`${API_URL}/auth/resend-verification`, { email }, { withCredentials: true });
  return res.data;
}

export async function requestPasswordReset(email: string) {
  const res = await axios.post(`${API_URL}/auth/forgot-password`, { email }, { withCredentials: true });
  return res.data;
}

export async function resetPassword(token: string, password: string) {
  const res = await axios.post(`${API_URL}/auth/reset-password`, { token, password }, { withCredentials: true });
  return res.data;
}

export async function requestEmailChange(new_email: string) {
  const res = await axios.post(`${API_URL}/auth/change-email`, { new_email }, { withCredentials: true });
  return res.data;
}

export async function confirmEmailChange(token: string) {
  const res = await axios.post(`${API_URL}/auth/confirm-email-change`, { token }, { withCredentials: true });
  return res.data;
}

export async function verifyEmailChange(token: string) {
  const res = await axios.post(`${API_URL}/auth/verify-email-change`, { token }, { withCredentials: true });
  return res.data;
}

// Users APIs
export async function updateUserProfile(data: User) {
  const res = await axios.put(`${API_URL}/users/profile`, data, { withCredentials: true });
  return res.data;
}

export async function updateUserPassword(data: UpdatePasswordData) {
  const res = await axios.put(`${API_URL}/users/password`, data, { withCredentials: true });
  return res.data;
}

/**
 * Fetch all users along with their associated orders.
 */
export async function getUsersWithOrders() {
  const res = await axios.get(`${API_URL}/users/with-orders`, { withCredentials: true });
  return res.data;
}



export async function getUserById(user_id: string) {
  const res = await axios.get(`${API_URL}/users/${user_id}`, { withCredentials: true });
  return res.data;
}
