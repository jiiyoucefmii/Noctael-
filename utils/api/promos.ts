const API_URL = 'https://noctael.onrender.com';
if (!API_URL) {
  throw new Error("NEXT_PUBLIC_API_URL is not defined in your .env file")
}

const baseUrl = `${API_URL}/discount-codes`

// Types
interface DiscountCode {
  id: string
  code: string
  discount_percent: number
  valid_from?: string | null
  valid_to?: string | null
  usage_limit?: number | null
  usage_count: number
}

interface DiscountCodeWithUsage extends DiscountCode {
  usage_details: {
    user_id: string
    email: string
    order_id: string
    used_at: string
  }[]
}

// API Calls

export async function getAllDiscountCodes(): Promise<{ discountCodes: DiscountCode[]; count: number }> {
  const res = await fetch(`${baseUrl}`, { credentials: 'include' })
  if (!res.ok) throw new Error('Failed to fetch discount codes')
  return res.json()
}

export async function getDiscountCodeById(id: string): Promise<{ discountCode: DiscountCodeWithUsage }> {
  const res = await fetch(`${baseUrl}/${id}`, { credentials: 'include' })
  if (!res.ok) throw new Error('Discount code not found')
  return res.json()
}

export async function createDiscountCode(data: {
  code: string
  discount_percent: number
  valid_from?: string | null
  valid_to?: string | null
  usage_limit?: number | null
  user_usage_limit?: number | null
}): Promise<{ message: string; discountCode: DiscountCode }> {
  const res = await fetch(`${baseUrl}`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error('Failed to create discount code')
  return res.json()
}

export async function updateDiscountCode(id: string, data: {
  discount_percent?: number
  valid_from?: string | null
  valid_to?: string | null
  usage_limit?: number | null
}): Promise<{ message: string; discountCode: DiscountCode }> {
  const res = await fetch(`${baseUrl}/${id}`, {
    method: 'PUT',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error('Failed to update discount code')
  return res.json()
}

export async function deleteDiscountCode(id: string): Promise<{ message: string }> {
  const res = await fetch(`${baseUrl}/${id}`, {
    method: 'DELETE',
    credentials: 'include',
  })
  if (!res.ok) throw new Error('Failed to delete discount code')
  return res.json()
}

export async function validateDiscountCode(code: string): Promise<{
  message: string
  valid: boolean
  discount?: {
    id: string
    code: string
    percent: number
  }
}> {
  const res = await fetch(`${baseUrl}/validate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code }),
  })
  if (!res.ok) throw new Error('Failed to validate discount code')
  return res.json()
}

export async function calculateDiscount(input: {
  code: string
  subtotal: number
}): Promise<{
  subtotal: number
  discount_code: string
  discount_percent: number
  discount_amount: number
  total: number
}> {
  const res = await fetch(`${baseUrl}/calculate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  })
  if (!res.ok) throw new Error('Failed to calculate discount')
  return res.json()
}
