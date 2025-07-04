"use client"

import Link from "next/link"
import Image from "next/image"
import { Heart, ShoppingCart } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { useCart } from "@/hooks/use-cart"
import type { Product } from "@/types/product"

export default function ProductCard({ product }: { product: Product }) {
  const { toast } = useToast()
  const { addToCart } = useCart()

  const handleAddToCart = () => {
    addToCart(product)
    toast({
      title: "Added to cart",
      description: `${product.name} has been added to your cart.`,
    })
  }

  return (
    <Card className="overflow-hidden">
      <div className="relative aspect-square">
        <Link href={`/products/${product.id}`}>
          <Image
            src={product.images[0] || "/placeholder.svg"}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-300 hover:scale-105"
          />
        </Link>
        {product.isNew && <Badge className="absolute right-2 top-2 bg-black text-white">New</Badge>}
        {product.isOnSale && <Badge className="absolute left-2 top-2 bg-red-600 text-white">Sale</Badge>}
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-2 top-10 rounded-full bg-white/80 p-1.5 text-black hover:bg-white"
          onClick={() => {
            toast({
              title: "Added to wishlist",
              description: `${product.name} has been added to your wishlist.`,
            })
          }}
        >
          <Heart className="h-5 w-5" />
          <span className="sr-only">Add to wishlist</span>
        </Button>
      </div>
      <CardContent className="p-4">
        <Link href={`/products/${product.id}`} className="hover:underline">
          <h3 className="font-medium">{product.name}</h3>
        </Link>
        <p className="mt-1 text-sm text-gray-500">{product.category}</p>
        <div className="mt-2 flex items-center">
          {product.isOnSale ? (
            <>

              <p className="font-semibold">${product.salePrice}</p>
              <p className="ml-2 text-sm text-gray-500 line-through">${product.price}</p>
            </> 
          ) : (
            <p className="font-semibold">${product.price}</p>

          )}
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <Button className="w-full" onClick={handleAddToCart}>
          <ShoppingCart className="mr-2 h-4 w-4" />
          Add to Cart
        </Button>
      </CardFooter>
    </Card>
  )
}
