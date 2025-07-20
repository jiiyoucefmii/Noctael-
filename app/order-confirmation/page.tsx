"use client"

import Link from "next/link"
import { CheckCircle, Package, ShoppingBag, Truck, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card"
import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
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
    if (!orderId) {
      setLoading(false)
      return
    }

    const fetchOrder = async () => {
      try {
        setLoading(true)
        const { order } = await getOrderById(orderId)
        setOrder(order)

        if (order.shipping_state) {
          const options = await getShippingOptionsByState(order.shipping_state)
          const found = options.find(opt => opt.state === order.shipping_state)
          setShippingOption(found ?? null)
        }
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
      <div className="py-10 text-center text-sm text-muted-foreground">
        Loading order details...
      </div>
    )
  }

  if (!order) {
    return (
      <div className="py-10 text-center text-sm text-muted-foreground">
        Order not found.
      </div>
    )
  }

  const formatDate = (date: string) =>
    new Date(date).toLocaleString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    })

  const discount = Number(order.discount_amount) || 0
  const subtotal = Number(order.subtotal) || 0

  const shippingCost =
    shippingOption && order.shipping_type === "to_home"
      ? Number(shippingOption.to_home)
      : shippingOption && order.shipping_type === "to_desk"
        ? Number(shippingOption.to_desk)
        : 0

  const total = subtotal + shippingCost - discount

  return (
    <main className="py-10">
      <div className="container max-w-2xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center">
          <CheckCircle className="mx-auto mb-4 h-16 w-16 text-green-500" />
          <h1 className="text-3xl font-bold">Thank You for Your Order!</h1>
          <p className="mt-2 text-gray-600 text-sm">
            Order #{order.id} was placed on {formatDate(order.created_at)}
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Order Summary</CardTitle>
            <CardDescription>
              Status:{" "}
              <span className="capitalize font-medium">{order.status}</span>
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Order Status */}
            <section className="bg-gray-50 rounded-md p-4">
              <div className="flex items-center">
                <Truck className="mr-2 h-5 w-5 text-gray-500" />
                <span className="font-medium">Order Status: {order.status}</span>
              </div>
              <p className="mt-2 text-sm text-gray-600">
                {order.status === "pending"
                  ? "Your order is being processed. You'll receive an email with tracking info."
                  : "Your order has been accepted and is being prepared for shipment."}
              </p>
            </section>
            
            {/* Personal Info */}
            <section>
              <div className="flex items-center mb-2">
                <User className="mr-2 h-5 w-5 text-gray-500" />
                <h3 className="font-medium">Personal Information</h3>
              </div>
              <div className="grid md:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-600">Name</p>
                  <p>{order.first_name} {order.last_name}</p>
                </div>
                <div>
                  <p className="text-gray-600">Email</p>
                  <p>{order.user_email}</p>
                </div>
              </div>
            </section>

            {/* Shipping Info */}
            <section>
              <div className="flex items-center mb-2">
                <Package className="mr-2 h-5 w-5 text-gray-500" />
                <h3 className="font-medium">Shipping Address</h3>
              </div>
              <div className="text-sm">
                <p>{order.shipping_address}</p>
                <p>{order.shipping_city}, {order.shipping_state}</p>
                <p>{order.shipping_country}</p>
                {shippingOption && (
                  <p className="text-gray-500 mt-2">
                    Shipping method:{" "}
                    <span className="capitalize font-medium">
                      {order.shipping_type_display || order.shipping_type.replace("_", " ")}
                    </span>
                  </p>
                )}
              </div>
            </section>

            {/* Order Items */}
            <section>
              <h3 className="font-medium mb-2">Order Items</h3>
              <div className="space-y-4">
                {order.items.map(item => (
                  <div key={item.id} className="flex gap-4">
                    <div className="w-16 h-16 rounded-md bg-gray-100 overflow-hidden">
                      <img
                        src={item.image}
                        alt={item.product_name}
                        className="object-cover w-full h-full"
                      />
                    </div>
                    <div className="flex-1 text-sm">
                      <p className="font-medium">{item.product_name}</p>
                      <p className="text-gray-600">
                        {item.color && `${item.color}, `}Size {item.size}
                      </p>
                      <p>Quantity: {item.quantity}</p>
                    </div>
                    <div className="text-sm text-right">
                      <p>{Number(item.price).toFixed(0)} DA</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Pricing Summary */}
            <section className="border-t pt-4">
              <h3 className="font-medium mb-2">Pricing Summary</h3>
              <div className="text-sm space-y-2">
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
                <div className="flex justify-between border-t font-medium pt-2 mt-2">
                  <span>Total</span>
                  <span>{total.toFixed(0)} DA</span>
                </div>
              </div>
            </section>

            
          </CardContent>

          <CardFooter className="flex flex-col gap-4">
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

        {/* Footer help text */}
        <div className="text-center text-sm text-gray-500">
          Need help? Contact{" "}
          <Link href="/contact" className="underline text-black">
            support@noctael.com
          </Link>
        </div>
      </div>
    </main>
  )
}
