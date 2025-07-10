import { notFound } from "next/navigation"
import type { Metadata } from "next"
import Link from "next/link"
import { ChevronRight, Home } from "lucide-react"

import { getProductById } from "@/utils/api/products"
import ProductPageClient from "@/components/product-page-client"

interface ProductPageProps {
  params: {
    id: string
  }
}

export async function generateMetadata(props: { params: Promise<ProductPageProps["params"]> }): Promise<Metadata> {
  try {
    const { params } = await props;
    const product = await getProductById((await params).id)
    
    if (!product) {
      return {
        title: "Product Not Found | Noctael",
      }
    }

    const imageUrl = product.main_image?.startsWith('/')
      ? `${process.env.NEXT_PUBLIC_API_URL}${product.main_image}`
      : product.main_image

    return {
      title: `${product.name} | Noctael`,
      description: product.description,
      openGraph: {
        images: imageUrl ? [imageUrl] : [],
      },
    }
  } catch (error) {
    console.error("Error generating metadata:", error)
    return {
      title: "Product Page | Noctael",
    }
  }
}

export default async function ProductPage({ params }: ProductPageProps) {
  try {
    const product = await getProductById(params.id)
    if (!product) notFound()

    return (
      <div className="container py-10">
        {/* Breadcrumbs */}
        <nav className="mb-6 flex items-center space-x-1 text-sm text-gray-500">
          <Link href="/" className="flex items-center hover:text-gray-900">
            <Home className="mr-1 h-4 w-4" />
            Home
          </Link>
          <ChevronRight className="h-4 w-4" />
          <Link href="/products" className="hover:text-gray-900">Products</Link>
          <ChevronRight className="h-4 w-4" />
          <Link
            href={`/products?category=${product.category_name?.toLowerCase()}`}
            className="hover:text-gray-900"
          >
            {product.category_name}
          </Link>
          <ChevronRight className="h-4 w-4" />
          <span className="text-gray-900 line-clamp-1">{product.name}</span>
        </nav>

        <ProductPageClient product={product} />
      </div>
    )
  } catch (error) {
    console.error("Error loading product:", error)
    notFound()
  }
}