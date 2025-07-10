"use client"

import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { CheckCircle, Package, ShoppingBag } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useEffect, useState } from "react"
import { getOrderById } from "@/utils/api/orders"
import { Order } from "@/utils/api/orders"
import { useToast } from "@/hooks/use-toast"

export default function OrderConfirmationPage() {
  const searchParams = useSearchParams()
  const orderId = searchParams?.get("orderId")
  const { toast } = useToast()
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!orderId) return

    const fetchOrder = async () => {
      try {
        setLoading(true)
        const { order } = await getOrderById(orderId)
        console.log(orderId)
        console.log("helloooooo")
        console.log(order)
        setOrder(order)
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load order details",
          variant: "destructive"
        })
      } finally {
        setLoading(false)
      }
    }

    fetchOrder()
  }, [orderId, toast])

  if (loading) {
    return (
      <div className="py-10">
        <div className="container mx-auto px-4 max-w-2xl">
          <div className="text-center">Loading order details...</div>
        </div>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="py-10">
        <div className="container mx-auto px-4 max-w-2xl">
          <div className="text-center">Order not found</div>
        </div>
      </div>
    )
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  return (
    <div className="py-10">
      <div className="container mx-auto px-4 max-w-2xl">
        <div className="mb-8 text-center">
          <CheckCircle className="mx-auto mb-4 h-16 w-16 text-green-500" />
          <h1 className="text-3xl font-bold">Thank You for Your Order!</h1>
          <p className="mt-2 text-gray-600">Your order has been placed successfully and is being processed.</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Order #{order.id}</CardTitle>
            <CardDescription>Placed on {formatDate(order.created_at)}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="rounded-lg bg-gray-50 p-4">
              <div className="flex items-center">
                <Package className="mr-2 h-5 w-5 text-gray-500" />
                <span className="font-medium">Order Status: {order.status}</span>
              </div>
              <p className="mt-2 text-sm text-gray-600">
                {order.status === 'pending' 
                  ? "Your order is being processed. You'll receive an email with tracking information once it ships."
                  : "Your order has been accepted and is being prepared for shipment."}
              </p>
            </div>

            <div>
              <h3 className="mb-2 font-medium">Order Summary</h3>
              <div className="space-y-2">
                {order.items.map(item => (
                  <div key={item.id} className="flex justify-between">
                    <div>
                      <p>{item.product_name}</p>
                      {item.product_color && item.product_size && (
                        <p className="text-sm text-gray-500">
                          {item.product_color}, {item.product_size}
                        </p>
                      )}
                    </div>
                    <p>{item.price.toFixed(2)} DA × {item.quantity}</p>
                  </div>
                ))}
              </div>
              <div className="mt-4 pt-4 border-t">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>{order.subtotal.toFixed(2)} DA</span>
                </div>
                {order.discount_amount && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount</span>
                    <span>-{order.discount ? String(order.discount) : "0.00"} DA</span>
                  </div>
                )}
                <div className="flex justify-between font-medium mt-2">
                  <span>Total</span>
                  <span>{order.total.toFixed(2)} DA</span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="mb-2 font-medium">Shipping Address</h3>
              <p className="text-sm text-gray-600">
                {order.shipping_address.name}
                <br />
                {order.shipping_address.address}
                <br />
                {order.shipping_address.city}, {order.shipping_address.state} {order.shipping_address.zip}
                <br />
                {order.shipping_address.country}
              </p>
            </div>

            <div>
              <h3 className="mb-2 font-medium">Payment Method</h3>
              <p className="text-sm text-gray-600">Credit Card</p>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button asChild className="w-full">
              <Link href={`/account/orders/${order.id}`}>View Order Details</Link>
            </Button>
            <Button asChild variant="outline" className="w-full bg-transparent">
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
    </div>
  )
}