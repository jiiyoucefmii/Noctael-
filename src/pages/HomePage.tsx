import { Link } from "react-router-dom"
import { ShoppingBag } from "lucide-react"

import { Button } from "../../components/ui/button"
import FeaturedProducts from "../../components/featured-products"
import PromoCarousel from "../../components/promo-carousel"
import CategoryGrid from "../../components/category-grid"
import Newsletter from "../../components/newsletter"


export default function HomePage() {
  return (
    <div>
      {/* Hero Section */}
      <section className="relative h-[80vh] bg-black">
        <div className="absolute inset-0 bg-[url('/images/hero-bg.jpg')] bg-cover bg-center opacity-60" />
        <div className="relative flex h-full flex-col items-center justify-center px-4 text-center">
          <div className="max-w-4xl mx-auto">
            <h1 className="mb-4 text-5xl font-bold tracking-tight text-white sm:text-6xl md:text-7xl">NOCTAEL</h1>
            <p className="mb-8 max-w-md mx-auto text-lg text-gray-200">
              Embrace the darkness with our premium clothing collection designed for the night dwellers.
            </p>
            <div className="flex flex-col space-y-4 sm:flex-row sm:space-x-4 sm:space-y-0 sm:justify-center">
              <Button asChild size="lg" className="bg-white text-black hover:bg-gray-200">
                <Link to="/products">Shop Men</Link>
              </Button>
              <Button asChild size="lg" className="bg-white text-black hover:bg-gray-200">
                <Link to="/products">Shop Women</Link>
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
              <Link to="/products">
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
