"use client"

import Image from "next/image"
import Link from "next/link"
import { Trash } from "lucide-react"
import { ShoppingBag } from "lucide-react" // Declared the ShoppingBag variable

import { Button } from "@/components/ui/button"
import { useCart } from "@/hooks/use-cart"

export default function CartItems() {
  const { items, updateQuantity, removeFromCart } = useCart()

  if (items.length === 0) {
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
        <h2 className="mb-4 text-lg font-medium">Items in Your Cart</h2>
        <div className="divide-y">
          {items.map((item) => (
            <div key={`${item.id}-${item.size}`} className="flex py-6">
              <div className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-md">
                <Image src={item.images[0] || "/placeholder.svg"} alt={item.name} fill className="object-cover" />
              </div>
              <div className="ml-4 flex flex-1 flex-col">
                <div className="flex justify-between">
                  <div>
                    <h3 className="font-medium">
                      <Link href={`/products/${item.id}`} className="hover:underline">
                        {item.name}
                      </Link>
                    </h3>
                    {item.size && <p className="mt-1 text-sm text-gray-500">Size: {item.size}</p>}
                  </div>

                  <p className="font-medium">{(item.price * item.quantity).toFixed(2)} Da</p>

                </div>
                <div className="mt-auto flex items-center justify-between">
                  <div className="flex items-center border rounded">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 rounded-none"
                      onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                    >
                      -
                    </Button>
                    <span className="w-8 text-center">{item.quantity}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 rounded-none"
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    >
                      +
                    </Button>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => removeFromCart(item.id)}>
                    <Trash className="h-4 w-4" />
                    <span className="sr-only">Remove</span>
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
