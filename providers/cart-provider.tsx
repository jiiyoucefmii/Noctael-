"use client"

import { createContext, useContext, useState, useEffect } from "react"
import type { Product } from "@/utils/api/products"
import { 
  getCart as apiGetCart,
  addToCart as apiAddToCart,
  updateCartItem as apiUpdateCartItem,
  removeFromCart as apiRemoveFromCart,
  clearCart as apiClearCart,
  transferGuestCart,
  type CartItem as ApiCartItem,
  type Cart as ApiCart
} from "@/utils/api/cart"

interface CartContextType {
  items: ApiCartItem[]
  count: number
  subtotal: number
  shipping: number
  total: number
  cart_id: string | null 
  discount?: {
    code: string
    percent: number
    amount: number
  } | null
  isLoading: boolean
  addToCart: (variant_id: string, quantity?: number) => Promise<void>
  updateQuantity: (cart_item_id: string, quantity: number) => Promise<void>
  removeFromCart: (cart_item_id: string) => Promise<void>
  clearCart: () => Promise<void>
  applyDiscount: (discount: { code: string; percent: number; amount: number }) => void
  removeDiscount: () => void
}

export const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<ApiCart | null>(null)
  const [discount, setDiscount] = useState<CartContextType['discount']>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Load cart from API on mount
  const loadCart = async () => {
    try {
      setIsLoading(true)
      const apiCart = await apiGetCart()
      setCart(apiCart)
    } catch (error) {
      console.error("Failed to load cart:", error)
      // Fallback to empty cart if API fails
      setCart({
        cart_id: 'local-cart',
        items: [],
        count: 0,
        subtotal: 0
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadCart()
  }, [])

  const addToCart = async (variant_id: string, quantity = 1) => {
    try {
      setIsLoading(true)
      const { cart_item } = await apiAddToCart(variant_id, quantity)
      await loadCart() // Refresh cart after adding
    } catch (error) {
      console.error("Failed to add to cart:", error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const updateQuantity = async (cart_item_id: string, quantity: number) => {
    if (quantity < 1) return

    try {
      setIsLoading(true)
      await apiUpdateCartItem(cart_item_id, quantity)
      await loadCart() // Refresh cart after updating
    } catch (error) {
      console.error("Failed to update quantity:", error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const removeFromCart = async (cart_item_id: string) => {
    try {
      setIsLoading(true)
      await apiRemoveFromCart(cart_item_id)
      await loadCart() // Refresh cart after removing
    } catch (error) {
      console.error("Failed to remove item:", error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const clearCart = async () => {
    try {
      setIsLoading(true)
      await apiClearCart()
      setCart({
        cart_id: 'local-cart',
        items: [],
        count: 0,
        subtotal: 0
      })
      setDiscount(null)
    } catch (error) {
      console.error("Failed to clear cart:", error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const applyDiscount = (discount: { code: string; percent: number; amount: number }) => {
    setDiscount(discount)
  }

  const removeDiscount = () => {
    setDiscount(null)
  }

  // Calculate totals
  // In CartContext provider
const subtotal = cart?.subtotal || 0;
const shipping = subtotal > 100 ? 0 : 10;
// Calculate discount amount (if any)
const discountAmount = discount ? discount.amount : 0;
// Ensure total never goes below 0
const total = Math.max(0, subtotal + shipping - discountAmount);

  return (
    <CartContext.Provider
      value={{
        items: cart?.items || [],
        count: cart?.count || 0,
        subtotal,
        shipping,
        total,
        cart_id: cart?.cart_id || null,
        discount,
        isLoading,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        applyDiscount,
        removeDiscount
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider")
  }
  return context
}