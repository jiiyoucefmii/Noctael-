"use client"

import { useEffect, useState } from "react"
import { Search, Mail, Phone, User, ChevronDown, ChevronUp, MapPin } from "lucide-react"
import { getUsersWithOrders, getUserById } from "@/utils/api/users"
import { getUserStatistics, getOrderById } from "@/utils/api/orders"
import { useToast } from "@/hooks/use-toast"
import Image from "next/image"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface Customer {
  id: string
  first_name: string
  last_name: string
  email: string
  phone_number?: string
  orders_count: number
  total_spent: number
  joined_date: string
  last_order_date?: string
}

interface OrderItem {
  id: string
  variant_id: string
  quantity: number
  price: string
  color?: string
  product_name: string
  size?: string
  image?: string
}

interface Order {
  id: string
  user_id: string
  status: string
  total: string
  subtotal: string
  discount_amount?: string
  created_at: string
  updated_at: string
  first_name: string
  last_name: string
  shipping_address: string
  shipping_city: string
  shipping_state: string
  shipping_country: string
  shipping_zip: string
  items: OrderItem[]
  total_items: number
}

export default function AdminCustomers() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(true)
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [customerOrders, setCustomerOrders] = useState<Order[]>([])
  const [customerStats, setCustomerStats] = useState<any>(null)
  const [ordersLoading, setOrdersLoading] = useState(false)
  const [showOrders, setShowOrders] = useState(false)
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        setLoading(true)
        const data = await getUsersWithOrders()
        
        const formatted = data.users.map((user: any) => ({
          id: user.id,
          first_name: user.first_name,
          last_name: user.last_name,
          email: user.email,
          phone_number: user.phone_number || undefined,
          orders_count: user.order_count || 0,
          total_spent: user.total_spent || 0,
          joined_date: new Date(user.created_at).toLocaleDateString(),
          last_order_date: user.last_order_date 
            ? new Date(user.last_order_date).toLocaleDateString()
            : undefined
        }))

        formatted.sort((a: Customer, b: Customer) => 
          new Date(b.joined_date).getTime() - new Date(a.joined_date).getTime()
        )

        setCustomers(formatted)
      } catch (error) {
        console.error("Failed to fetch customers:", error)
        toast({
          title: "Error",
          description: "Failed to load customers. Please try again later.",
          variant: "destructive"
        })
      } finally {
        setLoading(false)
      }
    }
    fetchCustomers()
  }, [toast])

  const fetchOrderDetails = async (orderId: string) => {
    try {
      const response = await getOrderById(orderId)
      return response.order
    } catch (error) {
      console.error("Failed to fetch order details:", error)
      toast({
        title: "Error",
        description: "Failed to load order details.",
        variant: "destructive"
      })
      return null
    }
  }

  const fetchCustomerDetails = async (userId: string) => {
    try {
      setOrdersLoading(true)
      const [stats, userDetails] = await Promise.all([
        getUserStatistics(userId),
        getUserById(userId)
      ])
      
      setCustomerStats(stats)
      
      if (stats.recent_orders) {
        const detailedOrders = await Promise.all(
          stats.recent_orders.map(async (order: any) => {
            const detailedOrder = await fetchOrderDetails(order.id)
            return detailedOrder || order
          })
        )
        
        setCustomerOrders(detailedOrders)
      }
      
      setSelectedCustomer(prev => ({
        ...prev,
        ...userDetails.user,
        joined_date: new Date(userDetails.user.created_at).toLocaleDateString()
      }))
    } catch (error) {
      console.error("Failed to fetch customer details:", error)
      toast({
        title: "Error",
        description: "Failed to load customer details.",
        variant: "destructive"
      })
    } finally {
      setOrdersLoading(false)
    }
  }

  const handleCustomerSelect = async (customer: Customer) => {
    setSelectedCustomer(customer)
    setShowOrders(false)
    setCustomerOrders([])
    setCustomerStats(null)
    await fetchCustomerDetails(customer.id)
  }

  const toggleShowOrders = () => {
    setShowOrders(!showOrders)
  }

  const toggleExpandOrder = (orderId: string) => {
    setExpandedOrder(expandedOrder === orderId ? null : orderId)
  }

  const formatCurrency = (amount: string | number) => {
    const num = typeof amount === 'string' ? parseFloat(amount) : amount
    return num.toLocaleString("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const filteredCustomers = customers.filter((customer) =>
    `${customer.first_name} ${customer.last_name}`.toLowerCase().includes(search.toLowerCase()) ||
    customer.email.toLowerCase().includes(search.toLowerCase()) ||
    (customer.phone_number && customer.phone_number.toLowerCase().includes(search.toLowerCase()))
  )

  return (
    <div className="p-4 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="text-2xl font-bold">Customers</h2>
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search customers..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[200px]">Customer ID</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead className="text-center">Customer Full Name</TableHead>
              <TableHead className="text-right">Email</TableHead>
              <TableHead className="text-right">Phone number</TableHead>
              <TableHead className="text-right">Member Since</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  Loading customers...
                </TableCell>
              </TableRow>
            ) : filteredCustomers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  {search ? "No matching customers found" : "No customers found"}
                </TableCell>
              </TableRow>
            ) : (
              filteredCustomers.map((customer) => (
                <TableRow 
                  key={customer.id} 
                  className="cursor-pointer hover:bg-gray-50"
                  onClick={() => handleCustomerSelect(customer)}
                >
                  <TableCell>
                    <div className="font-medium">
                      {customer.id}
                    </div>
                    
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      <span className="text-sm">{customer.email}</span>
                    </div>
                    {customer.phone_number && (
                      <div className="flex items-center gap-2 mt-1">
                        <Phone className="h-4 w-4" />
                        <span className="text-sm">{customer.phone_number}</span>
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="text-center">
                    {customer.orders_count}
                  </TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(customer.total_spent)}
                  </TableCell>
                  <TableCell className="text-right">
                    {customer.last_order_date || "Never"}
                  </TableCell>
                  <TableCell className="text-right">
                    {customer.joined_date}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {selectedCustomer && (
        <Dialog open={!!selectedCustomer} onOpenChange={() => setSelectedCustomer(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Customer Details</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="bg-gray-100 p-3 rounded-full">
                  <User className="h-8 w-8 text-gray-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">
                    {selectedCustomer.first_name} {selectedCustomer.last_name}
                  </h3>
                  <p className="text-sm text-muted-foreground">ID: {selectedCustomer.id}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h4 className="font-medium">Contact</h4>
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span>{selectedCustomer.email}</span>
                  </div>
                  {selectedCustomer.phone_number && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span>{selectedCustomer.phone_number}</span>
                    </div>
                  )}
                </div>

                {customerStats?.order_statistics && (
                  <div className="space-y-2">
                    <h4 className="font-medium">Orders</h4>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Total:</span>
                      <span>{customerStats.order_statistics.total_orders || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Amount Spent:</span>
                      <span>{formatCurrency(customerStats.order_statistics.total_spent || 0)}</span>
                    </div>
                    {customerStats.order_statistics.average_order_value && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Average Order:</span>
                        <span>
                          {formatCurrency(
                            parseFloat(
                              Number(customerStats.order_statistics.average_order_value || 0).toFixed(2)
                            )
                          )}
                        </span>
                      </div>
                    )}
                  </div>
                )}

                <div className="space-y-2">
                  <h4 className="font-medium">Account</h4>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Joined:</span>
                    <span>{selectedCustomer.joined_date}</span>
                  </div>
                  {customerStats?.wishlist_items !== undefined && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Wishlist:</span>
                      <span>{customerStats.wishlist_items}</span>
                    </div>
                  )}
                  {customerStats?.cart_items !== undefined && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Cart Items:</span>
                      <span>{customerStats.cart_items}</span>
                    </div>
                  )}
                </div>

                {customerStats?.order_statistics?.favorite_categories?.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-medium">Top Categories</h4>
                    {customerStats.order_statistics.favorite_categories.map((cat: any) => (
                      <div key={cat.category_name} className="flex justify-between">
                        <span className="text-muted-foreground">{cat.category_name}:</span>
                        <span>{cat.items_ordered}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {customerStats?.order_statistics?.total_orders > 0 && (
                <div className="pt-4 space-y-4">
                  <Button 
                    variant="outline" 
                    className="w-full flex items-center justify-between"
                    onClick={toggleShowOrders}
                  >
                    <span>Recent Orders ({customerStats.order_statistics.total_orders})</span>
                    {showOrders ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </Button>

                  {showOrders && (
                    <div className="border rounded-lg overflow-hidden">
                      {ordersLoading ? (
                        <div className="p-4 text-center">Loading orders...</div>
                      ) : customerOrders.length === 0 ? (
                        <div className="p-4 text-center">No orders found</div>
                      ) : (
                        <div className="space-y-4 p-4">
                          {customerOrders.map((order) => (
                            <div key={order.id} className="border rounded-lg overflow-hidden">
                              <div 
                                className="p-4 cursor-pointer hover:bg-gray-50 flex justify-between items-center"
                                onClick={() => toggleExpandOrder(order.id)}
                              >
                                <div>
                                  <h4 className="font-medium">Order #{order.id.slice(0, 8)}</h4>
                                  <p className="text-sm text-muted-foreground">
                                    {formatDate(order.created_at)}
                                  </p>
                                </div>
                                <div className="flex items-center gap-4">
                                  <div className="text-right">
                                    <p className="font-medium">Total</p>
                                    <p>{formatCurrency(order.total)}</p>
                                  </div>
                                  <div>
                                    <p className="text-sm">
                                      <span className="font-medium">Status:</span>{" "}
                                      <span className="capitalize">{order.status}</span>
                                    </p>
                                  </div>
                                  {expandedOrder === order.id ? (
                                    <ChevronUp className="h-5 w-5" />
                                  ) : (
                                    <ChevronDown className="h-5 w-5" />
                                  )}
                                </div>
                              </div>
                              
                              {expandedOrder === order.id && (
                                <div className="border-t p-4 space-y-4">
                                  <div>
                                    <h5 className="font-medium mb-2 flex items-center gap-2">
                                      <MapPin className="h-4 w-4" />
                                      Shipping Address
                                    </h5>
                                    <div className="text-sm space-y-1">
                                      <p>{order.first_name} {order.last_name}</p>
                                      <p>{order.shipping_address}</p>
                                      <p>
                                        {order.shipping_city}, {order.shipping_state} {order.shipping_zip}
                                      </p>
                                      <p>{order.shipping_country}</p>
                                    </div>
                                  </div>
                                  
                                  <div>
                                    <h5 className="font-medium mb-2">Order Summary</h5>
                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                      <div>
                                        <p className="text-muted-foreground">Subtotal</p>
                                        <p>{formatCurrency(order.subtotal)}</p>
                                      </div>
                                      <div>
                                        <p className="text-muted-foreground">Discount</p>
                                        <p>{order.discount_amount ? formatCurrency(order.discount_amount) : 'None'}</p>
                                      </div>
                                      <div>
                                        <p className="text-muted-foreground">Shipping</p>
                                        <p>Free</p>
                                      </div>
                                      <div>
                                        <p className="text-muted-foreground">Total Items</p>
                                        <p>{order.total_items}</p>
                                      </div>
                                    </div>
                                  </div>
                                  
                                  <div>
                                    <h5 className="font-medium mb-2">Order Items</h5>
                                    <div className="space-y-4">
                                      {order.items.map((item) => (
                                        <div key={item.id} className="flex gap-4">
                                          {item.image && (
                                            <div className="relative w-16 h-16 rounded-md overflow-hidden border">
                                              <Image
                                                src={item.image}
                                                alt={item.product_name}
                                                fill
                                                className="object-cover"
                                                sizes="64px"
                                              />
                                            </div>
                                          )}
                                          <div className="flex-1">
                                            <p className="font-medium">{item.product_name}</p>
                                            {item.color && (
                                              <p className="text-sm text-muted-foreground">
                                                Color: {item.color}
                                              </p>
                                            )}
                                            {item.size && (
                                              <p className="text-sm text-muted-foreground">
                                                Size: {item.size}
                                              </p>
                                            )}
                                            <p className="text-sm">
                                              {formatCurrency(item.price)} × {item.quantity}
                                            </p>
                                          </div>
                                          <div className="text-right">
                                            <p className="font-medium">
                                              {formatCurrency(parseFloat(item.price) * item.quantity)}
                                            </p>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}