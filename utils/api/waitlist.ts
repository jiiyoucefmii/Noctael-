import axios from "axios";
import { API_URL } from "./config";

export interface WaitlistEntry {
    id: string;
    phone_number: string;
    created_at: string;
  }

  
// Waitlist APIs

/**
 * Fetch all waitlist entries.
 */
export async function getWaitlistEntries(): Promise<WaitlistEntry[]> {
    const res = await axios.get(`${API_URL}/waitlist`, { withCredentials: true });
    return res.data;
  }
  
  /**
   * Get a specific waitlist entry by ID.
   */
  export async function getWaitlistEntryById(id: string): Promise<WaitlistEntry> {
    const res = await axios.get(`${API_URL}/waitlist/${id}`, { withCredentials: true });
    return res.data;
  }
  
  /**
   * Create a new waitlist entry.
   */
  export async function createWaitlistEntry(phone_number: string): Promise<WaitlistEntry> {
    const res = await axios.post(
      `${API_URL}/waitlist`,
      { phone_number },
      { withCredentials: true }
    );
    return res.data;
  }
  
  /**
   * Update a waitlist entry by ID.
   */
  export async function updateWaitlistEntry(id: string, phone_number: string): Promise<WaitlistEntry> {
    const res = await axios.put(
      `${API_URL}/waitlist/${id}`,
      { phone_number },
      { withCredentials: true }
    );
    return res.data;
  }
  
  /**
   * Delete a waitlist entry by ID.
   */
  export async function deleteWaitlistEntry(id: string): Promise<{ message: string; entry: WaitlistEntry }> {
    const res = await axios.delete(`${API_URL}/waitlist/${id}`, { withCredentials: true });
    return res.data;
  }
  