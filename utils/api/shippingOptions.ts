const API_URL = process.env.NEXT_PUBLIC_API_URL

if (!API_URL) {
  throw new Error("NEXT_PUBLIC_API_URL is not defined in your .env file")
}

const baseUrl = `${API_URL}/shipping-options`

// Types
export interface ShippingOption {
  id: string
  state: string
  to_home: number
  to_desk: number
}

// ========== API Calls ==========

export async function getAllShippingOptions(): Promise<ShippingOption[]> {
  const res = await fetch(`${baseUrl}`, { credentials: 'include' })
  if (!res.ok) throw new Error('Failed to fetch shipping options')
  return res.json()
}

export async function getShippingOptionById(id: string): Promise<ShippingOption> {
  const res = await fetch(`${baseUrl}/${id}`, { credentials: 'include' })
  if (!res.ok) throw new Error('Failed to fetch shipping option')
  return res.json()
}

export async function createShippingOption(data: {
  state: string
  to_home: number
  to_desk: number
}): Promise<{ message: string; shippingOption: ShippingOption }> {
  const res = await fetch(`${baseUrl}`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error('Failed to create shipping option')
  return res.json()
}

export async function updateShippingOption(id: string, data: {
  state?: string
  to_home?: number
  to_desk?: number
}): Promise<{ message: string; shippingOption: ShippingOption }> {
  const res = await fetch(`${baseUrl}/${id}`, {
    method: 'PUT',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error('Failed to update shipping option')
  return res.json()
}

export async function deleteShippingOption(id: string): Promise<{ message: string }> {
  const res = await fetch(`${baseUrl}/${id}`, {
    method: 'DELETE',
    credentials: 'include',
  })
  if (!res.ok) throw new Error('Failed to delete shipping option')
  return res.json()
}

export async function getShippingOptionsByState(state: string): Promise<ShippingOption[]> {
    const res = await fetch(`${baseUrl}/state/${encodeURIComponent(state)}`, {
      credentials: 'include',
    });
    if (!res.ok) throw new Error('Failed to fetch shipping options for state');
    return res.json();
  }
  