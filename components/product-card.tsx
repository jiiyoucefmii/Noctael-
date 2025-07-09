"use client"

import Link from "next/link"
import Image from "next/image"
import { Heart, ShoppingCart, Loader2 } from "lucide-react"
import { useState } from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"
import type { Product } from "@/utils/api/products"

interface ProductCardProps {
  product: Product
  className?: string
}

export default function ProductCard({ product, className }: ProductCardProps) {
  const { toast } = useToast()
  const [isWishlistLoading, setIsWishlistLoading] = useState(false)

  // Get the first variant for pricing
  const firstVariant = product.variants?.[0]
  const price = firstVariant?.price || 0
  const salePrice = firstVariant?.sale_price
  const mainImage = product.main_image || firstVariant?.images?.[0]?.image_url || "/placeholder.svg"
  const isOutOfStock = firstVariant?.stock_quantity === 0

  const handleAddToWishlist = async () => {
    setIsWishlistLoading(true)
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800))
      toast({
        title: "Added to wishlist",
        description: `${product.name} has been added to your wishlist.`,
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add to wishlist",
        variant: "destructive"
      })
    } finally {
      setIsWishlistLoading(false)
    }
  }

  return (
    <Card className={cn("overflow-hidden hover:shadow-lg transition-shadow", className)}>
      <div className="relative aspect-square">
        <Link href={`/products/${product.id}`} className="block h-full">
          <Image
            src={mainImage.startsWith('/') 
              ? `${process.env.NEXT_PUBLIC_API_URL}${mainImage}` 
              : mainImage}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-300 hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        </Link>
        
        {/* Badges */}
        <div className="absolute top-2 left-2 space-x-2">
          {product.is_new && (
            <Badge className="bg-black text-white">New</Badge>
          )}
          {product.is_on_sale && (
            <Badge className="bg-red-600 text-white">Sale</Badge>
          )}
          {isOutOfStock && (
            <Badge variant="outline" className="bg-background/80">
              Out of Stock
            </Badge>
          )}
        </div>

        {/* Wishlist button */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-2 top-10 rounded-full bg-white/80 p-1.5 text-black hover:bg-white"
          onClick={handleAddToWishlist}
          disabled={isWishlistLoading}
        >
          {isWishlistLoading ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <Heart className="h-5 w-5" />
          )}
          <span className="sr-only">Add to wishlist</span>
        </Button>
      </div>

      <CardContent className="p-4 space-y-2">
        <Link href={`/products/${product.id}`} className="hover:underline">
          <h3 className="font-medium line-clamp-2 min-h-[56px]">{product.name}</h3>
        </Link>
        <p className="text-sm text-muted-foreground">{product.category_name}</p>
        
        <div className="flex items-center gap-2">
          {product.is_on_sale && salePrice ? (
            <>
              <p className="font-semibold">${salePrice.toFixed(2)}</p>
              <p className="text-sm text-muted-foreground line-through">
                ${price.toFixed(2)}
              </p>
              <Badge variant="outline" className="ml-auto text-red-600">
                {Math.round(((price - salePrice) / price) * 100)}% OFF
              </Badge>
            </>
          ) : (
            <p className="font-semibold">${price.toFixed(2)}</p>
          )}
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0">
        <Button 
          className="w-full" 
          asChild
          disabled={isOutOfStock}
        >
          <Link href={`/products/${product.id}`}>
            <ShoppingCart className="mr-2 h-4 w-4" />
            {isOutOfStock ? "Out of Stock" : "View Options"}
          </Link>
        </Button>
      </CardFooter>
    </Card>
  )
}