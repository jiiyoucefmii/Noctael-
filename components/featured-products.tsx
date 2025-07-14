"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Heart, Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { useCart } from "@/hooks/use-cart"
import { getFeaturedProductsWithLimit, type Product } from "@/utils/api/products"

function formatGender(gender?: string): string {
  if (!gender) return "Unisex"
  return gender.charAt(0).toUpperCase() + gender.slice(1)
}

export default function FeaturedProducts() {
  const [products, setProducts] = useState<Product[]>([])
  const { toast } = useToast()
  const { addToCart } = useCart()
  const [wishlistLoading, setWishlistLoading] = useState<number | null>(null)

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const featuredProducts = await getFeaturedProductsWithLimit(4)
        setProducts(featuredProducts)
      } catch (error) {
        console.error("Failed to fetch featured products:", error)
        toast({
          title: "Error",
          description: "Failed to load featured products. Please try again later.",
          variant: "destructive"
        })
      }
    }

    fetchProducts()
  }, [toast])

  const getImageUrl = (imagePath: string) => {
    if (!imagePath) return "/placeholder.svg";

    if (imagePath.startsWith('http')) return imagePath;

    const apiUrl = process.env.NEXT_PUBLIC_API_URL?.endsWith('/')
      ? process.env.NEXT_PUBLIC_API_URL.slice(0, -1)
      : process.env.NEXT_PUBLIC_API_URL;

    const cleanImagePath = imagePath.startsWith('/')
      ? imagePath
      : `/${imagePath}`;

    return `${apiUrl}${cleanImagePath}`;
  }

  const handleAddToWishlist = async (product: Product) => {
    setWishlistLoading(product.id)
    try {
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
      setWishlistLoading(null)
    }
  }

  return (
    <div className="grid grid-cols-1 gap-x-4 gap-y-12 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {products.map((product) => {
        const price = product.variants?.[0]?.price || 0
        const salePrice = product.variants?.[0]?.sale_price
        const stock = product.variants?.[0]?.stock

        return (
          <Card key={product.id} className="overflow-hidden border-0 shadow-none group relative bg-transparent hover:shadow-sm transition-all duration-300">
            <div className="relative aspect-[3/4] bg-neutral-900/50">
              <Link href={`/products/${product.id}`} className="block h-full">
                <img
                  src={getImageUrl(product.main_image)}
                  alt={product.name}
                  className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "/placeholder.svg"
                  }}
                />
              </Link>

              {product.is_new && (
                <Badge className="absolute bottom-2 left-2 bg-white text-black font-medium px-3 py-1 rounded-sm">NEW</Badge>
              )}

              <Button
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2 rounded-full bg-white/80 text-black hover:bg-white"
                onClick={() => handleAddToWishlist(product)}
                disabled={wishlistLoading === product.id}
              >
                {wishlistLoading === product.id ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Heart className="h-5 w-5" />
                )}
                <span className="sr-only">Add to wishlist</span>
              </Button>

              <div className="absolute inset-0 flex items-end justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 pb-4">
                <Button
                  className="w-11/12 bg-white text-black hover:bg-white/90 font-medium tracking-wide"
                  asChild
                  disabled={!stock}
                >
                  <Link href={`/products/${product.id}`}>
                    {stock ? "View Options" : "Out of Stock"}
                  </Link>
                </Button>
              </div>
            </div>

            <CardContent className="p-4 pt-5 space-y-1 text-center">
              <h3 className="font-bold text-base line-clamp-1 text-center">{product.name}</h3>
              <p className="text-sm text-muted-foreground font-light text-center">{formatGender(product.gender)}</p>
              <p className="font-bold text-base pt-1 text-center">
                {salePrice ? salePrice.toFixed(0) : price.toFixed(0)} Da
              </p>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
