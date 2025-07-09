"use client"

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { CheckCircle, Loader2, Package, ShoppingBag } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { getOrderById } from "@/utils/api/orders"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"
import { format } from "date-fns"

export default function OrderConfirmation() {
  const searchParams = useSearchParams()
  const orderId = searchParams?.get('orderId')
  const [order, setOrder] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    if (orderId) {
      const fetchOrder = async () => {
        try {
          const response = await getOrderById(orderId)
          setOrder(response.order)
        } catch (error: any) {
          console.error('Failed to fetch order:', error)
          toast({
            title: "Error",
            description: error.message || "Failed to load order details",
            variant: "destructive"
          })
        } finally {
          setLoading(false)
        }
      }
      fetchOrder()
    } else {
      setLoading(false)
    }
  }, [orderId])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin" />
          <p>Loading order details...</p>
        </div>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <Package className="h-12 w-12 text-gray-400" />
        <h2 className="text-xl font-semibold">Order not found</h2>
        <p className="text-gray-500">We couldn't find the order you're looking for</p>
        <Button asChild>
          <Link href="/">Continue Shopping</Link>
        </Button>
      </div>
    )
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
            <CardDescription>
              Placed on {format(new Date(order.created_at), 'MMMM d, yyyy')}
              <br />
              Status: <span className="capitalize">{order.status}</span>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="rounded-lg bg-gray-50 p-4">
              <div className="flex items-center">
                <Package className="mr-2 h-5 w-5 text-gray-500" />
                <span className="font-medium">Shipping Update</span>
              </div>
              <p className="mt-2 text-sm text-gray-600">
                {order.status === 'pending' 
                  ? "Your order is being processed. You will receive an email with tracking information once it ships."
                  : "Your order has been accepted and will ship soon."}
              </p>
            </div>

            <div>
              <h3 className="mb-2 font-medium">Shipping Address</h3>
              <p className="text-sm text-gray-600">
                {order.shipping_address.name && <>{order.shipping_address.name}<br /></>}
                {order.shipping_address.address}
                {order.shipping_address.address2 && <>, {order.shipping_address.address2}</>}
                <br />
                {order.shipping_address.city}, {order.shipping_address.state} {order.shipping_address.zip}
                <br />
                {order.shipping_address.country}
              </p>
            </div>

            <div>
              <h3 className="mb-2 font-medium">Order Summary</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>${order.subtotal.toFixed(2)}</span>
                </div>
                {order.discount_amount && (
                  <div className="flex justify-between">
                    <span>Discount:</span>
                    <span>-${order.discount_amount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between font-medium">
                  <span>Total:</span>
                  <span>${order.total.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="mb-2 font-medium">Items Ordered</h3>
              <div className="space-y-4">
                {order.items.map((item: any) => (
                  <div key={item.id} className="flex items-center gap-4">
                    <div className="h-16 w-16 rounded-md bg-gray-100 overflow-hidden">
                      {item.product_image && (
                        <img 
                          src={item.product_image} 
                          alt={item.product_name}
                          className="h-full w-full object-cover"
                        />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{item.product_name}</p>
                      <p className="text-sm text-gray-600">
                        {item.product_color && `${item.product_color} • `}
                        {item.product_size && `${item.product_size} • `}
                        Qty: {item.quantity}
                      </p>
                    </div>
                    <div className="font-medium">
                      ${item.price.toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button asChild className="w-full">
              <Link href={`/account/orders/${order.id}`}>View Order Details</Link>
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
              support@example.com
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}