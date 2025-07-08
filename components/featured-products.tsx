"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { Heart, ShoppingCart } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { useCart } from "@/hooks/use-cart"
import { getFeaturedProducts, type Product } from "@/utils/api/products"

// Helper function to format gender for display
function formatGender(gender?: string): string {
  if (!gender) return "Unisex";
  
  return gender.charAt(0).toUpperCase() + gender.slice(1);
}

export default function FeaturedProducts() {
  const [products, setProducts] = useState<Product[]>([])
  const { toast } = useToast()
  const { addToCart } = useCart()

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const featuredProducts = await getFeaturedProducts(4)
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

  const handleAddToCart = (product: Product) => {
    addToCart(product)
    toast({
      title: "Added to cart",
      description: `${product.name} has been added to your cart.`,
    })
  }

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {products.map((product) => (
        <Card key={product.id} className="overflow-hidden">
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
              ${typeof product.price === 'number' 
                ? product.price.toFixed(2) 
                : parseFloat(product.price).toFixed(2)}
            </p>
          </CardContent>
          <CardFooter className="p-4 pt-0">
            <Button className="w-full" onClick={() => handleAddToCart(product)}>
              <ShoppingCart className="mr-2 h-4 w-4" />
              Add to Cart
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  )
}
