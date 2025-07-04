"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { ChevronLeft, ChevronRight } from "lucide-react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const promos = [
  {
    id: 1,
    title: "Summer Sale",
    description: "Up to 50% off on selected items",
    image: "/images/promo-1.jpg",
    link: "/products?sale=true",
  },
  {
    id: 2,
    title: "New Arrivals",
    description: "Check out our latest collection",
    image: "/images/promo-2.jpg",
    link: "/products?new=true",
  },
  {
    id: 3,
    title: "Limited Edition",
    description: "Exclusive designs available for a limited time",
    image: "/images/promo-3.jpg",
    link: "/products?limited=true",
  },
]

export default function PromoCarousel() {
  const [current, setCurrent] = useState(0)

  const next = () => setCurrent((current + 1) % promos.length)
  const prev = () => setCurrent((current - 1 + promos.length) % promos.length)

  useEffect(() => {
    const interval = setInterval(next, 5000)
    return () => clearInterval(interval)
  }, [current])

  return (
    <div className="relative overflow-hidden rounded-lg">
      <div
        className="flex transition-transform duration-500 ease-in-out"
        style={{ transform: `translateX(-${current * 100}%)` }}
      >
        {promos.map((promo) => (
          <div key={promo.id} className="relative min-w-full">
            <div className="aspect-[21/9] w-full">
              <Image src={promo.image || "/placeholder.svg"} alt={promo.title} fill className="object-cover" />
            </div>
            <div className="absolute inset-0 flex items-center justify-center bg-black/40 p-6 text-center text-white">
              <div>
                <h3 className="text-3xl font-bold">{promo.title}</h3>
                <p className="mt-2 text-lg">{promo.description}</p>
                <Button asChild className="mt-4 bg-white text-black hover:bg-gray-200">
                  <Link href={promo.link}>Shop Now</Link>
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
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
        {promos.map((_, i) => (
          <button
            key={i}
            className={cn("h-2 w-2 rounded-full bg-white/50 transition-all", current === i && "w-4 bg-white")}
            onClick={() => setCurrent(i)}
          >
            <span className="sr-only">Go to slide {i + 1}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
