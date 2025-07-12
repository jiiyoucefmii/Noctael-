// app/account/orders/[id]/page.tsx

import Link from "next/link"
import Image from "next/image"
import { ChevronLeft, Package } from "lucide-react"
import { getOrderById } from "@/utils/api/orders"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface OrderDetailsPageProps {
  params: { id: string }
}

export default async function OrderDetailsPage({ params }: OrderDetailsPageProps) {
  const { order } = await getOrderById(params.id)

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })

  const formatPrice = (amount: number | string) =>
    `$${Number(amount).toFixed(2)}`

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-500"
      case "accepted":
        return "bg-green-500"
      case "shipped":
        return "bg-blue-500"
      default:
        return "bg-gray-500"
    }
  }

  return (
    <main className="flex-1 py-10">
      <div className="container max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <Button asChild variant="ghost" className="mb-4">
            <Link href="/account?tab=orders">
              <ChevronLeft className="mr-2 h-4 w-4" />
              Back to Orders
            </Link>
          </Button>
          <h1 className="text-3xl font-bold mb-1">Order #{order.id.slice(0, 8)}</h1>
          <p className="text-sm text-muted-foreground">Placed on {formatDate(order.created_at)}</p>
        </div>

        {/* Main grid */}
        <div className="grid gap-6 md:grid-cols-3">
          {/* Left side */}
          <div className="md:col-span-2 space-y-6">
            {/* Order Status */}
            <Card>
              <CardHeader>
                <CardTitle>Order Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4">
                  <div className="rounded-full bg-muted p-2">
                    <Package className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <Badge className={`capitalize ${getStatusColor(order.status)}`}>
                      {order.status}
                    </Badge>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Last updated: {formatDate(order.updated_at)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Order Items */}
            <Card>
              <CardHeader>
                <CardTitle>Items</CardTitle>
              </CardHeader>
              <CardContent className="divide-y">
                {order.items.map((item) => (
                  <div key={item.id} className="flex gap-4 py-4">
                    <div className="relative h-20 w-20 rounded-md overflow-hidden flex-shrink-0">
                      <Image
                        src={item.image || "/placeholder.svg"}
                        alt={item.product_name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between">
                        <div>
                          <h3 className="font-medium">
                            <Link href={`/products/${item.product_id}`} className="hover:underline">
                              {item.product_name}
                            </Link>
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            Size: {item.size} | Color: {item.color}
                          </p>
                        </div>
                        <p className="font-medium">{formatPrice(item.price)}</p>
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground">Qty: {item.quantity}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Right side */}
          <div className="space-y-6">
            {/* Order Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>{formatPrice(order.subtotal)}</span>
                </div>
                {order.discount_amount && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount</span>
                    <span>-{formatPrice(order.discount_amount)}</span>
                  </div>
                )}
                <div className="border-t pt-3 flex justify-between font-medium text-base">
                  <span>Total</span>
                  <span>{formatPrice(order.total)}</span>
                </div>
                <div className="pt-2 text-xs text-muted-foreground">Payment Method: Payment on Delivery</div>
              </CardContent>
            </Card>

            {/* Shipping Info */}
            <Card>
              <CardHeader>
                <CardTitle>Shipping Address</CardTitle>
              </CardHeader>
              <CardContent className="text-sm space-y-1">
                <p className="font-medium">{order.first_name} {order.last_name}</p>
                <p className="text-muted-foreground">{order.shipping_address}</p>
                <p className="text-muted-foreground">
                  {order.shipping_city}, {order.shipping_state} {order.shipping_zip}
                </p>
                <p className="text-muted-foreground">{order.shipping_country}</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </main>
  )
}
