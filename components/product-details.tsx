"use client"

import { useState } from "react"
import { Heart, Loader2, ShoppingBag, Truck } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { useCart } from "@/hooks/use-cart"
import type { Product, Variant } from "@/utils/api/products"

interface ProductDetailsProps {
  product: Product
  selectedVariant: Variant | undefined
  setSelectedVariant: (variant: Variant) => void
}

export default function ProductDetails({
  product,
  selectedVariant,
  setSelectedVariant
}: ProductDetailsProps) {
  const [quantity, setQuantity] = useState(1)
  const { toast } = useToast()
  const { addToCart, isLoading } = useCart()

  const handleAddToCart = async () => {
    if (!selectedVariant) {
      toast({
        title: "Please select an option",
        description: "You must select a variant before adding to cart.",
        variant: "destructive",
      })
      return
    }

    try {
      await addToCart(product, quantity, selectedVariant.size, selectedVariant.id)

      toast({
        title: "Added to cart",
        description: `${product.name} (${selectedVariant.size}) has been added to your cart.`,
      })
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to add to cart",
        variant: "destructive"
      })
    }
  }

  const availableStock = selectedVariant?.stock || 0

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">{product.name}</h1>
        <div className="mt-2 flex items-center">
          {selectedVariant?.sale_price ? (
            <>
              <p className="text-2xl font-semibold">{Number(selectedVariant.sale_price).toFixed(2)} Da</p>
              <p className="ml-2 text-lg text-gray-500 line-through">
                {Number(selectedVariant.price).toFixed(2)} Da
              </p>
              <Badge className="ml-2 bg-red-600 text-white">Sale</Badge>
            </>
          ) : (
            <p className="text-2xl font-semibold">
              {Number(selectedVariant?.price || product.price).toFixed(2)} Da
            </p>
          )}
          {product.is_new && <Badge className="ml-2 bg-black text-white">New</Badge>}
        </div>
      </div>

      <p className="text-gray-600">{product.description}</p>

      {/* Color Selector */}
      {product.colors?.length > 1 && (
        <div>
          <label className="mb-2 block font-medium">Color</label>
          <div className="flex gap-2">
            {product.colors.map((color) => {
              const variantForColor = product.variants?.find(v => v.color === color)
              const isAvailable = variantForColor?.stock && variantForColor.stock > 0

              return (
                <Button
                  key={color}
                  variant="outline"
                  size="sm"
                  className={`capitalize ${selectedVariant?.color === color ? 'border-2 border-primary' : ''}`}
                  onClick={() => variantForColor && setSelectedVariant(variantForColor)}
                  disabled={!isAvailable}
                >
                  {color}
                  {!isAvailable && " (Out of Stock)"}
                </Button>
              )
            })}
          </div>
        </div>
      )}

      {/* Size Selector */}
      {product.sizes?.length > 1 && (
        <div>
          <label className="mb-2 block font-medium">Size</label>
          <div className="flex flex-wrap gap-2">
            {product.sizes.map((size) => {
              const variantForSize = product.variants?.find(v =>
                v.size === size &&
                (!selectedVariant?.color || v.color === selectedVariant.color)
              )
              const isAvailable = variantForSize?.stock && variantForSize.stock > 0

              return (
                <Button
                  key={size}
                  variant="outline"
                  size="sm"
                  disabled={!isAvailable}
                  className={`${selectedVariant?.size === size ? 'border-2 border-primary' : ''} ${!isAvailable ? 'opacity-50' : ''}`}
                  onClick={() => variantForSize && setSelectedVariant(variantForSize)}
                >
                  {size}
                  {!isAvailable && " (Out of Stock)"}
                </Button>
              )
            })}
          </div>
        </div>
      )}

      {/* Quantity Selector */}
      <div>
        <label className="mb-2 block font-medium">Quantity</label>
        <div className="flex items-center">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setQuantity(Math.max(1, quantity - 1))}
            disabled={quantity <= 1}
          >
            -
          </Button>
          <span className="w-12 text-center">{quantity}</span>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setQuantity(Math.min(availableStock, quantity + 1))}
            disabled={quantity >= availableStock}
          >
            +
          </Button>
        </div>
        {availableStock > 0 && (
          <p className="mt-1 text-sm text-gray-500">{availableStock} available in stock</p>
        )}
      </div>

      {/* Add to Cart Button */}
      <div className="flex space-x-4">
        <Button
          className="flex-1"
          onClick={handleAddToCart}
          disabled={!selectedVariant || isLoading || availableStock === 0}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Adding...
            </>
          ) : (
            <>
              <ShoppingBag className="mr-2 h-4 w-4" />
              {availableStock === 0 ? "Out of Stock" : "Add to Cart"}
            </>
          )}
        </Button>
        <Button variant="outline" size="icon">
          <Heart className="h-5 w-5" />
          <span className="sr-only">Add to wishlist</span>
        </Button>
      </div>

      {/* Stock Info */}
      <div className="rounded-lg bg-gray-50 p-4">
        <div className="flex items-center text-sm">
          <Truck className="mr-2 h-5 w-5 text-gray-500" />
          {selectedVariant ? (
            availableStock > 10 ? (
              <span>In Stock - Ready to Ship</span>
            ) : availableStock > 0 ? (
              <span className="text-amber-600">Low Stock - Only {availableStock} left</span>
            ) : (
              <span className="text-red-600">Out of Stock</span>
            )
          ) : (
            <span>Select an option to see availability</span>
          )}
        </div>
      </div>

      {/* Extra Info */}
      <div className="space-y-4 border-t pt-6">
        <div>
          <h3 className="font-medium">Category</h3>
          <p className="text-gray-600">{product.category_name}</p>
        </div>
        {product.gender && product.gender !== 'unisex' && (
          <div>
            <h3 className="font-medium">Gender</h3>
            <p className="text-gray-600 capitalize">{product.gender}</p>
          </div>
        )}
      </div>
    </div>
  )
}
