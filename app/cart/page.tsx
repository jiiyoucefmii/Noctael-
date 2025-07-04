import type { Metadata } from "next"
import Link from "next/link"
import { ShoppingBag } from "lucide-react"

import { Button } from "@/components/ui/button"
import CartItems from "@/components/cart-items"
import CartSummary from "@/components/cart-summary"

export const metadata: Metadata = {
  title: "Shopping Cart | Noctael",
  description: "View and manage your shopping cart.",
}

export default function CartPage() {
  return (
    <main className="flex-1 py-10">
      <div className="container">
        <h1 className="mb-8 text-3xl font-bold">Shopping Cart</h1>
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <CartItems />
          </div>
          <div>
            <CartSummary />
          </div>
        </div>
        <div className="mt-8 text-center">
          <p className="mb-4 text-sm text-gray-500">
            Need help? Contact our customer support at{" "}
            <Link href="/contact" className="text-black underline">
              support@noctael.com
            </Link>
          </p>
          <Button asChild variant="outline">
            <Link href="/products">
              <ShoppingBag className="mr-2 h-4 w-4" />
              Continue Shopping
            </Link>
          </Button>
        </div>
      </div>
    </main>
  )
}
