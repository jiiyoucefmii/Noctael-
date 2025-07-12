"use client"

import { useEffect, useState } from "react"
import { Search, Plus, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { getAllOrders, updateOrderStatus } from "@/utils/api/orders"
import { getUserById } from "@/utils/api/users"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import Image from "next/image"

interface OrderItem {
  item_id: string
  product_name: string
  image: string
  price: number
  quantity: number
  size: string
  color: string
}

interface Order {
  id: string
  user_id: string
  user_name: string
  user_email: string
  user: {
    phone_number: string
  }
  total: number
  status: string
  created_at: string
  shipping_address: string
  shipping_city: string
  shipping_state: string
  shipping_country: string
  shipping_zip: string
  items: OrderItem[]
  first_name: string
  last_name: string
  subtotal: string
  discount_amount: string
  is_discounted: boolean
}

export default function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [isLoading, setIsLoading] = useState(true)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const { toast } = useToast()

  const getFullImageUrl = (imagePath: string) => {
    if (!imagePath) return ""
    if (imagePath.startsWith("http")) return imagePath
    const apiUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") || ""
    return imagePath.startsWith("/") 
      ? `${apiUrl}${imagePath}`
      : `${apiUrl}/${imagePath}`
  }

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const fetchedOrders = await getAllOrders()
        const enriched = await Promise.all(
          fetchedOrders.orders.map(async (order: any) => {
            try {
              const user = await getUserById(order.user_id)
              return {
                ...order,
                user_name: `${user.user.first_name} ${user.user.last_name}`,
                user_email: user.user.email,
                user: {
                  phone_number: user.user.phone_number || 'Not provided'
                },
                shipping_address: order.shipping_address || "N/A"
              }
            } catch {
              return {
                ...order,
                user_name: "Unknown",
                user_email: "Unknown",
                user: {
                  phone_number: 'Not provided'
                },
                shipping_address: order.shipping_address || "N/A"
              }
            }
          })
        )
        setOrders(enriched)
      } catch {
        toast({
          title: "Error",
          description: "Failed to fetch orders",
          variant: "destructive"
        })
      } finally {
        setIsLoading(false)
      }
    }
    fetchOrders()
  }, [toast])

  const handleStatusChange = async (order: Order, status: string) => {
    try {
      await updateOrderStatus(order.id, status)
      setOrders((prev) =>
        prev.map((o) => (o.id === order.id ? { ...o, status } : o))
      )
      toast({
        title: "Order updated",
        description: `Order marked as ${status}`
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      })
    }
  }

  const handleViewDetails = (order: Order) => {
    setSelectedOrder(order)
    setIsDialogOpen(true)
  }

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.user_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.id.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus =
      statusFilter === "all" || order.status === statusFilter
    return matchesSearch && matchesStatus
  })

  return (
    <div className="p-4">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Orders</h1>
      </div>

      <div className="mb-6 flex gap-4">
        <div className="relative w-full">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            type="search"
            placeholder="Search orders..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="accepted">Accepted</SelectItem>
            <SelectItem value="shipped">Shipped</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order ID</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center h-24">
                  Loading orders...
                </TableCell>
              </TableRow>
            ) : filteredOrders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center h-24">
                  No orders found.
                </TableCell>
              </TableRow>
            ) : (
              filteredOrders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell>{order.id}</TableCell>
                  <TableCell>{order.user_name}</TableCell>
                  <TableCell>
                    <Badge
                      className={`text-white px-2 py-1 rounded-md text-xs font-medium ${
                        order.status === "pending"
                          ? "bg-yellow-500"
                          : order.status === "accepted"
                          ? "bg-green-600"
                          : "bg-blue-600"
                      }`}
                    >
                      {order.status}
                    </Badge>
                  </TableCell>
                  <TableCell>${Number(order.total).toFixed(2)}</TableCell>
                  <TableCell>
                    {new Date(order.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleViewDetails(order)}
                    >
                      View Details
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleStatusChange(order, "accepted")}
                      disabled={order.status !== "pending"}
                    >
                      Accept
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleStatusChange(order, "shipped")}
                      disabled={order.status !== "accepted"}
                    >
                      Mark Shipped
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Order Details</DialogTitle>
            <DialogDescription>
              Order ID: {selectedOrder?.id}
            </DialogDescription>
          </DialogHeader>
          
          {selectedOrder && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="font-medium mb-2">Customer Information</h3>
                  <div className="space-y-1 text-sm">
                    <p><span className="text-muted-foreground">Name:</span> {selectedOrder.user_name}</p>
                    <p><span className="text-muted-foreground">Email:</span> {selectedOrder.user_email}</p>
                    <p><span className="text-muted-foreground">Phone:</span> {selectedOrder.user.phone_number}</p>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-medium mb-2">Shipping Information</h3>
                  <div className="space-y-1 text-sm">
                    <p><span className="text-muted-foreground">Address:</span> {selectedOrder.shipping_address}</p>
                    <p><span className="text-muted-foreground">City:</span> {selectedOrder.shipping_city}</p>
                    <p><span className="text-muted-foreground">State:</span> {selectedOrder.shipping_state}</p>
                    <p><span className="text-muted-foreground">Country:</span> {selectedOrder.shipping_country}</p>
                    <p><span className="text-muted-foreground">ZIP:</span> {selectedOrder.shipping_zip}</p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-medium mb-2">Order Summary</h3>
                <div className="border rounded-lg">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Product</TableHead>
                        <TableHead>Price</TableHead>
                        <TableHead>Qty</TableHead>
                        <TableHead>Total</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedOrder.items.map((item) => (
                        <TableRow key={item.item_id}>
                          <TableCell>
                            <div className="flex items-center gap-4">
                              <div className="relative h-16 w-16 rounded-md overflow-hidden">
                                <Image
                                  src={getFullImageUrl(item.image)}
                                  alt={item.product_name}
                                  fill
                                  className="object-cover"
                                  unoptimized={item.image.startsWith("http")}
                                />
                              </div>
                              <div>
                                <p className="font-medium">{item.product_name}</p>
                                <p className="text-sm text-muted-foreground">
                                  {item.color} / {item.size}
                                </p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>${item.price.toFixed(2)}</TableCell>
                          <TableCell>{item.quantity}</TableCell>
                          <TableCell>${(item.price * item.quantity).toFixed(2)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>${Number(selectedOrder.subtotal).toFixed(2)}</span>
                </div>
                {selectedOrder.is_discounted && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Discount</span>
                    <span className="text-green-600">-${Number(selectedOrder.discount_amount).toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between font-medium">
                  <span>Total</span>
                  <span>${Number(selectedOrder.total).toFixed(2)}</span>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDialogOpen(false)}
            >
              Close
            </Button>
            {selectedOrder?.status === "pending" && (
              <Button
                onClick={() => {
                  handleStatusChange(selectedOrder, "accepted")
                  setIsDialogOpen(false)
                }}
              >
                Accept Order
              </Button>
            )}
            {selectedOrder?.status === "accepted" && (
              <Button
                onClick={() => {
                  handleStatusChange(selectedOrder, "shipped")
                  setIsDialogOpen(false)
                }}
              >
                Mark as Shipped
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}