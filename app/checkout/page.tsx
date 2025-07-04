import type { Metadata } from "next"

import CheckoutForm from "@/components/checkout-form"
import OrderSummary from "@/components/order-summary"

export const metadata: Metadata = {
  title: "Checkout | Noctael",
  description: "Complete your purchase.",
}

export default function CheckoutPage() {
  return (
    <main className="flex-1 py-10">
      <div className="container">
        <h1 className="mb-8 text-3xl font-bold">Checkout</h1>
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <CheckoutForm />
          </div>
          <div>
            <OrderSummary />
          </div>
        </div>
      </div>
    </main>
  )
}
