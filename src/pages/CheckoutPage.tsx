import CheckoutForm from "../../components/checkout-form"
import OrderSummary from "../../components/order-summary"


export default function CheckoutPage() {
  return (
    <div className="py-10">
      <div className="container mx-auto px-4">
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
    </div>
  )
}
