"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Product, getNewProducts, getSaleProducts } from "@/utils/api/products"

export default function PromoCarousel() {
  const [current, setCurrent] = useState(0)
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        // Fetch both sale and new products
        const [saleProducts, newProducts] = await Promise.all([
          getSaleProducts(),
          getNewProducts()
        ])
        
        // Combine and shuffle the products
        const combinedProducts = [...saleProducts, ...newProducts]
        setProducts(combinedProducts)
      } catch (error) {
        console.error("Error fetching products:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [])

  const next = () => setCurrent((current + 1) % products.length)
  const prev = () => setCurrent((current - 1 + products.length) % products.length)

  useEffect(() => {
    if (products.length > 0) {
      const interval = setInterval(next, 5000)
      return () => clearInterval(interval)
    }
  }, [current, products])

  if (loading) return <div className="aspect-[21/9] w-full bg-gray-200 animate-pulse rounded-lg" />

  if (products.length === 0) return null

  // Helper function to construct image URL
  const getImageUrl = (path: string) => {
    if (!path) return "/placeholder.svg";
    // If path is already a full URL, return as-is
    if (path.startsWith('http')) return path;
    // Prepend API URL to paths starting with /
    return `${process.env.NEXT_PUBLIC_API_URL || ''}${path}`;
  };

  return (
    <div className="relative overflow-hidden rounded-lg">
      <div
        className="flex transition-transform duration-500 ease-in-out"
        style={{ transform: `translateX(-${current * 100}%)` }}
      >
        {products.map((product) => (
          <div key={product.id} className="relative min-w-full">
            <div className="aspect-[21/9] w-full">
              <Image 
                src={getImageUrl(product.main_image)} 
                alt={product.name} 
                fill 
                className="object-cover" 
              />
            </div>
            <div className="absolute inset-0 flex items-center justify-center bg-black/40 p-6 text-center text-white">
              <div>
                <h3 className="text-3xl font-bold">{product.name}</h3>
                <p className="mt-2 text-lg">
                  {product.is_on_sale ? "Special Sale Price" : "New Arrival"}
                </p>
                <Button asChild className="mt-4 bg-white text-black hover:bg-gray-200">
                  <Link href={`/products/${product.id}`}>View Product</Link>
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {products.length > 1 && (
        <>
          <Button
            variant="ghost"
            size="icon"
            className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-white/80 text-black hover:bg-white"
            onClick={prev}
          >
            <ChevronLeft className="h-6 w-6" />
            <span className="sr-only">Previous slide</span>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-white/80 text-black hover:bg-white"
            onClick={next}
          >
            <ChevronRight className="h-6 w-6" />
            <span className="sr-only">Next slide</span>
          </Button>
          <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 space-x-2">
            {products.map((_, i) => (
              <button
                key={i}
                className={cn("h-2 w-2 rounded-full bg-white/50 transition-all", current === i && "w-4 bg-white")}
                onClick={() => setCurrent(i)}
              >
                <span className="sr-only">Go to slide {i + 1}</span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}