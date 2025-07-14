// app/page.tsx or src/pages/HomePage.tsx
import Link from "next/link" // or { Link } from "react-router-dom" for React Router
import { ShoppingBag } from "lucide-react"

import { Button } from "@/components/ui/button"
import FeaturedProducts from "@/components/featured-products"
import PromoCarousel from "@/components/promo-carousel"
import CategoryGrid from "@/components/category-grid"
import Newsletter from "@/components/newsletter"

export default function Home() {
  return (
    <main className="flex-1 bg-background text-foreground">
      {/* Hero Section - Enhanced for dark theme */}
      <section className="relative h-[80vh] bg-gradient-to-br from-gray-900 via-gray-800 to-black">
        <div className="absolute inset-0 bg-[url('/hero.jpg')] bg-cover bg-center opacity-30" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
        <div className="relative flex h-full flex-col items-center justify-center px-4 text-center">
          <div className="max-w-4xl mx-auto mb-8">
            <h1 className="mb-4 text-5xl font-bold tracking-tight sm:text-6xl md:text-7xl wave-text">
              <span className="bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent">N</span>
              <span className="bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent">O</span>
              <span className="bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent">C</span>
              <span className="bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent">T</span>
              <span className="bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent">A</span>
              <span className="bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent">E</span>
              <span className="bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent">L</span>
            </h1>
            <p className="mb-8 max-w-md mx-auto text-lg text-gray-200">
              Embrace the darkness with our premium clothing collection designed for the night dwellers.
            </p>
          </div>
          <div className="max-w-md w-full">
            <Newsletter />
          </div>
        </div>
      </section>
     

      {/* Promotional Carousel */}
      <section className="py-12 bg-background">
        <div className="container mx-auto px-4">
          <PromoCarousel />
        </div>
      </section>

      {/* Featured Products */}
      <section className="bg-background py-24">
        <div className="container mx-auto px-4 max-w-[1400px]">
          <h2 className="mb-16 text-center text-4xl font-bold tracking-tight text-foreground">Featured Collection</h2>
          <FeaturedProducts />
          <div className="mt-20 text-center">
            <Button asChild size="lg" className="bg-white text-black hover:bg-white/90 font-medium tracking-wide px-8 py-6">
              <Link href="/products">
                View All Products <ShoppingBag className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </main>
  )
}