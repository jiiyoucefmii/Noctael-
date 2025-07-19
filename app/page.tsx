// app/page.tsx or src/pages/HomePage.tsx
import Link from "next/link" // or { Link } from "react-router-dom" for React Router
import { ShoppingBag } from "lucide-react"

import { Button } from "@/components/ui/button"
import FeaturedProducts from "@/components/featured-products"
import PromoCarousel from "@/components/promo-carousel"
import CategoryGrid from "@/components/category-grid"
import HeroSection from "@/components/HeroSection"

export default function Home() {
  return (
    <main className="flex-1 bg-background text-foreground">
      {/* Hero Section with Shadow effect */}
      <HeroSection />
     
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