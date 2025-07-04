import { getProducts } from "@/lib/products"
import ProductCard from "@/components/product-card"
import ProductSort from "@/components/product-sort"

export default async function ProductList({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  const category = searchParams.category as string | undefined
  const gender = searchParams.gender as "men" | "women" | "unisex" | undefined
  const isNew = searchParams.new === "true"
  const isOnSale = searchParams.sale === "true"
  const sort = searchParams.sort as string | undefined

  const products = await getProducts({
    category,
    gender,
    new: isNew,
    sale: isOnSale,
  })

  // Sort products
  let sortedProducts = [...products]
  if (sort === "price-asc") {
    sortedProducts.sort((a, b) => a.price - b.price)
  } else if (sort === "price-desc") {
    sortedProducts.sort((a, b) => b.price - a.price)
  } else if (sort === "newest") {
    sortedProducts = sortedProducts.filter((p) => p.isNew).concat(sortedProducts.filter((p) => !p.isNew))
  }

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
