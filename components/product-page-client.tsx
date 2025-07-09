"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import ProductDetails from "@/components/product-details"
import type { Product, Variant } from "@/utils/api/products"

export default function ProductPageClient({ product }: { product: Product }) {
  const initialVariant = product.variants?.[0]

  const [selectedVariant, setSelectedVariant] = useState<Variant | undefined>(initialVariant)
  const [selectedImage, setSelectedImage] = useState<string | null>(initialVariant?.images?.[0]?.image_url || product.main_image || null)

  // When variant changes, reset selectedImage to the first image of that variant
  useEffect(() => {
    if (selectedVariant?.images?.[0]?.image_url) {
      setSelectedImage(selectedVariant.images[0].image_url)
    } else if (product.main_image) {
      setSelectedImage(product.main_image)
    }
  }, [selectedVariant, product.main_image])

  const variantImages = selectedVariant?.images?.map((img: { image_url: any }) => img.image_url).filter(Boolean) || []

  return (
    <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
      {/* Image Section */}
      <div className="space-y-4">
        {/* Main Image */}
        <div className="relative aspect-square overflow-hidden rounded-lg border">
          <Image
            src={selectedImage?.startsWith('/') ? `${process.env.NEXT_PUBLIC_API_URL}${selectedImage}` : selectedImage || "/placeholder.svg"}
            alt={product.name}
            fill
            className="object-cover transition-all duration-300"
            priority
            sizes="(max-width: 768px) 100vw, 50vw"
          />
        </div>

        {/* Thumbnails */}
        {variantImages.length > 1 && (
          <div className="grid grid-cols-4 gap-4">
            {variantImages.map((img, i) => (
              <button
                key={i}
                onClick={() => setSelectedImage(img)}
                className={`relative aspect-square overflow-hidden rounded-lg border-2 ${
                  selectedImage === img ? "border-black" : "border-transparent"
                }`}
              >
                <Image
                  src={img.startsWith('/') ? `${process.env.NEXT_PUBLIC_API_URL}${img}` : img}
                  alt={`Thumbnail ${i + 1}`}
                  fill
                  className="object-cover"
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Details */}
      <ProductDetails
        product={product}
        selectedVariant={selectedVariant}
        setSelectedVariant={setSelectedVariant}
      />
    </div>
  )
}
