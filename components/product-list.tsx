// components/product-list.tsx
"use client"

import { useSearchParams } from "next/navigation"
import { useMemo, useState } from "react"
import ProductSort from "@/components/product-sort"
import type { Product } from "@/utils/api/products"
import Link from "next/link"
import { Heart, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination"

interface ProductCardProps {
  product: Product
  className?: string
}

function ProductCard({ product, className }: ProductCardProps) {
  const { toast } = useToast()
  const [isWishlistLoading, setIsWishlistLoading] = useState(false)
  const [isWishlisted, setIsWishlisted] = useState(false)

  const firstVariant = product.variants?.[0]
  const price = firstVariant?.price || 0
  const salePrice = firstVariant?.sale_price
  const originalPrice = price
  const mainImage = product.main_image || firstVariant?.images?.[0]?.image_url || "/placeholder.svg"
  const isOutOfStock = firstVariant?.stock_quantity === 0

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

      <div className="p-4 space-y-2">
        <Link href={`/products/${product.id}`} className="hover:no-underline">
          <h3 className="font-medium text-foreground line-clamp-2 text-sm leading-tight hover:text-primary transition-colors">
            {product.name}
          </h3>
        </Link>

        <p className="text-xs text-muted-foreground">
          {firstVariant?.color || "Multiple Colors"}
        </p>
        
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

interface ProductListProps {
  allProducts: Product[]
  totalProducts: number
  pageSize?: number
}

export default function ProductList({ 
  allProducts, 
  totalProducts,
  pageSize = 12
}: ProductListProps) {
   const searchParams = useSearchParams()
  const currentPage = parseInt(searchParams?.get('page') || '1', 10) || 1

  // Get all filter params
  const categories = searchParams?.getAll('category') || []
  const genders = searchParams?.getAll('gender') || []
  const isNew = searchParams?.has('new')
  const isFeatured = searchParams?.has('featured')
  const isOnSale = searchParams?.has('sale')
  const sort = searchParams?.get('sort')

  // Filter products client-side
  const filteredProducts = useMemo(() => {
    let result = [...allProducts]

    // Apply category filters
    if (categories.length > 0) {
      result = result.filter(product => categories.includes(product.category_id))
    }

    // Apply gender filters
    if (genders.length > 0) {
      result = result.filter(product => genders.includes(product.gender))
    }

    // Apply special filters
    if (isNew) {
      result = result.filter(product => product.is_new)
    }
    if (isFeatured) {
      result = result.filter(product => product.is_featured)
    }
    if (isOnSale) {
      result = result.filter(product => product.is_on_sale)
    }

    return result
  }, [allProducts, categories, genders, isNew, isFeatured, isOnSale])

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

  // Pagination logic
  const totalFilteredProducts = sortedProducts.length
  const totalPages = Math.ceil(totalFilteredProducts / pageSize)
  const startIndex = (currentPage - 1) * pageSize
  const endIndex = Math.min(startIndex + pageSize, totalFilteredProducts)
  const paginatedProducts = sortedProducts.slice(startIndex, endIndex)

  // Generate page numbers for pagination
  const getPageNumbers = () => {
    const pages = []
    const maxVisiblePages = 5
    
    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      const half = Math.floor(maxVisiblePages / 2)
      let start = currentPage - half
      let end = currentPage + half

      if (start < 1) {
        start = 1
        end = maxVisiblePages
      } else if (end > totalPages) {
        end = totalPages
        start = totalPages - maxVisiblePages + 1
      }

      for (let i = start; i <= end; i++) {
        pages.push(i)
      }
    }

    return pages
  }

  const pageNumbers = getPageNumbers()

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">
            Showing {startIndex + 1}-{endIndex} of {totalFilteredProducts} products
            {totalFilteredProducts !== totalProducts && (
              <span className="text-muted-foreground/80"> (filtered from {totalProducts} total)</span>
            )}
          </p>
        </div>
        <ProductSort />
      </div>

      {paginatedProducts.length > 0 ? (
        <>
          <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
            {paginatedProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          {totalPages > 1 && (
            <div className="mt-8">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious 
                      href={`?${new URLSearchParams({
                        ...Object.fromEntries(searchParams?.entries() || []),
                        page: Math.max(1, currentPage - 1).toString()
                      })}`}
                      isActive={currentPage > 1}
                    />
                  </PaginationItem>

                  {pageNumbers[0] > 1 && (
                    <PaginationItem>
                      <PaginationLink href={`?${new URLSearchParams({
                        ...Object.fromEntries(searchParams?.entries() || []),
                        page: '1'
                      })}`}>
                        1
                      </PaginationLink>
                    </PaginationItem>
                  )}

                  {pageNumbers[0] > 2 && (
                    <PaginationItem>
                      <span className="px-4">...</span>
                    </PaginationItem>
                  )}

                  {pageNumbers.map((page) => (
                    <PaginationItem key={page}>
                      <PaginationLink
                        href={`?${new URLSearchParams({
                          ...Object.fromEntries(searchParams?.entries() || []),
                          page: page.toString()
                        })}`}
                        isActive={page === currentPage}
                      >
                        {page}
                      </PaginationLink>
                    </PaginationItem>
                  ))}

                  {pageNumbers[pageNumbers.length - 1] < totalPages - 1 && (
                    <PaginationItem>
                      <span className="px-4">...</span>
                    </PaginationItem>
                  )}

                  {pageNumbers[pageNumbers.length - 1] < totalPages && (
                    <PaginationItem>
                      <PaginationLink href={`?${new URLSearchParams({
                        ...Object.fromEntries(searchParams?.entries() || []),
                        page: totalPages.toString()
                      })}`}>
                        {totalPages}
                      </PaginationLink>
                    </PaginationItem>
                  )}

                  <PaginationItem>
                    <PaginationNext 
                      href={`?${new URLSearchParams({
                        ...Object.fromEntries(searchParams?.entries() || []),
                        page: Math.min(totalPages, currentPage + 1).toString()
                      })}`}
                      isActive={currentPage < totalPages}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </>
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