import Link from "next/link"
import Image from "next/image"
import { ChevronLeft, Package } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export default function OrderDetailsPage({ params }: { params: { id: string } }) {
  // Mock order data
  const order = {
    id: params.id,
    date: "June 15, 2023",
    status: "Delivered",
    total: 149.99,
    subtotal: 129.99,

    items: [
      {
        id: "1",
        name: "Shadow Oversized Tee",
        price: 49.99,
        quantity: 1,
        size: "L",
        image: "/images/product-1.jpg",
      },
      {
        id: "2",
        name: "Midnight Hoodie",
        price: 79.99,
        quantity: 1,
        size: "M",
        image: "/images/product-2.jpg",
      },
    ],
    shippingAddress: {
      name: "John Doe",
      address: "123 Main Street",
      city: "New York",
      state: "NY",
      zip: "10001",

      
    },


  }

  return (
    <main className="flex-1 py-10">
      <div className="container max-w-4xl">
        <div className="mb-6">
          <Button asChild variant="ghost" className="mb-4">
            <Link href="/account?tab=orders">
              <ChevronLeft className="mr-2 h-4 w-4" />
              Back to Orders
            </Link>
          </Button>
          <h1 className="text-3xl font-bold">Order #{order.id}</h1>
          <p className="text-gray-500">Placed on {order.date}</p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <div className="md:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Order Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-4">
                  <div className="rounded-full bg-green-100 p-2">
                    <Package className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <Badge className="bg-green-500">Delivered</Badge>
                    <p className="mt-1 text-sm text-gray-500">Your order has been delivered on June 18, 2023</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Order Items</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="divide-y">
                  {order.items.map((item) => (
                    <div key={item.id} className="flex py-4">
                      <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-md">
                        <Image src={item.image || "/placeholder.svg"} alt={item.name} fill className="object-cover" />
                      </div>
                      <div className="ml-4 flex flex-1 flex-col">
                        <div className="flex justify-between">
                          <div>
                            <h3 className="font-medium">
                              <Link href={`/products/${item.id}`} className="hover:underline">
                                {item.name}
                              </Link>
                            </h3>
                            <p className="mt-1 text-sm text-gray-500">Size: {item.size}</p>
                          </div>
                          <p className="font-medium">${item.price.toFixed(2)}</p>
                        </div>
                        <div className="mt-1 text-sm text-gray-500">Quantity: {item.quantity}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>${order.subtotal.toFixed(2)}</span>
                </div>
                
                <div className="border-t pt-4 flex justify-between font-medium">
                  <span>Total</span>
                  <span>${order.total.toFixed(2)}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Shipping Information</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="font-medium">{order.shippingAddress.name}</p>
                <p className="text-gray-500">{order.shippingAddress.address}</p>
                <p className="text-gray-500">
                  {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zip}
                </p>

              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <p>Payment On Delivery</p>
              </CardHeader>
          
            </Card>
          </div>
        </div>
      </div>
    </main>
  )
}
