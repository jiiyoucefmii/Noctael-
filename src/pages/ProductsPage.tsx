"use client"

import { Suspense } from "react"
import { useSearchParams } from "react-router-dom"

<<<<<<< HEAD
import ProductList from "../../components/product-list"
import ProductFilters from "../../components/product-filters"
import ProductSkeleton from "../../components/product-skeleton"
=======
import ProductList from "../components/product-list"
import ProductFilters from "../components/product-filters"
import ProductSkeleton from "../components/product-skeleton"
>>>>>>> master

export default function ProductsPage() {
  const [searchParams] = useSearchParams()

  const searchParamsObj = Object.fromEntries(searchParams.entries())

  return (
    <div className="py-10">
      <div className="container mx-auto px-4">
        <h1 className="mb-8 text-3xl font-bold text-center lg:text-left">Products</h1>
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[240px_1fr]">
          <div className="lg:sticky lg:top-24 lg:h-fit">
            <ProductFilters />
          </div>
          <div>
            <Suspense fallback={<ProductSkeleton />}>
              <ProductList searchParams={searchParamsObj} />
            </Suspense>
          </div>
        </div>
      </div>
    </div>
  )
}
