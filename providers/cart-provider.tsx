"use client"

import { createContext, useContext, useState, useEffect, useCallback } from "react"
import {
  getCart as apiGetCart,
  addToCart as apiAddToCart,
  updateCartItem as apiUpdateCartItem,
  removeFromCart as apiRemoveFromCart,
  clearCart as apiClearCart,
  type CartItem as ApiCartItem,
  type Cart as ApiCart
} from "@/utils/api/cart"

import { getShippingOptionsByState } from "@/utils/api/shippingOptions"

interface CartContextType {
  items: ApiCartItem[]
  count: number
  subtotal: number
  shipping: number
  shippingType: "to_home" | "to_desk"
  shippingState: string | null
  shippingOptions: any[]
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
  setShippingState: (state: string) => Promise<void>
  setShippingType: (type: "to_home" | "to_desk") => void
}

export const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<ApiCart | null>(null)
  const [discount, setDiscount] = useState<CartContextType["discount"]>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [shippingState, setShippingState] = useState<string | null>(null)
  const [shippingType, setShippingType] = useState<"to_home" | "to_desk">("to_home")
  const [shippingOptions, setShippingOptions] = useState<any[]>([])

  const loadCart = useCallback(async () => {
    try {
      setIsLoading(true)
      const apiCart = await apiGetCart()
      setCart(apiCart)
    } catch (error) {
      console.error("Failed to load cart:", error)
      setCart({ cart_id: "local-cart", items: [], count: 0, subtotal: 0 })
    } finally {
      setIsLoading(false)
    }
  }, [])

  const updateShippingState = useCallback(async (state: string) => {
    try {
      setIsLoading(true)
      const options = await getShippingOptionsByState(state)
      setShippingOptions(options)
      setShippingState(state)
    } catch (error) {
      console.error("Failed to fetch shipping options:", error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadCart()
  }, [loadCart])

  const addToCart = useCallback(async (variant_id: string, quantity = 1) => {
    try {
      setIsLoading(true)
      await apiAddToCart(variant_id, quantity)
      await loadCart()
    } catch (error) {
      console.error("Failed to add to cart:", error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }, [loadCart])

  const updateQuantity = useCallback(async (cart_item_id: string, quantity: number) => {
    if (quantity < 1) return
    try {
      setIsLoading(true)
      await apiUpdateCartItem(cart_item_id, quantity)
      await loadCart()
    } catch (error) {
      console.error("Failed to update quantity:", error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }, [loadCart])

  const removeFromCart = useCallback(async (cart_item_id: string) => {
    try {
      setIsLoading(true)
      await apiRemoveFromCart(cart_item_id)
      await loadCart()
    } catch (error) {
      console.error("Failed to remove item:", error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }, [loadCart])

  const clearCart = useCallback(async () => {
    try {
      setIsLoading(true)
      await apiClearCart()
      setCart({ cart_id: "local-cart", items: [], count: 0, subtotal: 0 })
      setDiscount(null)
    } catch (error) {
      console.error("Failed to clear cart:", error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }, [])

  const applyDiscount = useCallback((discount: { code: string; percent: number; amount: number }) => {
    setDiscount(discount)
  }, [])

  const removeDiscount = useCallback(() => {
    setDiscount(null)
  }, [])

  const subtotal = Number(cart?.subtotal ?? 0)
  const selectedShippingOption = shippingOptions.find(opt => opt.state === shippingState)
  const shippingCost = Number(selectedShippingOption?.[shippingType] ?? 0)
  const discountAmount = Number(discount?.amount ?? 0)
  const rawTotal = subtotal + shippingCost - discountAmount
  const total = isNaN(rawTotal) ? 0 : Math.max(0, rawTotal)

  return (
    <CartContext.Provider
      value={{
        items: cart?.items || [],
        count: cart?.count || 0,
        subtotal,
        shipping: shippingCost,
        shippingType,
        shippingState,
        shippingOptions,
        total,
        cart_id: cart?.cart_id || null,
        discount,
        isLoading,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        applyDiscount,
        removeDiscount,
        setShippingState: updateShippingState,
        setShippingType
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
