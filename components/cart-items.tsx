"use client"

import Image from "next/image"
import Link from "next/link"
import { Trash2, ShoppingBag, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { getCart, updateCartItem, removeFromCart } from "@/utils/api/cart"

interface CartItem {
  id: string
  product_id: string
  name: string
  image: string
  size: string | null
  color: string | null
  price: number
  quantity: number
  item_total: number
}

interface CartData {
  items: CartItem[]
  count: number
  subtotal: number
}

export default function CartItems() {
  const [cart, setCart] = useState<CartData | null>(null)
  const [loading, setLoading] = useState(true)
  const [updatingItems, setUpdatingItems] = useState<Record<string, boolean>>({})
  const [removingItems, setRemovingItems] = useState<Record<string, boolean>>({})
  const router = useRouter()
  const { toast } = useToast()

  const fetchCart = async () => {
    try {
      setLoading(true)
      const cartData = await getCart()
      setCart(cartData)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load your cart. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCart()
  }, [])

  const handleUpdateQuantity = async (itemId: string, newQuantity: number) => {
    if (newQuantity < 1) return
    
    try {
      setUpdatingItems(prev => ({ ...prev, [itemId]: true }))
      await updateCartItem(itemId, newQuantity)
      await fetchCart() // Refresh cart data
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
      await fetchCart() // Refresh cart data
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

  const getImageUrl = (imagePath: string) => {
    if (!imagePath) return "/placeholder.svg"
    if (imagePath.startsWith('http')) return imagePath
    return `${process.env.NEXT_PUBLIC_API_URL}${imagePath}`
  }

  if (loading) {
    return (
      <div className="flex h-60 flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
        <Loader2 className="mb-4 h-8 w-8 animate-spin text-gray-400" />
        <h2 className="text-lg font-medium">Loading your cart...</h2>
      </div>
    )
  }

  if (!cart || cart.count === 0) {
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
          <h2 className="text-xl font-medium">Your Cart ({cart.count})</h2>
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
          {cart.items.map((item) => (
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
                    {Number(item.item_total).toFixed(2)} Da
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
          <div className="flex justify-between text-lg font-medium">
            <span>Subtotal</span>
            <span>{Number(cart.subtotal)} Da</span>
            </div>
          <p className="mt-2 text-sm text-gray-500">
            Shipping and taxes calculated at checkout
          </p>
          <Button
            className="mt-6 w-full"
            onClick={() => router.push('/checkout')}
            disabled={cart.count === 0}
          >
            Proceed to Checkout
          </Button>
        </div>
      </div>
    </div>
  )
}