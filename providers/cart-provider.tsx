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

interface LocalCartItem extends Product {
  quantity: number
  size?: string
  variant_id?: string
}

interface CartContextType {
  items: LocalCartItem[]
  addToCart: (product: Product, quantity?: number, size?: string, variant_id?: string) => Promise<void>
  removeFromCart: (itemId: string) => Promise<void>
  updateQuantity: (itemId: string, quantity: number) => Promise<void>
  clearCart: () => Promise<void>
  syncCart: () => Promise<void>
  subtotal: number
  shipping: number
  total: number
  isLoading: boolean
}

export const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [localItems, setLocalItems] = useState<LocalCartItem[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Convert API cart items to local format
  const apiToLocalItem = (apiItem: ApiCartItem): LocalCartItem => ({
    id: apiItem.product_id,
    variant_id: apiItem.variant_id,
    name: apiItem.name,
    price: apiItem.price,
    quantity: apiItem.quantity,
    size: apiItem.size,
    color: apiItem.color,
    main_image: apiItem.image || '',
    // Add other product fields as needed
  })

  // Load cart from API on mount
  const loadCart = async () => {
    try {
      setIsLoading(true)
      const apiCart = await apiGetCart()
      setLocalItems(apiCart.items.map(apiToLocalItem))
    } catch (error) {
      console.error("Failed to load cart:", error)
      // Fallback to localStorage if API fails
      const savedCart = localStorage.getItem("cart")
      if (savedCart) {
        try {
          setLocalItems(JSON.parse(savedCart))
        } catch (e) {
          console.error("Failed to parse local cart:", e)
        }
      }
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadCart()
  }, [])

  // Save local items to localStorage as backup
  useEffect(() => {
    if (!isLoading && localItems.length > 0) {
      localStorage.setItem("cart", JSON.stringify(localItems))
    }
  }, [localItems, isLoading])

  const addToCart = async (product: Product, quantity = 1, size?: string, variant_id?: string) => {
    // If variant_id wasn't provided, try to get it from product
    if (!variant_id && product.variants?.[0]?.id) {
      variant_id = product.variants[0].id
    }
  
    if (!variant_id) {
      throw new Error("Variant ID is required - no variant available for this product")
    }
  
    try {
      setIsLoading(true)
      const { cart_item } = await apiAddToCart(variant_id, quantity)
      
      setLocalItems(prev => {
        const existing = prev.find(item => 
          item.variant_id === variant_id && 
          item.size === size
        )
  
        if (existing) {
          return prev.map(item => 
            item.variant_id === variant_id && item.size === size
              ? { ...item, quantity: item.quantity + quantity }
              : item
          )
        }
  
        return [...prev, {
          ...product,
          variant_id,
          quantity,
          size,
          // Ensure we have all required fields
          price: product.variants?.find(v => v.id === variant_id)?.price || product.price,
          main_image: product.main_image || product.variants?.find(v => v.id === variant_id)?.images?.[0]?.image_url || ''
        }]
      })
    } catch (error) {
      console.error("Failed to add to cart:", error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const removeFromCart = async (itemId: string) => {
    try {
      setIsLoading(true)
      await apiRemoveFromCart(itemId)
      setLocalItems(prev => prev.filter(item => item.id !== itemId))
    } catch (error) {
      console.error("Failed to remove item:", error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const updateQuantity = async (itemId: string, quantity: number) => {
    if (quantity < 1) return

    try {
      setIsLoading(true)
      await apiUpdateCartItem(itemId, quantity)
      setLocalItems(prev => 
        prev.map(item => 
          item.id === itemId ? { ...item, quantity } : item
        )
      )
    } catch (error) {
      console.error("Failed to update quantity:", error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const clearCart = async () => {
    try {
      setIsLoading(true)
      await apiClearCart()
      setLocalItems([])
      localStorage.removeItem("cart")
    } catch (error) {
      console.error("Failed to clear cart:", error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  // Manual sync with API
  const syncCart = async () => {
    await loadCart()
  }

  // Calculate totals
  const subtotal = localItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const shipping = subtotal > 100 ? 0 : 10
  const total = subtotal + shipping

  return (
    <CartContext.Provider
      value={{
        items: localItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        syncCart,
        subtotal,
        shipping,
        total,
        isLoading
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