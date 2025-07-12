"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"
import { Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Input } from "@/components/ui/input"
import { useCart } from "@/hooks/use-cart"
import { useToast } from "@/hooks/use-toast"
import { calculateDiscount } from "@/utils/api/promos"

export default function CartSummary() {
  const {
    items,
    subtotal,
    total,
    discount,
    applyDiscount,
    removeDiscount
  } = useCart()

  const [isLoading, setIsLoading] = useState(false)
  const [promoLoading, setPromoLoading] = useState(false)
  const [promoCode, setPromoCode] = useState("")
  const [error, setError] = useState("")
  const router = useRouter()
  const { toast } = useToast()

  const handleCheckout = () => {
    if (items.length === 0) {
      toast({
        title: "Cart is empty",
        description: "Add some items to your cart before checking out.",
        variant: "destructive"
      })
      return
    }
    setIsLoading(true)
    router.push("/checkout")
  }

  const handleApplyPromo = async () => {
    if (!promoCode.trim()) return

    setPromoLoading(true)
    setError("")
    try {
      const response = await calculateDiscount({
        code: promoCode,
        subtotal
      })
      applyDiscount({
        code: response.discount_code,
        percent: response.discount_percent,
        amount: response.discount_amount
      })
    } catch (err) {
      setError("Invalid or expired promo code")
      removeDiscount()
    } finally {
      setPromoLoading(false)
    }
  }

  const handleRemovePromo = () => {
    setPromoCode("")
    removeDiscount()
    setError("")
  }

  const calculatedTotal = Math.max(0, total)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Order Summary</CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="flex justify-between">
          <span>Subtotal</span>
          <span>{Number(subtotal).toFixed(2)} Da</span>
        </div>

        {discount && discount.amount > 0 && (
          <div className="flex justify-between text-green-600">
            <span>Discount ({discount.percent}% off)</span>
            <span>-{Number(discount.amount).toFixed(2)} Da</span>
          </div>
        )}

        <div className="space-y-2">
          <div className="flex gap-2">
            <Input
              placeholder="Promo code"
              value={promoCode}
              onChange={(e) => setPromoCode(e.target.value)}
              disabled={promoLoading || !!discount}
            />
            {discount ? (
              <Button
                variant="outline"
                onClick={handleRemovePromo}
                disabled={promoLoading}
              >
                Remove
              </Button>
            ) : (
              <Button
                variant="outline"
                onClick={handleApplyPromo}
                disabled={promoLoading || !promoCode.trim()}
              >
                {promoLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Apply"
                )}
              </Button>
            )}
          </div>
          {error && <p className="text-sm text-red-500">{error}</p>}
        </div>

        <Separator />

        <div className="flex justify-between font-medium text-lg">
          <span>Total</span>
          <span>
            {Number(calculatedTotal).toFixed(2)} Da
            {discount?.amount > 0 && (
              <span className="ml-2 text-sm text-gray-500 line-through">
                {Number(subtotal).toFixed(2)} Da
              </span>
            )}
          </span>
        </div>
      </CardContent>

      <CardFooter>
        <Button
          className="w-full"
          onClick={handleCheckout}
          disabled={isLoading || items.length === 0}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            "Proceed to Checkout"
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}