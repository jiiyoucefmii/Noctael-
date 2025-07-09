"use client"

import Image from "next/image"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { useEffect, useState } from "react"
import { getCart } from "@/utils/api/cart"
import { Cart, CartItem } from "@/utils/api/cart"

export default function OrderSummary() {
  const [cart, setCart] = useState<Cart | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchCart = async () => {
      try {
        setLoading(true)
        const cartData = await getCart()
        setCart(cartData)
      } catch (err) {
        setError("Failed to load cart data")
        console.error("Error fetching cart:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchCart()
  }, [])

  // Helper function to construct proper image URL
  const getImageUrl = (imagePath: string | undefined) => {
    if (!imagePath) return "/placeholder.svg"
    if (imagePath.startsWith('http')) return imagePath
    // Ensure we don't get double slashes when combining
    const baseUrl = process.env.NEXT_PUBLIC_API_URL?.endsWith('/') 
      ? process.env.NEXT_PUBLIC_API_URL.slice(0, -1)
      : process.env.NEXT_PUBLIC_API_URL
    return `${baseUrl}${imagePath}`
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Order Summary</CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Order Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-red-500">{error}</p>
        </CardContent>
      </Card>
    )
  }

  if (!cart || cart.items.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Order Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Your cart is empty</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Order Summary</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="max-h-80 overflow-auto">
          {cart.items.map((item: CartItem) => (
            <div key={`${item.id}-${item.size}`} className="flex items-center py-2">
              <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-md">
                <Image 
                  src={getImageUrl(item.image)} 
                  alt={item.name} 
                  fill 
                  className="object-cover" 
                  sizes="64px"
                />
              </div>
              <div className="ml-4 flex-1">
                <p className="font-medium">{item.name}</p>
                <p className="text-sm text-gray-500">
                  {item.size && `Size: ${item.size} · `}Qty: {item.quantity}
                </p>
              </div>
              <p className="font-medium">${(item.price * item.quantity).toFixed(2)}</p>
            </div>
          ))}
        </div>
        <Separator />
        <div className="space-y-2">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span>{Number(cart.subtotal).toFixed(2)}</span>
            </div>
          <div className="flex justify-between">
            <span>Shipping</span>
            <span>{cart.subtotal > 100 ? "Free" : "$10.00"}</span>
          </div>
        </div>
        <Separator />
        <div className="flex justify-between font-medium">
          <span>Total</span>
          <span>
  ${Number(cart.subtotal + (Number(cart.subtotal) > 100 ? 0 : 10)).toFixed(2)}
</span>
        </div>
      </CardContent>
      <CardFooter className="text-sm text-gray-500">
        <p>By placing your order, you agree to our Terms of Service and Privacy Policy.</p>
      </CardFooter>
    </Card>
  )
}