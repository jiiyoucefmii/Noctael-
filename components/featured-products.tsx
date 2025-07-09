"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Heart, ShoppingCart } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
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
    
    // If the imagePath is already a full URL, return it as-is
    if (imagePath.startsWith('http')) return imagePath;
    
    // Ensure we don't have double slashes between API URL and image path
    const apiUrl = process.env.NEXT_PUBLIC_API_URL?.endsWith('/') 
      ? process.env.NEXT_PUBLIC_API_URL.slice(0, -1) // Remove trailing slash if exists
      : process.env.NEXT_PUBLIC_API_URL;
    
    // Ensure image path starts with a slash
    const cleanImagePath = imagePath.startsWith('/') 
      ? imagePath 
      : `/${imagePath}`;
    
    return `${apiUrl}${cleanImagePath}`;
  }

  const handleAddToCart = (product: Product) => {
    // Use the first variant or default price
    const price = product.variants?.[0]?.price || product.variants?.[0]?.sale_price || 0
    addToCart({
      ...product,
      price,
      image: getImageUrl(product.main_image)
    })
    toast({
      title: "Added to cart",
      description: `${product.name} has been added to your cart.`,
    })
  }

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {products.map((product) => (
        <Card key={product.id} className="overflow-hidden group">
          <div className="relative aspect-square">
            <Link href={`/products/${product.id}`}>
              <img
                src={getImageUrl(product.main_image)}
                alt={product.name}
                className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "/placeholder.svg"
                }}
              />
            </Link>
            {product.is_new && (
              <Badge className="absolute right-2 top-2 bg-black text-white">New</Badge>
            )}
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
            <p className="mt-1 text-sm text-gray-500">
              {formatGender(product.gender)}
            </p>
            <p className="mt-2 font-semibold">
              ${product.variants?.[0]?.sale_price 
                ? product.variants[0].sale_price.toFixed(2)
                : product.variants?.[0]?.price.toFixed(2) || '0.00'}
            </p>
          </CardContent>
          <CardFooter className="p-4 pt-0">
            <Button 
              className="w-full" 
              asChild
              variant={product.variants?.[0]?.stock ? "default" : "outline"}
            >
              <Link href={`/products/${product.id}`}>
                {product.variants?.[0]?.stock ? "View Options" : "Out of Stock"}
              </Link>
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  )
}