// components/product-list.tsx
"use client"

import { useSearchParams } from "next/navigation"
import { useMemo } from "react"
import ProductSort from "@/components/product-sort"
import type { Product } from "@/utils/api/products"
import Link from "next/link"
import { Heart, Star } from "lucide-react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"

interface ProductCardProps {
  product: Product
  className?: string
}

function ProductCard({ product, className }: ProductCardProps) {
  const { toast } = useToast()
  const [isWishlistLoading, setIsWishlistLoading] = useState(false)
  const [isWishlisted, setIsWishlisted] = useState(false)

  // Get the first variant for pricing
  const firstVariant = product.variants?.[0]
  const price = firstVariant?.price || 0
  const salePrice = firstVariant?.sale_price
  const originalPrice = price
  const mainImage = product.main_image || firstVariant?.images?.[0]?.image_url || "/placeholder.svg"
  const isOutOfStock = firstVariant?.stock_quantity === 0

  // Mock rating

  const handleToggleWishlist = async () => {
    setIsWishlistLoading(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 500))
      setIsWishlisted(!isWishlisted)
      toast({
        title: isWishlisted ? "Removed from wishlist" : "Added to wishlist",
        description: `${product.name} has been ${isWishlisted ? 'removed from' : 'added to'} your wishlist.`,
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update wishlist",
        variant: "destructive"
      })
    } finally {
      setIsWishlistLoading(false)
    }
  }

  const getImageUrl = (imagePath: string) => {
    if (!imagePath) return "/placeholder.svg"
    if (imagePath.startsWith('http')) return imagePath
    return `${process.env.NEXT_PUBLIC_API_URL}${imagePath}`
  }

  const calculateDiscount = () => {
    if (salePrice && originalPrice > salePrice) {
      return Math.round(((originalPrice - salePrice) / originalPrice) * 100)
    }
    return 0
  }

  const discount = calculateDiscount()

  return (
    <div 
       className={cn(
        "group relative bg-muted/20 overflow-hidden transition-all duration-300 hover:shadow-lg",
        className
      )}
      style={{ 
        border: 'none', 
        outline: 'none',
        backgroundColor: 'hsl(var(--muted) / 0.1)'
      }}
    >
      {/* Image Container */}
      <div className="relative aspect-square overflow-hidden bg-muted/30">
        <Link href={`/products/${product.id}`} className="block h-full">
          <img
            src={getImageUrl(mainImage)}
            alt={product.name}
            className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
            onError={(e) => {
              (e.target as HTMLImageElement).src = "/placeholder.svg"
            }}
          />
        </Link>
        
        {/* Discount Badge 
        {discount > 0 && (
          <Badge className="absolute top-3 left-3 bg-red-500 text-white font-bold px-2 py-1 text-xs rounded">
            {discount}% OFF
          </Badge>
        )}*/}

        {/* Wishlist button */}
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            "absolute right-3 top-3 rounded-full p-2 transition-all duration-200",
            isWishlisted 
              ? "bg-red-500 text-white hover:bg-red-600" 
              : "bg-white/80 text-gray-600 hover:bg-white hover:text-red-500"
          )}
          onClick={handleToggleWishlist}
          disabled={isWishlistLoading}
          style={{ border: 'none', outline: 'none' }}
        >
          <Heart 
            className={cn(
              "h-4 w-4 transition-all", 
              isWishlisted && "fill-current"
            )} 
          />
          <span className="sr-only">Toggle wishlist</span>
        </Button>
      </div>

      {/* Content */}
      <div className="p-4 space-y-2">
        {/* Product Name */}
        <Link href={`/products/${product.id}`} className="hover:no-underline">
          <h3 className="font-medium text-foreground line-clamp-2 text-sm leading-tight hover:text-primary transition-colors">
            {product.name}
          </h3>
        </Link>

        {/* Color/Variant Description */}
        <p className="text-xs text-muted-foreground">
          {firstVariant?.color || "Multiple Colors"}
        </p>
        
        {/* Remove the Rating section */}
        {/* <div className="flex items-center gap-1">
          <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
          <span className="text-xs font-medium text-foreground">{rating.toFixed(1)}</span>
        </div> */}

        {/* Price */}
        <div className="flex items-center gap-2">
          {salePrice ? (
            <>
              <span className="text-sm font-bold text-foreground">{salePrice.toFixed(0)} Da</span>
              <span className="text-xs text-muted-foreground line-through">{originalPrice.toFixed(0)} Da</span>
            </>
          ) : (
            <span className="text-sm font-bold text-foreground">{price.toFixed(0)} Da</span>
          )}
        </div>
      </div>
    </div>
  )
}

export default function ProductList({ allProducts }: { allProducts: Product[] }) {
  const searchParams = useSearchParams()

  // Get all filter params from URL as arrays
  const categories = searchParams?.getAll('category') || []
  const genders = searchParams?.getAll('gender') || []
  const isNew = searchParams?.has('new')
  const isOnSale = searchParams?.has('sale')
  const sort = searchParams?.get('sort')

  // Filter products client-side
  const filteredProducts = useMemo(() => {
    let result = [...allProducts]

    // Apply category filters (OR within category)
    if (categories.length > 0) {
      result = result.filter(product => categories.includes(product.category_id))
    }

    // Apply gender filters (OR within gender)
    if (genders.length > 0) {
      result = result.filter(product => genders.includes(product.gender))
    }

    // Apply special filters (AND between different attributes)
    if (isNew) {
      result = result.filter(product => product.is_new)
    }
    if (isOnSale) {
      result = result.filter(product => product.is_on_sale)
    }

    return result
  }, [allProducts, categories, genders, isNew, isOnSale])

  // Sort products
  const sortedProducts = useMemo(() => {
    const products = [...filteredProducts]
    
    if (sort === "price-asc") {
      products.sort((a, b) => {
        const priceA = a.variants?.[0]?.price || 0
        const priceB = b.variants?.[0]?.price || 0
        return priceA - priceB
      })
    } else if (sort === "price-desc") {
      products.sort((a, b) => {
        const priceA = a.variants?.[0]?.price || 0
        const priceB = b.variants?.[0]?.price || 0
        return priceB - priceA
      })
    } else if (sort === "newest") {
      products.sort((a, b) => {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      })
    }

    return products
  }, [filteredProducts, sort])

  return (
    <div>
      {/* Header with count and sort */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">
            Showing {sortedProducts.length} of {allProducts.length} products
          </p>
        </div>
        <ProductSort />
      </div>

      {/* Products Grid */}
      {sortedProducts.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
          {sortedProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="flex h-64 items-center justify-center rounded-lg border-2 border-dashed border-border bg-muted/20">
          <div className="text-center">
            <p className="text-lg font-medium text-muted-foreground mb-2">No products found</p>
            <p className="text-sm text-muted-foreground">Try adjusting your filters</p>
          </div>
        </div>
      )}
    </div>
  )
}