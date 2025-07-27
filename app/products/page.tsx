// app/products/page.tsx or src/pages/ProductsPage.tsx
import { Suspense } from "react"
import type { Metadata } from "next"

import ProductList from "@/components/product-list"
import ProductFilters from "@/components/product-filters"
import ProductSkeleton from "@/components/product-skeleton"
import { getProducts } from "@/utils/api/products"

export const dynamic = 'force-dynamic'


export const metadata: Metadata = {
  title: "Products | Noctael",
  description: "Browse our collection of premium clothing.",
}

export default async function ProductsPage() {
  // Fetch all products at build time or on server
  const allProducts = await getProducts()

  return (
    <main className="flex-1 bg-background min-h-screen">
      <div className="w-full max-w-[1600px] mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">Products</h1>
          <p className="text-muted-foreground text-lg">Discover our premium collection</p>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-8 xl:gap-12">
          {/* Sidebar Filters */}
          <div className="lg:sticky lg:top-6 lg:h-fit">
            <div className="bg-card rounded-xl p-6 shadow-sm" style={{ border: 'none', outline: 'none' }}>
              <ProductFilters />
            </div>
          </div>

          {/* Products Grid */}
          <div className="flex-1">
            <Suspense fallback={<ProductSkeleton />}>
              <ProductList allProducts={allProducts} />
            </Suspense>
          </div>
        </div>
      </div>
    </main>
  )
}