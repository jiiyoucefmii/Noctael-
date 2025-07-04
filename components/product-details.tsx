"use client"

import { useState } from "react"
import { Heart, ShoppingBag, Truck } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { useCart } from "@/hooks/use-cart"
import type { Product } from "@/types/product"

export default function ProductDetails({ product }: { product: Product }) {
  const [selectedSize, setSelectedSize] = useState<string | undefined>(product.sizes?.[0])
  const [quantity, setQuantity] = useState(1)
  const { toast } = useToast()
  const { addToCart } = useCart()

  const handleAddToCart = () => {
    if (product.sizes && !selectedSize) {
      toast({
        title: "Please select a size",
        description: "You must select a size before adding to cart.",
        variant: "destructive",
      })
      return
    }

    addToCart(product, quantity, selectedSize)
    toast({
      title: "Added to cart",
      description: `${product.name} has been added to your cart.`,
    })
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">{product.name}</h1>
        <div className="mt-2 flex items-center">
          {product.isOnSale ? (
            <>

              <p className="text-2xl font-semibold">{product.salePrice?.toFixed(2)} Da</p>
              <p className="ml-2 text-lg text-gray-500 line-through">Da{product.price.toFixed(2)}</p>
              <Badge className="ml-2 bg-red-600 text-white">Sale</Badge>
            </>
          ) : (
            <p className="text-2xl font-semibold">{product.price.toFixed(2)} Da</p>
 
          )}
          {product.isNew && <Badge className="ml-2 bg-black text-white">New</Badge>}
        </div>
      </div>

      <p className="text-gray-600">{product.description}</p>

      {/* Size Selector */}
      {product.sizes && (
        <div>
          <label className="mb-2 block font-medium">Size</label>
          <Select value={selectedSize} onValueChange={setSelectedSize}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select a size" />
            </SelectTrigger>
            <SelectContent>
              {product.sizes.map((size) => (
                <SelectItem key={size} value={size}>
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
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
            onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
            disabled={quantity >= product.stock}
          >
            +
          </Button>
        </div>
      </div>

      {/* Add to Cart Button */}
      <div className="flex space-x-4">
        <Button className="flex-1" onClick={handleAddToCart}>
          <ShoppingBag className="mr-2 h-4 w-4" />
          Add to Cart
        </Button>
        <Button variant="outline" size="icon">
          <Heart className="h-5 w-5" />
          <span className="sr-only">Add to wishlist</span>
        </Button>
      </div>

      {/* Stock Status */}
      <div className="rounded-lg bg-gray-50 p-4">
        <div className="flex items-center text-sm">
          <Truck className="mr-2 h-5 w-5 text-gray-500" />
          {product.stock > 10 ? (
            <span>In Stock - Ready to Ship</span>
          ) : product.stock > 0 ? (
            <span className="text-amber-600">Low Stock - Only {product.stock} left</span>
          ) : (
            <span className="text-red-600">Out of Stock</span>
          )}
        </div>
      </div>

      {/* Additional Info */}
      <div className="space-y-4 border-t pt-6">
        <div>
          <h3 className="font-medium">Category</h3>
          <p className="text-gray-600">{product.category}</p>
        </div>
        {product.gender && (
          <div>
            <h3 className="font-medium">Gender</h3>
            <p className="text-gray-600">{product.gender}</p>
          </div>
        )}
      </div>
    </div>
  )
}
