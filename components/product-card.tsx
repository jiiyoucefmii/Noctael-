"use client"

import Link from "next/link"
import Image from "next/image"
import { Heart, Loader2 } from "lucide-react"
import { useState } from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
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
  const [isWishlisted, setIsWishlisted] = useState(false)

  const firstVariant = product.variants?.[0]
  const price = firstVariant?.price || 0
  const salePrice = firstVariant?.sale_price
  const mainImage = product.main_image || firstVariant?.images?.[0]?.image_url || "/placeholder.svg"
  const isOutOfStock = firstVariant?.stockQuantity === 0

  const handleAddToWishlist = async () => {
    setIsWishlistLoading(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 800))
      setIsWishlisted(!isWishlisted)
      toast({
        title: isWishlisted ? "Removed from wishlist" : "Added to wishlist",
        description: `${product.name} has been ${isWishlisted ? 'removed from' : 'added to'} your wishlist.`,
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
    <Card className={cn("overflow-hidden border-0 shadow-none relative bg-transparent hover:shadow-sm transition-all duration-300", className)}>
      <div className="relative w-full aspect-[4/5] bg-neutral-900/50">

        <Link href={`/products/${product.id}`} className="block w-full h-full">
          <Image
            src={mainImage.startsWith('/') 
              ? `${process.env.NEXT_PUBLIC_API_URL}${mainImage}` 
              : mainImage}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        </Link>

        {/* NEW badge - bottom left (Gymshark style) */}
        {product.is_new && (
          <Badge className="absolute bottom-2 left-2 bg-white text-black font-medium px-3 py-1 rounded-sm">NEW</Badge>
        )}

        {/* Wishlist - top right */}
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            "absolute top-2 right-2 rounded-full p-2 bg-white/90 hover:bg-white",
            isWishlisted && "bg-white text-black"
          )}
          onClick={handleAddToWishlist}
          disabled={isWishlistLoading}
        >
          {isWishlistLoading ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <Heart className={cn("h-5 w-5", isWishlisted && "fill-current")}/>
          )}
          <span className="sr-only">Add to wishlist</span>
        </Button>
        
        {/* View Options button on hover (Gymshark style) */}
        <div className="absolute inset-0 flex items-end justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 pb-4">
          <Button
            className="w-11/12 bg-white text-black hover:bg-white/90 font-medium tracking-wide"
            asChild
          >
            <Link href={`/products/${product.id}`}>
              {isOutOfStock ? "Out of Stock" : "View Options"}
            </Link>
          </Button>
        </div>
      </div>

      <CardContent className="p-4 pt-5 space-y-1 text-center">  
        <h3 className="font-bold text-base line-clamp-1 text-center">{product.name}</h3>
        <p className="text-sm text-muted-foreground font-light text-center">Oversized Fit</p>
        <p className="text-sm text-muted-foreground font-light text-center">Black</p>
        <p className="font-bold text-base pt-1 text-center">{salePrice ? salePrice.toFixed(0) : price.toFixed(0)} Da</p>
      </CardContent>
    </Card>
  )
}
