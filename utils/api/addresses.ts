import axios from 'axios';

const API_URL = 'https://noctael.onrender.com'

export interface Address {
  id?: string;
  user_id?: string;
  name: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  is_default?: boolean;
  created_at?: string;
  updated_at?: string;
}

// Axios instance with credentials
const axiosInstance = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

export async function getUserAddresses() {
  try {
    const response = await axiosInstance.get('/addresses');
    return response.data; // should contain { addresses: Address[], count: number }
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to fetch addresses');
  }
}

export async function getAddressById(id: string) {
  try {
    const response = await axiosInstance.get(`/addresses/${id}`);
    return response.data; // { address: Address }
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to fetch address');
  }
}

export async function createAddress(addressData: Address) {
  try {
    const response = await axiosInstance.post('/addresses', addressData);
    return response.data; // { message, address }
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to create address');
  }
}

export async function updateAddress(addressId: string, addressData: Address) {
  try {
    const response = await axiosInstance.put(`/addresses/${addressId}`, addressData);
    return response.data; // { message, address }
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to update address');
  }
}

export async function deleteAddress(addressId: string) {
  try {
    const response = await axiosInstance.delete(`/addresses/${addressId}`);
    return response.data; // { message }
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to delete address');
  }
}

export async function setDefaultAddress(addressId: string) {
  try {
    const response = await axiosInstance.put(`/addresses/${addressId}/default`);
    return response.data; // { message, address }
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to set default address');
  }
}
