"use client"

import Image from "next/image"
import Link from "next/link"
import { Trash2, ShoppingBag, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { useCart } from "@/hooks/use-cart"
import { useState } from "react"
import { Separator } from "@/components/ui/separator"

export default function CartItems() {
  const { 
    items, 
    count, 
    subtotal, 
    discount,
    total,
    cart_id,
    updateQuantity, 
    removeFromCart, 
    isLoading 
  } = useCart()
  
  const [updatingItems, setUpdatingItems] = useState<Record<string, boolean>>({})
  const [removingItems, setRemovingItems] = useState<Record<string, boolean>>({})
  const router = useRouter()
  const { toast } = useToast()

  const getImageUrl = (imagePath: string) => {
    if (!imagePath) return "/placeholder.svg"
    if (imagePath.startsWith('http')) return imagePath
    return `${process.env.NEXT_PUBLIC_API_URL}${imagePath}`
  }

  const handleUpdateQuantity = async (itemId: string, newQuantity: number) => {
    if (newQuantity < 1) return
    
    try {
      setUpdatingItems(prev => ({ ...prev, [itemId]: true }))
      await updateQuantity(itemId, newQuantity)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update item quantity. Please try again.",
        variant: "destructive",
      })
    } finally {
      setUpdatingItems(prev => ({ ...prev, [itemId]: false }))
    }
  }

  const handleRemoveItem = async (itemId: string) => {
    try {
      setRemovingItems(prev => ({ ...prev, [itemId]: true }))
      await removeFromCart(itemId)
      toast({
        title: "Success",
        description: "Item removed from cart",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to remove item. Please try again.",
        variant: "destructive",
      })
    } finally {
      setRemovingItems(prev => ({ ...prev, [itemId]: false }))
    }
  }

  const handleCheckout = () => {
    const cartData = {
      cart_id: cart_id,
      subtotal,
      discount_amount: discount?.amount || 0,
      discount_code_id: discount?.code || null,
      total
    }
    
    sessionStorage.setItem('cartData', JSON.stringify(cartData))
    router.push('/checkout')
  }

  if (isLoading) {
    return (
      <div className="flex h-60 flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
        <Loader2 className="mb-4 h-8 w-8 animate-spin text-gray-400" />
        <h2 className="text-lg font-medium">Loading your cart...</h2>
      </div>
    )
  }

  if (!items || items.length === 0) {
    return (
      <div className="flex h-60 flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
        <ShoppingBag className="mb-4 h-12 w-12 text-gray-300" />
        <h2 className="mb-2 text-xl font-medium">Your cart is empty</h2>
        <p className="mb-6 text-gray-500">Looks like you haven't added anything to your cart yet.</p>
        <Button asChild>
          <Link href="/products">Start Shopping</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="rounded-lg border">
      <div className="p-6">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-medium">Your Cart ({count})</h2>
          <Button 
            variant="ghost" 
            size="sm" 
            asChild
            className="text-sm text-gray-500 hover:text-gray-900"
          >
            <Link href="/products">Continue Shopping</Link>
          </Button>
        </div>

        <div className="divide-y">
          {items.map((item) => (
            <div key={`${item.id}-${item.size}`} className="flex py-6">
              <div className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-md border">
                <Image 
                  src={getImageUrl(item.image)} 
                  alt={item.name} 
                  fill
                  className="object-cover object-center"
                  sizes="(max-width: 640px) 100vw, 96px"
                />
              </div>

              <div className="ml-4 flex flex-1 flex-col">
                <div className="flex justify-between">
                  <div>
                    <h3 className="text-base font-medium">
                      <Link 
                        href={`/products/${item.product_id}`} 
                        className="hover:text-primary hover:underline"
                      >
                        {item.name}
                      </Link>
                    </h3>
                    {item.size && (
                      <p className="mt-1 text-sm text-gray-500">Size: {item.size}</p>
                    )}
                    {item.color && (
                      <p className="mt-1 text-sm text-gray-500">Color: {item.color}</p>
                    )}
                  </div>
                  <p className="text-base font-medium">
                    {Number(item.price * item.quantity).toFixed(2)} Da
                  </p>
                </div>

                <div className="mt-4 flex flex-1 items-end justify-between">
                  <div className="flex items-center rounded-md border">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 rounded-none"
                      onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                      disabled={updatingItems[item.id] || item.quantity <= 1}
                    >
                      {updatingItems[item.id] ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        "-"
                      )}
                    </Button>
                    <span className="w-8 text-center text-sm">
                      {item.quantity}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 rounded-none"
                      onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                      disabled={updatingItems[item.id]}
                    >
                      {updatingItems[item.id] ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        "+"
                      )}
                    </Button>
                  </div>

                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-destructive hover:text-destructive/80"
                    onClick={() => handleRemoveItem(item.id)}
                    disabled={removingItems[item.id]}
                  >
                    {removingItems[item.id] ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                    <span className="ml-2">Remove</span>
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 border-t pt-6">
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>{Number(subtotal).toFixed(2)} Da</span>
            </div>
            {discount && discount.amount > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Discount ({discount.percent}%)</span>
                <span>-{Number(discount.amount).toFixed(2)} Da</span>
              </div>
            )}
            <Separator />
            <div className="flex justify-between font-medium">
              <span>Total</span>
              <span>
                {Math.max(0, total).toFixed(2)} Da
                {discount?.amount > 0 && (
                  <span className="ml-2 text-sm text-gray-500 line-through">
                    {Number(subtotal).toFixed(2)} Da
                  </span>
                )}
              </span>
            </div>
          </div>
          <Button
            className="mt-6 w-full"
            onClick={handleCheckout}
            disabled={items.length === 0}
          >
            Proceed to Checkout
          </Button>
        </div>
      </div>
    </div>
  )
}