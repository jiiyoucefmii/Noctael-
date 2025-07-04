"use client"

import { useState, useEffect } from "react"
import { useParams, Link } from "react-router-dom"
import { ChevronRight, Home } from "lucide-react"

<<<<<<< HEAD
import { getProductById } from "../../lib/products"
import ProductDetails from "../../components/product-details"
import type { Product } from "../../types/product"
=======
import { getProductById } from "../lib/products"
import ProductDetails from "../components/product-details"
import type { Product } from "../types/product"
>>>>>>> master

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchProduct = async () => {
      if (id) {
        const productData = await getProductById(id)
        setProduct(productData || null)
        setLoading(false)
      }
    }

    fetchProduct()
  }, [id])

  if (loading) {
    return <div className="py-10 text-center">Loading...</div>
  }

  if (!product) {
    return <div className="py-10 text-center">Product not found</div>
  }

  return (
    <div className="py-10">
      <div className="container mx-auto px-4">
        {/* Breadcrumbs */}
        <nav className="mb-6 flex items-center space-x-1 text-sm text-gray-500">
          <Link to="/" className="flex items-center hover:text-gray-900">
            <Home className="mr-1 h-4 w-4" />
            Home
          </Link>
          <ChevronRight className="h-4 w-4" />
          <Link to="/products" className="hover:text-gray-900">
            Products
          </Link>
          <ChevronRight className="h-4 w-4" />
          <Link to={`/products?category=${product.category.toLowerCase()}`} className="hover:text-gray-900">
            {product.category}
          </Link>
          <ChevronRight className="h-4 w-4" />
          <span className="text-gray-900">{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          {/* Product Images */}
          <div className="space-y-4">
            <div className="relative aspect-square overflow-hidden rounded-lg">
              <img
                src={product.images[0] || "/placeholder.svg?height=600&width=600"}
                alt={product.name}
                className="h-full w-full object-cover"
              />
            </div>
            {product.images.length > 1 && (
              <div className="grid grid-cols-4 gap-4">
                {product.images.map((image, index) => (
                  <div key={index} className="relative aspect-square overflow-hidden rounded-lg">
                    <img
                      src={image || "/placeholder.svg?height=150&width=150"}
                      alt={`${product.name} - Image ${index + 1}`}
                      className="h-full w-full object-cover"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Product Details */}
          <ProductDetails product={product} />
        </div>
      </div>
    </div>
  )
}
