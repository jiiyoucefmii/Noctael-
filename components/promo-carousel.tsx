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
        const [saleProducts, newProducts] = await Promise.all([
          getSaleProducts(),
          getNewProducts(),
        ])

        const productMap = new Map<string, Product>()

        for (const p of saleProducts) {
          productMap.set(p.id, { ...p, is_on_sale: true })
        }

        for (const p of newProducts) {
          const existing = productMap.get(p.id)
          if (existing) {
            productMap.set(p.id, { ...existing, is_new: true })
          } else {
            productMap.set(p.id, { ...p, is_new: true })
          }
        }

        setProducts(Array.from(productMap.values()))
      } catch (error) {
        console.error("Error fetching products:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [])

  const next = () =>
    setCurrent((prev) => (products.length ? (prev + 1) % products.length : 0))
  const prev = () =>
    setCurrent((prev) => (products.length ? (prev - 1 + products.length) % products.length : 0))

  useEffect(() => {
    if (products.length > 0) {
      const interval = setInterval(next, 5000)
      return () => clearInterval(interval)
    }
  }, [current, products])

  const getImageUrl = (path: string) => {
    if (!path) return "/placeholder.svg"
    if (path.startsWith("http")) return path
    return `${process.env.NEXT_PUBLIC_API_URL || ""}${path}`
  }

  const getPromoLabel = (product: Product) => {
    const isNew = (product as any).is_new
    const isSale = product.is_on_sale
    if (isNew && isSale) return "New Arrival & On Sale"
    if (isNew) return "New Arrival"
    if (isSale) return "Special Sale Price"
    return ""
  }

  if (loading) {
    return <div className="aspect-[21/9] w-full bg-gray-200 animate-pulse rounded-lg" />
  }

  if (products.length === 0) {
    return (
      <div className="aspect-[21/9] w-full flex flex-col items-center justify-center rounded-lg bg-gradient-to-r from-purple-100 via-pink-100 to-yellow-100 text-center p-8">
        <div className="text-6xl mb-4">🎁</div>
        <h2 className="text-2xl font-semibold text-gray-700">No Specials Available</h2>
        <p className="text-gray-600 mt-2">Check back later for new arrivals and deals!</p>
      </div>
    )
  }
  

  return (
    <div className="relative overflow-hidden rounded-lg">
      <div
        className="flex transition-transform duration-500 ease-in-out"
        style={{ transform: `translateX(-${current * 100}%)` }}
      >
        {products.map((product) => (
          <div key={product.id} className="relative min-w-full">
            <div className="relative aspect-[4/3] sm:aspect-[16/9] md:aspect-[21/9] w-full">
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
                <p className="mt-2 text-lg">{getPromoLabel(product)}</p>
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
                className={cn(
                  "h-2 w-2 rounded-full bg-white/50 transition-all",
                  current === i && "w-4 bg-white"
                )}
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
