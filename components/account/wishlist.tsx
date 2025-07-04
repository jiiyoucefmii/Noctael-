"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { ShoppingCart, Trash } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { useCart } from "@/hooks/use-cart"
import type { Product } from "@/types/product"

// Mock wishlist data
const wishlistItems: Product[] = [
  {
    id: "1",
    name: "Shadow Oversized Tee",
    description: "A premium oversized t-shirt with a minimalist design.",
    price: 49.99,
    images: ["/images/product-1.jpg"],
    category: "T-Shirts",
    gender: "unisex",
    sizes: ["S", "M", "L", "XL"],
    colors: ["Black", "White", "Gray"],
    isNew: true,
    isFeatured: true,
    stock: 100,
  },
  {
    id: "4",
    name: "Lunar Beanie",
    description: "Keep warm with our stylish beanie.",
    price: 29.99,
    images: ["/images/product-4.jpg"],
    category: "Accessories",
    gender: "unisex",
    sizes: ["One Size"],
    colors: ["Black", "Gray", "Navy"],
    isFeatured: true,
    stock: 120,
  },
]

export default function AccountWishlist() {
  const [wishlist, setWishlist] = useState(wishlistItems)
  const { toast } = useToast()
  const { addToCart } = useCart()

  const handleRemoveFromWishlist = (id: string) => {
    setWishlist(wishlist.filter((item) => item.id !== id))
    toast({
      title: "Removed from wishlist",
      description: "The item has been removed from your wishlist.",
    })
  }

  const handleAddToCart = (product: Product) => {
    addToCart(product)
    toast({
      title: "Added to cart",
      description: `${product.name} has been added to your cart.`,
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>My Wishlist</CardTitle>
        <CardDescription>Items you've saved for later</CardDescription>
      </CardHeader>
      <CardContent>
        {wishlist.length === 0 ? (
          <div className="flex h-40 flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
            <p className="mb-2 text-lg font-medium">Your wishlist is empty</p>
            <p className="mb-4 text-sm text-gray-500">Items added to your wishlist will appear here.</p>
            <Button asChild>
              <Link href="/products">Browse Products</Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {wishlist.map((item) => (
              <div key={item.id} className="flex items-start space-x-4 rounded-lg border p-4">
                <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-md">
                  <Image src={item.images[0] || "/placeholder.svg"} alt={item.name} fill className="object-cover" />
                </div>
                <div className="flex-1">
                  <Link href={`/products/${item.id}`} className="hover:underline">
                    <h3 className="font-medium">{item.name}</h3>
                  </Link>
                  <p className="mt-1 text-sm text-gray-500">{item.category}</p>
                  <p className="mt-1 font-semibold">${item.price.toFixed(2)}</p>
                </div>
                <div className="flex flex-col space-y-2">
                  <Button size="sm" onClick={() => handleAddToCart(item)}>
                    <ShoppingCart className="mr-2 h-4 w-4" />
                    Add to Cart
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleRemoveFromWishlist(item.id)}>
                    <Trash className="mr-2 h-4 w-4" />
                    Remove
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
