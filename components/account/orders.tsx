import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

// Mock orders data
const orders = [
  {
    id: "ORD-001",
    date: "June 15, 2023",
    status: "Delivered",
    total: 149.99,
    items: 3,
  },
  {
    id: "ORD-002",
    date: "May 28, 2023",
    status: "Shipped",
    total: 89.99,
    items: 2,
  },
  {
    id: "ORD-003",
    date: "April 10, 2023",
    status: "Delivered",
    total: 199.99,
    items: 4,
  },
]

export default function AccountOrders() {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Delivered":
        return <Badge className="bg-green-500">Delivered</Badge>
      case "Shipped":
        return <Badge className="bg-blue-500">Shipped</Badge>
      case "Processing":
        return <Badge className="bg-yellow-500">Processing</Badge>
      case "Cancelled":
        return <Badge className="bg-red-500">Cancelled</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Order History</CardTitle>
        <CardDescription>View and track your orders</CardDescription>
      </CardHeader>
      <CardContent>
        {orders.length === 0 ? (
          <div className="flex h-40 flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
            <p className="mb-2 text-lg font-medium">No orders yet</p>
            <p className="mb-4 text-sm text-gray-500">You haven't placed any orders yet.</p>
            <Button asChild>
              <Link href="/products">Start Shopping</Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div key={order.id} className="rounded-lg border p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="font-medium">Order #{order.id}</p>
                    <p className="text-sm text-gray-500">{order.date}</p>
                  </div>
                  <div>{getStatusBadge(order.status)}</div>
                </div>
                <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="text-sm text-gray-500">{order.items} items</p>
                    <p className="font-medium">${order.total.toFixed(2)}</p>
                  </div>
                  <Button asChild variant="outline" size="sm">
                    <Link href={`/account/orders/${order.id}`}>View Details</Link>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
