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
        console.log("fetchedOrders")
        console.log(fetchedOrders)
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
        console.log("enriched")
        console.log(enriched)
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
    console.log("selectedOrder")
    console.log(selectedOrder)
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
    <div className="rounded-[5px] border-0 p-4 sm:p-6 bg-[#171717] w-full">
      <div className="flex justify-between items-center mb-4 sm:mb-6">
        <h1 className="text-xl sm:text-2xl font-bold">Orders</h1>
      </div>

      <div className="mb-4 sm:mb-6 flex flex-col sm:flex-row gap-2 sm:gap-4">
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
          <SelectTrigger className="w-full sm:w-40">
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

      <div className="rounded-lg border overflow-x-auto w-full">
        <Table className="w-full">
          <TableHeader>
            <TableRow>
              <TableHead className="hidden sm:table-cell">Order ID</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="hidden sm:table-cell">Total</TableHead>
              <TableHead className="hidden sm:table-cell">Date</TableHead>
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
                  <TableCell className="hidden sm:table-cell">{order.id}</TableCell>
                  <TableCell>{order.user_name}</TableCell>
                  <TableCell>
                    <Badge
                      className={`text-white px-2 py-1 rounded-md text-xs font-medium ${order.status === "pending"
                        ? "bg-yellow-500"
                        : order.status === "accepted"
                          ? "bg-green-600"
                          : "bg-blue-600"
                        }`}
                    >
                      {order.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">{Number(order.total).toFixed(0)} Da</TableCell>
                  <TableCell className="hidden sm:table-cell">
                    {new Date(order.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex flex-col sm:flex-row sm:space-x-2 space-y-2 sm:space-y-0 items-end">
                      <Button
                        size="sm"
                        variant="outline"
                        className="w-full sm:w-auto"
                        onClick={() => handleViewDetails(order)}
                      >
                        View Details
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="w-full sm:w-auto"
                        onClick={() => handleStatusChange(order, "accepted")}
                        disabled={order.status !== "pending"}
                      >
                        Accept
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="w-full sm:w-auto"
                        onClick={() => handleStatusChange(order, "shipped")}
                        disabled={order.status !== "accepted"}
                      >
                        Mark Shipped
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="rounded-[5px] border-0 p-4 sm:p-6 bg-[#171717] w-[95vw] max-w-full sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Order Details</DialogTitle>
            <DialogDescription>
              Order ID: {selectedOrder?.id}
            </DialogDescription>
          </DialogHeader>
          
          {selectedOrder && (
            <div className="space-y-4 sm:space-y-6">
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
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-medium mb-2">Order Summary</h3>
                <div className="border rounded-lg overflow-x-auto">
                  <Table className="w-full">
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
                            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
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
                                <p className="font-medium text-sm sm:text-base">{item.product_name}</p>
                                <p className="text-xs sm:text-sm text-muted-foreground">
                                  {item.color} / {item.size}
                                </p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="text-xs sm:text-sm">{item.price.toFixed(0)} Da</TableCell>
                          <TableCell className="text-xs sm:text-sm">{item.quantity}</TableCell>
                          <TableCell className="text-xs sm:text-sm">${(item.price * item.quantity).toFixed(0)} Da</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>{Number(selectedOrder.subtotal).toFixed(0)} Da</span>
                </div>
                {selectedOrder.is_discounted && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Discount</span>
                    <span className="text-green-600">-{Number(selectedOrder.discount_amount).toFixed(0)} Da</span>
                  </div>
                )}
                <div className="flex justify-between font-medium">
                  <span>Total</span>
                  <span>{Number(selectedOrder.total).toFixed(0)} Da</span>
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="flex-col sm:flex-row gap-2 sm:gap-0 mt-4">
            <Button
              variant="outline"
              className="w-full sm:w-auto"
              onClick={() => setIsDialogOpen(false)}
            >
              Close
            </Button>
            {selectedOrder?.status === "pending" && (
              <Button
                className="w-full sm:w-auto"
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
                className="w-full sm:w-auto"
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