"use client"

import { useSearchParams } from "next/navigation"
import { useMemo } from "react"
import ProductCard from "@/components/product-card"
import ProductSort from "@/components/product-sort"
import type { Product } from "@/utils/api/products"

export default function ProductList({ allProducts }: { allProducts: Product[] }) {
  const searchParams = useSearchParams()

  // Get all filter params from URL as arrays
  const categories = searchParams?.getAll('category') || []
  const genders = searchParams?.getAll('gender') || []
  const isNew = searchParams?.has('new')
  const isOnSale = searchParams?.has('sale')
  const sort = searchParams?.get('sort')

  // Filter products client-side
  const filteredProducts = useMemo(() => {
    let result = [...allProducts]

    // Apply category filters (OR within category)
    if (categories.length > 0) {
      result = result.filter(product => categories.includes(product.category_id))
    }

    // Apply gender filters (OR within gender)
    if (genders.length > 0) {
      result = result.filter(product => genders.includes(product.gender))
    }

    // Apply special filters (AND between different attributes)
    if (isNew) {
      result = result.filter(product => product.is_new)
    }
    if (isOnSale) {
      result = result.filter(product => product.is_on_sale)
    }

    return result
  }, [allProducts, categories, genders, isNew, isOnSale])

  // Sort products (unchanged)
  const sortedProducts = useMemo(() => {
    const products = [...filteredProducts]
    
    if (sort === "price-asc") {
      products.sort((a, b) => {
        const priceA = a.variants?.[0]?.price || 0
        const priceB = b.variants?.[0]?.price || 0
        return priceA - priceB
      })
    } else if (sort === "price-desc") {
      products.sort((a, b) => {
        const priceA = a.variants?.[0]?.price || 0
        const priceB = b.variants?.[0]?.price || 0
        return priceB - priceA
      })
    } else if (sort === "newest") {
      products.sort((a, b) => {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      })
    }

    return products
  }, [filteredProducts, sort])

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <p className="text-sm text-gray-500">{sortedProducts.length} products</p>
        <ProductSort />
      </div>
      {sortedProducts.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {sortedProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="flex h-40 items-center justify-center rounded-lg border border-dashed">
          <p className="text-gray-500">No products found</p>
        </div>
      )}
    </div>
  )
}