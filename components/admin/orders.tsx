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
import { createDiscountCode } from "@/utils/api/promos"
import { Label } from "@/components/ui/label"

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
  total: number
  status: string
  created_at: string
  shipping_address: string
  shipping_city: string
  shipping_state: string
  shipping_country: string
  shipping_zip: string
  items: OrderItem[]
}

interface PromoFormData {
  code: string
  discount_percent: number
  valid_from: string
  valid_to: string
  usage_limit: string
  user_usage_limit: string
}

export default function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [isLoading, setIsLoading] = useState(true)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [isCreatePromoOpen, setIsCreatePromoOpen] = useState(false)
  const [promoForm, setPromoForm] = useState<PromoFormData>({
    code: "",
    discount_percent: 10,
    valid_from: "",
    valid_to: "",
    usage_limit: "",
    user_usage_limit: ""
  })
  const [isCreatingPromo, setIsCreatingPromo] = useState(false)

  const { toast } = useToast()

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
                shipping_address: order.shipping_address || "N/A"
              }
            } catch {
              return {
                ...order,
                user_name: "Unknown",
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

  const handleToggleStatus = async (order: Order) => {
    const newStatus = order.status === "pending" ? "accepted" : "pending"
    try {
      await updateOrderStatus(order.id, newStatus)
      setOrders((prev) =>
        prev.map((o) => (o.id === order.id ? { ...o, status: newStatus } : o))
      )
      toast({
        title: "Order updated",
        description: `Order marked as ${newStatus}`
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      })
    }
  }

  const handleCreatePromo = async () => {
    if (!promoForm.code.trim()) {
      toast({
        title: "Error",
        description: "Promo code is required",
        variant: "destructive"
      })
      return
    }

    setIsCreatingPromo(true)
    try {
      await createDiscountCode({
        code: promoForm.code,
        discount_percent: promoForm.discount_percent,
        valid_from: promoForm.valid_from || null,
        valid_to: promoForm.valid_to || null,
        usage_limit: promoForm.usage_limit ? parseInt(promoForm.usage_limit) : null,
        user_usage_limit: promoForm.user_usage_limit ? parseInt(promoForm.user_usage_limit) : null
      })
      
      toast({
        title: "Success",
        description: "Discount code created successfully"
      })
      setIsCreatePromoOpen(false)
      resetPromoForm()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create discount code",
        variant: "destructive"
      })
    } finally {
      setIsCreatingPromo(false)
    }
  }

  const resetPromoForm = () => {
    setPromoForm({
      code: "",
      discount_percent: 10,
      valid_from: "",
      valid_to: "",
      usage_limit: "",
      user_usage_limit: ""
    })
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
        <Button onClick={() => setIsCreatePromoOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Create Promo Code
        </Button>
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
              <TableHead>Details</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center h-24">
                  Loading orders...
                </TableCell>
              </TableRow>
            ) : filteredOrders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center h-24">
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
                          : "bg-green-600"
                      }`}
                    >
                      {order.status}
                    </Badge>
                  </TableCell>
                  <TableCell>${Number(order.total).toFixed(2)}</TableCell>
                  <TableCell>
                    {new Date(order.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <Button variant="outline" onClick={() => setSelectedOrder(order)}>
                      View
                    </Button>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="outline" onClick={() => handleToggleStatus(order)}>
                      {order.status === "pending" ? "Accept" : "Mark Pending"}
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Order Details Dialog */}
      <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
        <DialogContent className="max-w-4xl overflow-y-auto max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="text-2xl">Order Details</DialogTitle>
            <DialogDescription className="text-base">
              Details for order ID: {selectedOrder?.id}
            </DialogDescription>
          </DialogHeader>

          {selectedOrder && (
            <div className="space-y-8 text-base">
              <div className="grid grid-cols-2 gap-6 text-gray-800">
                <p><span className="font-semibold text-lg">Customer:</span> {selectedOrder.user_name}</p>
                <p><span className="font-semibold text-lg">Status:</span> {selectedOrder.status}</p>
                <p>
                  <span className="font-semibold text-lg">Total:</span> ${Number(selectedOrder.total).toFixed(2)}
                </p>
                <p><span className="font-semibold text-lg">Date:</span> {new Date(selectedOrder.created_at).toLocaleString()}</p>
              </div>

              <div>
                <p className="font-bold text-xl text-gray-800 mb-3">Shipping Address:</p>
                <p className="text-gray-700 leading-relaxed">
                  {selectedOrder.shipping_address}<br />
                  {selectedOrder.shipping_city}, {selectedOrder.shipping_state} {selectedOrder.shipping_zip}<br />
                  {selectedOrder.shipping_country}
                </p>
              </div>

              <div>
                <p className="font-bold text-xl text-gray-800 mb-4">Items:</p>
                <ul className="space-y-4">
                  {selectedOrder.items?.length > 0 ? (
                    selectedOrder.items.map((item) => (
                      <li key={item.item_id} className="flex gap-6 items-start border p-4 rounded-lg">
                        <img
                          src={item.image}
                          alt={item.product_name}
                          className="w-32 h-32 object-cover rounded-md"
                        />
                        <div className="text-gray-800 text-base space-y-2">
                          <p className="font-semibold text-lg">{item.product_name}</p>
                          <p>Size: {item.size} | Color: {item.color}</p>
                          <p>Quantity: {item.quantity}</p>
                          <p>Price: ${item.price.toFixed(2)}</p>
                        </div>
                      </li>
                    ))
                  ) : (
                    <li>No items found.</li>
                  )}
                </ul>
              </div>

              <DialogFooter>
                <Button size="lg" onClick={() => setSelectedOrder(null)}>Close</Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Create Promo Code Dialog */}
      <Dialog open={isCreatePromoOpen} onOpenChange={setIsCreatePromoOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Create New Promo Code</DialogTitle>
            <DialogDescription>
              Create discount codes for your customers
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="code" className="text-right">
                Code *
              </Label>
              <Input
                id="code"
                value={promoForm.code}
                onChange={(e) => setPromoForm({...promoForm, code: e.target.value})}
                className="col-span-3"
                placeholder="SUMMER20"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="discount_percent" className="text-right">
                Discount (%) *
              </Label>
              <Input
                id="discount_percent"
                type="number"
                min="1"
                max="100"
                value={promoForm.discount_percent}
                onChange={(e) => setPromoForm({...promoForm, discount_percent: Number(e.target.value)})}
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="valid_from" className="text-right">
                Valid From
              </Label>
              <Input
                id="valid_from"
                type="datetime-local"
                value={promoForm.valid_from}
                onChange={(e) => setPromoForm({...promoForm, valid_from: e.target.value})}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="valid_to" className="text-right">
                Valid To
              </Label>
              <Input
                id="valid_to"
                type="datetime-local"
                value={promoForm.valid_to}
                onChange={(e) => setPromoForm({...promoForm, valid_to: e.target.value})}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="usage_limit" className="text-right">
                Usage Limit
              </Label>
              <Input
                id="usage_limit"
                type="number"
                min="1"
                value={promoForm.usage_limit}
                onChange={(e) => setPromoForm({...promoForm, usage_limit: e.target.value})}
                className="col-span-3"
                placeholder="Leave empty for unlimited"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="user_usage_limit" className="text-right">
                User Usage Limit
              </Label>
              <Input
                id="user_usage_limit"
                type="number"
                min="1"
                value={promoForm.user_usage_limit}
                onChange={(e) => setPromoForm({...promoForm, user_usage_limit: e.target.value})}
                className="col-span-3"
                placeholder="Leave empty for unlimited"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setIsCreatePromoOpen(false)
              resetPromoForm()
            }}>
              Cancel
            </Button>
            <Button onClick={handleCreatePromo} disabled={isCreatingPromo}>
              {isCreatingPromo ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Promo Code"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}