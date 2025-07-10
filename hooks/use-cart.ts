"use client"

import { useContext } from "react"
import { CartContext } from "../providers/cart-provider"

export function useCart() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider")
  }
  // context.addToCart(productId: string, quantity: number, size: string, variantId: string)
  return context
}
