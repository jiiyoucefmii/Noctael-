"use client"

import Image from "next/image"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { useCart } from "@/hooks/use-cart"
import { Loader2 } from "lucide-react"
import { useEffect } from "react"

export default function OrderSummary() {
  const { 
    items, 
    subtotal, 
    discount,
    isLoading,
    shipping,
    total
  } = useCart()

  useEffect(() => {
    console.log("Shipping cost:", shipping);
  }, [shipping])

  const getImageUrl = (imagePath: string | undefined) => {
    if (!imagePath) return "/placeholder.svg"
    if (imagePath.startsWith('http')) return imagePath
    const baseUrl = process.env.NEXT_PUBLIC_API_URL?.endsWith('/') 
      ? process.env.NEXT_PUBLIC_API_URL.slice(0, -1)
      : process.env.NEXT_PUBLIC_API_URL
    return `${baseUrl}${imagePath}`
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Order Summary</CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin" />
        </CardContent>
      </Card>
    )
  }

  if (!items || items.length === 0) {
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

  // Calculate discount percentage properly
  const discountPercent = discount?.amount && subtotal > 0
    ? Math.round((discount.amount / subtotal) * 100)
    : 0

  // Calculate the original total before discount (for strikethrough display)
  const originalTotal = subtotal + shipping

  return (
    <Card>
      <CardHeader>
        <CardTitle>Order Summary</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="max-h-80 overflow-auto">
          {items.map((item) => (
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
              <p className="font-medium">
                {Number(item.price * item.quantity).toFixed(2)} Da
              </p>
            </div>
          ))}
        </div>
        <Separator />
        <div className="space-y-2">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span>{Number(subtotal).toFixed(2)} Da</span>
          </div>
          
          {discount && discount.amount > 0 && (
            <>
              <div className="flex justify-between text-green-600">
                <span>Discount ({discountPercent}%)</span>
                <span>-{Number(discount.amount).toFixed(2)} Da</span>
              </div>
              <div className="flex justify-between">
                <span>Subtotal after discount</span>
                <span>{Number(subtotal - discount.amount).toFixed(2)} Da</span>
              </div>
            </>
          )}

          <div className="flex justify-between">
            <span>Shipping</span>
            <span>{shipping === 0 ? "Free" : `${Number(shipping).toFixed(2)} Da`}</span>
          </div>
        </div>
        <Separator />
        <div className="flex justify-between font-medium">
          <span>Total</span>
          <span>
  {Number(subtotal - (discount?.amount ?? 0)).toFixed(2)} Da
  {(discount?.amount ?? 0) > 0 && (
    <span className="ml-2 text-sm text-gray-500 line-through">
      {Number(originalTotal).toFixed(2)} Da
    </span>
  )}
</span>

        </div>
      </CardContent>
      <CardFooter className="text-sm text-gray-500">
        <p>By placing your order, you agree to our Terms of Service and Privacy Policy.</p>
      </CardFooter>
    </Card>
  )
}