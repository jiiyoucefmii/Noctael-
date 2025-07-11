import { Suspense } from "react"
import type { Metadata } from "next"

import ProductList from "@/components/product-list"
import ProductFilters from "@/components/product-filters"
import ProductSkeleton from "@/components/product-skeleton"
import { getProducts } from "@/utils/api/products"

export const metadata: Metadata = {
  title: "Products | Noctael",
  description: "Browse our collection of premium clothing.",
}

export default async function ProductsPage() {
  // Fetch all products at build time or on server
  const allProducts = await getProducts()

  return (
    <main className="flex-1 py-10">
      <div className="container mx-auto px-4">
        <h1 className="mb-8 text-3xl font-bold text-center lg:text-left">Products</h1>
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[240px_1fr]">
          <div className="lg:sticky lg:top-24 lg:h-fit">
            <ProductFilters />
          </div>
          <div>
            <Suspense fallback={<ProductSkeleton />}>
              <ProductList allProducts={allProducts} />
            </Suspense>
          </div>
        </div>
      </div>
    </main>
  )
}