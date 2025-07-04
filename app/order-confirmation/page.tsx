import type { Metadata } from "next"
import Link from "next/link"
import { CheckCircle, Package, ShoppingBag } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

export const metadata: Metadata = {
  title: "Order Confirmation | Noctael",
  description: "Your order has been placed successfully.",
}

export default function OrderConfirmationPage() {
  // Generate a random order number
  const orderNumber = `NOC${Math.floor(Math.random() * 10000)
    .toString()
    .padStart(4, "0")}`

  return (
    <main className="flex-1 py-10">
      <div className="container max-w-2xl">
        <div className="mb-8 text-center">
          <CheckCircle className="mx-auto mb-4 h-16 w-16 text-green-500" />
          <h1 className="text-3xl font-bold">Thank You for Your Order!</h1>
          <p className="mt-2 text-gray-600">Your order has been placed successfully and is being processed.</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Order #{orderNumber}</CardTitle>
            <CardDescription>Placed on {new Date().toLocaleDateString()}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="rounded-lg bg-gray-50 p-4">
              <div className="flex items-center">
                <Package className="mr-2 h-5 w-5 text-gray-500" />
                <span className="font-medium">Shipping Update</span>
              </div>
              <p className="mt-2 text-sm text-gray-600">
                You will receive an email with tracking information once your order ships.
              </p>
            </div>

            <div>
              <h3 className="mb-2 font-medium">Shipping Address</h3>
              <p className="text-sm text-gray-600">
                John Doe
                <br />
                123 Main Street
                <br />
                Apt 4B
                <br />
                New York, NY 10001
                <br />          

              </p>
            </div>

            <div>
              <h3 className="mb-2 font-medium">Payment Method</h3>

              <p className="text-sm text-gray-600">Payment on Delivery</p>
              <p className="text-sm text-red-700">Keep in touch to confirm your order via a phone call</p>

            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button asChild className="w-full">
              <Link href="/account/orders">View Order Status</Link>
            </Button>
            <Button asChild variant="outline" className="w-full">
              <Link href="/products">
                <ShoppingBag className="mr-2 h-4 w-4" />
                Continue Shopping
              </Link>
            </Button>
          </CardFooter>
        </Card>

        <div className="mt-8 text-center text-sm text-gray-500">
          <p>
            Need help? Contact our customer support at{" "}
            <Link href="/contact" className="text-black underline">
              support@noctael.com
            </Link>
          </p>
        </div>
      </div>
    </main>
  )
}
