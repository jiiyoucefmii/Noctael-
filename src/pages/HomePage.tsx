'use client'

import Link from 'next/link'
import { ShoppingBag } from 'lucide-react'
import { Button } from '@/components/ui/button'
import dynamic from 'next/dynamic'

// Disable static optimization and SSR

// Dynamic imports (client-side only)
const FeaturedProducts = dynamic(() => import('@/components/featured-products'), { ssr: false })
const PromoCarousel = dynamic(() => import('@/components/promo-carousel'), { ssr: false })
const CategoryGrid = dynamic(() => import('@/components/category-grid'), { ssr: false })
const Newsletter = dynamic(() => import('@/components/newsletter'), { ssr: false })

export default function HomePage() {
  return (
    <div>
      {/* Hero Section */}
      <section className="relative h-[80vh] bg-black">
        <div className="absolute inset-0 bg-[url('/hero.jpg')] bg-cover bg-center opacity-60" />
        <div className="relative flex h-full flex-col items-center justify-center px-4 text-center">
          <div className="max-w-4xl mx-auto">
            <h1 className="mb-4 text-5xl font-bold tracking-tight text-white sm:text-6xl md:text-7xl">NOCTAEL</h1>
            <p className="mb-8 max-w-md mx-auto text-lg text-gray-200">
              Embrace the darkness with our premium clothing collection designed for the night dwellers.
            </p>
            <div className="flex flex-col space-y-4 sm:flex-row sm:space-x-4 sm:space-y-0 sm:justify-center">
              <Button asChild size="lg" className="bg-white text-black hover:bg-gray-200">
                <Link href={{ pathname: "/products", query: { gender: "men" } }}>
                  Shop Men
                </Link>
              </Button>
              <Button asChild size="lg" className="bg-white text-black hover:bg-gray-200">
                <Link href={{ pathname: "/products", query: { gender: "women" } }}>
                  Shop Women
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Promotional Carousel */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <PromoCarousel />
        </div>
      </section>

      {/* Featured Products */}
      <section className="bg-gray-50 py-16">
        <div className="container mx-auto px-4">
          <h2 className="mb-8 text-center text-3xl font-bold tracking-tight">Featured Collection</h2>
          <FeaturedProducts />
          <div className="mt-12 text-center">
            <Button asChild size="lg">
              <Link href="/products">
                View All Products <ShoppingBag className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="mb-8 text-center text-3xl font-bold tracking-tight">Shop by Category</h2>
          <CategoryGrid />
        </div>
      </section>

      {/* Newsletter */}
      <section className="bg-black py-16 text-white">
        <div className="container mx-auto px-4">
          <Newsletter />
        </div>
      </section>
    </div>
  )
}
