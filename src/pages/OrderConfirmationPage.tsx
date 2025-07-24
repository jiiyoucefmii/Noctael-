"use client"

import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { CheckCircle, Package, ShoppingBag, Truck, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { useEffect, useState } from "react"
import { getOrderById, Order } from "@/utils/api/orders"
import { getShippingOptionsByState, ShippingOption } from "@/utils/api/shippingOptions"
import { useToast } from "@/hooks/use-toast"

export default function OrderConfirmationPage() {
  const searchParams = useSearchParams()
  const orderId = searchParams?.get("orderId")
  const { toast } = useToast()
  const [order, setOrder] = useState<Order | null>(null)
  const [shippingOption, setShippingOption] = useState<ShippingOption | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!orderId) return

    const fetchOrder = async () => {
      try {
        setLoading(true)
        const { order } = await getOrderById(orderId)
        setOrder(order.shipping_state)

        if (order.shipping_state) {
          const shippingOptions = await getShippingOptionsByState(order.shipping_state)
          const option = shippingOptions.find(opt => opt.state === order.shipping_state)
          if (option) {
            setShippingOption(option)
          }
        }
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load order or shipping info",
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
        <div className="container mx-auto px-4 max-w-2xl text-center">Loading order details...</div>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="py-10">
        <div className="container mx-auto px-4 max-w-2xl text-center">Order not found</div>
      </div>
    )
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const discount = parseFloat(order.discount_amount || "0")
  const subtotal = parseFloat(order.subtotal)
  const shippingCost = shippingOption
    ? order.shipping_type === "to_home"
      ? shippingOption.to_home
      : shippingOption.to_desk
    : 0
  const total = subtotal - discount + shippingCost

  return (
    <div className="py-10">
      <div className="container mx-auto px-4 max-w-2xl">
        <div className="mb-8 text-center">
          <CheckCircle className="mx-auto mb-4 h-16 w-16 text-green-500" />
          <h1 className="text-3xl font-bold">Thank You for Your Order!</h1>
          <p className="mt-2 text-gray-600">
            Your order #{order.id} was placed on {formatDate(order.created_at)}
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Order Summary</CardTitle>
            <CardDescription>Status: <span className="capitalize font-medium">{order.status}</span></CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Personal Info */}
            <div>
              <div className="flex items-center mb-2">
                <User className="mr-2 h-5 w-5 text-gray-500" />
                <h3 className="font-medium">Personal Information</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-600">Name</p>
                  <p>{order.first_name} {order.last_name}</p>
                </div>
                <div>
                  <p className="text-gray-600">Email</p>
                  <p>{order.user_email}</p>
                </div>
              </div>
            </div>

            {/* Shipping Address */}
            <div>
              <div className="flex items-center mb-2">
                <Package className="mr-2 h-5 w-5 text-gray-500" />
                <h3 className="font-medium">Shipping Address</h3>
              </div>
              <div className="text-sm">
                <p>{order.shipping_address}</p>
                <p>{order.shipping_city}, {order.shipping_state}</p>
                <p>{order.shipping_country}</p>
              </div>
              {shippingOption && (
                <div className="mt-2">
                  <p className="text-sm text-gray-500">
                    Shipping method: <span className="capitalize font-medium">{order.shipping_type_display || order.shipping_type.replace("_", " ")}</span>
                  </p>
                </div>
              )}
            </div>

            {/* Order Items */}
            <div>
              <h3 className="mb-2 font-medium">Order Items</h3>
              <div className="space-y-4">
                {order.items.map(item => (
                  <div key={item.id} className="flex gap-4">
                    <div className="w-16 h-16 bg-gray-100 rounded-md overflow-hidden">
                      <img 
                        src={item.image} 
                        alt={item.product_name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{item.product_name}</p>
                      <p className="text-sm text-gray-600">
                        {item.color && item.color}, Size {item.size}
                      </p>
                      <p className="text-sm">Quantity: {item.quantity}</p>
                    </div>
                    <div className="text-right">
                      <p>{Number(item.price).toFixed(0)} DA</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Final Pricing Summary */}
            <div className="border-t pt-4">
              <h3 className="mb-4 font-medium">Pricing Summary</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Subtotal ({order.total_items} items)</span>
                  <span>{subtotal.toFixed(0)} DA</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount</span>
                    <span>-{discount.toFixed(0)} DA</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Shipping Cost</span>
                  <span>{shippingCost.toFixed(0)} DA</span>
                </div>
                <div className="flex justify-between font-medium border-t pt-2 mt-2">
                  <span>Total</span>
                  <span>{total.toFixed(0)} DA</span>
                </div>
              </div>
            </div>

            {/* Order Status */}
            <div className="rounded-lg bg-gray-50 p-4">
              <div className="flex items-center">
                <Truck className="mr-2 h-5 w-5 text-gray-500" />
                <span className="font-medium">Order Status: {order.status}</span>
              </div>
              <p className="mt-2 text-sm text-gray-600">
                {order.status === 'pending' 
                  ? "Your order is being processed. You'll receive an email with tracking information once it ships."
                  : "Your order has been accepted and is being prepared for shipment."}
              </p>
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