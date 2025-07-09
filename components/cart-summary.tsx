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
  const { subtotal, shipping, total, items } = useCart()
  const [isLoading, setIsLoading] = useState(false)
  const [promoLoading, setPromoLoading] = useState(false)
  const [promoCode, setPromoCode] = useState("")
  const [discount, setDiscount] = useState<{
    code: string
    percent: number
    amount: number
  } | null>(null)
  const [error, setError] = useState("")
  const router = useRouter()
  const { toast } = useToast()

  const handleCheckout = () => {
    if (items.length === 0) {
      toast({
        title: "Cart is empty",
        description: "Add some items to your cart before checking out.",
        variant: "destructive",
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

      setDiscount({
        code: response.discount_code,
        percent: response.discount_percent,
        amount: response.discount_amount
      })
    } catch (err) {
      setError("Invalid or expired promo code")
      setDiscount(null)
    } finally {
      setPromoLoading(false)
    }
  }

  const handleRemovePromo = () => {
    setPromoCode("")
    setDiscount(null)
    setError("")
  }

  const calculatedTotal = discount ? total - discount.amount : total

  return (
    <Card>
      <CardHeader>
        <CardTitle>Order Summary</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-between">
          <span>Subtotal</span>
          <span>{subtotal} Da</span>
        </div>

        {discount && (
          <div className="flex justify-between text-green-600">
            <span>Discount ({discount.percent}% off)</span>
            <span>-{discount.amount} Da</span>
          </div>
        )}

        <div className="flex justify-between">
          <span>Shipping</span>
          <span>{shipping === 0 ? "Free" : `${shipping} Da`}</span>
        </div>

        {/* Promo Code Input */}
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

        <div className="flex justify-between font-medium">
          <span>Total</span>
          <span>
            {calculatedTotal} Da
            {discount && (
              <span className="ml-2 text-sm text-gray-500 line-through">
                {total} Da
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