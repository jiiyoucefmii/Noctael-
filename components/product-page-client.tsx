"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import ProductDetails from "@/components/product-details"
import type { Product, ProductVariant } from "@/utils/api/products"
import { useCart } from "@/hooks/use-cart"
import { useToast } from "@/hooks/use-toast"

export default function ProductPageClient({ product }: { product: Product }) {
  const { addToCart } = useCart()
  const { toast } = useToast()
  const initialVariant = product.variants?.[0]
  const initialImage = initialVariant?.images?.[0]?.image_url || product.main_image || "/placeholder.svg"

  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | undefined>(initialVariant)
  const [selectedImage, setSelectedImage] = useState<string>(initialImage)
  const [quantity, setQuantity] = useState(1)
  const [isAddingToCart, setIsAddingToCart] = useState(false)

  // When variant changes, update selected image
  useEffect(() => {
    const newImage = selectedVariant?.images?.[0]?.image_url || product.main_image || "/placeholder.svg"
    setSelectedImage(newImage)
  }, [selectedVariant, product.main_image])

  const handleAddToCart = async () => {
    if (!selectedVariant) {
      toast({
        title: "Please select a variant",
        variant: "destructive"
      })
      return
    }

    setIsAddingToCart(true)
    try {
      await addToCart(selectedVariant.id ?? "", quantity)
      toast({
        title: "Added to cart",
        description: `${product.name} (${selectedVariant.color}, ${selectedVariant.size}) has been added to your cart`
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add to cart",
        variant: "destructive"
      })
    } finally {
      setIsAddingToCart(false)
    }
  }

  // Get all images for the current variant or fallback to product images
  const variantImages = selectedVariant?.images?.map(img => img.image_url).filter(Boolean) || 
                       (product.main_image ? [product.main_image] : [])

  // Helper function to get complete image URL
  const getImageUrl = (imgPath: string | undefined) => {
    if (!imgPath) return "/placeholder.svg"
    return imgPath.startsWith('/') 
      ? `${process.env.NEXT_PUBLIC_API_URL}${imgPath}`
      : imgPath
  }

  return (
    <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
      {/* Image Section */}
      <div className="space-y-4">
        {/* Main Image */}
        <div className="relative aspect-square overflow-hidden rounded-lg border">
          <Image
            src={getImageUrl(selectedImage)}
            alt={product.name}
            fill
            className="object-cover transition-all duration-300"
            priority
            sizes="(max-width: 768px) 100vw, 50vw"
            onError={(e) => {
              (e.target as HTMLImageElement).src = "/placeholder.svg"
            }}
          />
        </div>

        {/* Thumbnails - Only show if we have multiple images */}
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
                  src={getImageUrl(img)}
                  alt={`${product.name} thumbnail ${i + 1}`}
                  fill
                  className="object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "/placeholder.svg"
                  }}
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Product Details Section */}
      <ProductDetails
        product={product}
        selectedVariant={selectedVariant}
        onVariantChange={setSelectedVariant}
        quantity={quantity}
        onQuantityChange={setQuantity}
        onAddToCart={handleAddToCart}
        isAddingToCart={isAddingToCart}
      />
    </div>
  )
}