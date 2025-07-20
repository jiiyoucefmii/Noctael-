"use client"

import { useEffect, useState, useCallback } from "react"
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
  created_at: string
  updated_at: string
  order_count: number
  total_spent: number
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
  items: OrderItem[]
  total_items: number
}

interface CustomerStats {
  order_statistics?: {
    total_orders: number
    total_spent: number
    last_order_date?: string
    average_order_value?: number
    favorite_categories?: Array<{
      category_name: string
      items_ordered: number
    }>
  }
  recent_orders?: Order[]
  wishlist_items?: number
  cart_items?: number
}

export default function AdminCustomers() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(true)
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [customerOrders, setCustomerOrders] = useState<Order[]>([])
  const [customerStats, setCustomerStats] = useState<CustomerStats | null>(null)
  const [ordersLoading, setOrdersLoading] = useState(false)
  const [showOrders, setShowOrders] = useState(false)
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null)
  const { toast } = useToast()

  const formatCurrency = useCallback((amount: string | number) => {
    const num = typeof amount === 'string' ? parseFloat(amount) : amount
    return num.toLocaleString("en-US", {
      style: "decimal",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }) + " Da"
  }, [])

  const formatDate = useCallback((dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }, [])

  const fetchOrderDetails = useCallback(async (orderId: string): Promise<Order | null> => {
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
  }, [toast])

  const fetchCustomerDetails = useCallback(async (userId: string) => {
    try {
      setOrdersLoading(true)
      const [stats, userDetails] = await Promise.all([
        getUserStatistics(userId),
        getUserById(userId)
      ])
      
      setCustomerStats(stats)
      
      let orders: Order[] = []
      if (stats.recent_orders?.length) {
        orders = (await Promise.all(
          stats.recent_orders.map(order => fetchOrderDetails(order.id))
        )).filter(Boolean) as Order[]
      }
      
      setCustomerOrders(orders)
      
      // Calculate stats from actual orders
      const orderCount = orders.length
      const totalSpent = orders.reduce((sum, order) => sum + parseFloat(order.total), 0)
      const lastOrderDate = orders.length > 0 
        ? orders.reduce((latest, order) => 
            new Date(order.created_at) > new Date(latest.created_at) ? order : latest
          ).created_at
        : undefined

      setSelectedCustomer({
        ...userDetails.user,
        order_count: orderCount,
        total_spent: totalSpent,
        last_order_date: lastOrderDate
      })
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
  }, [fetchOrderDetails, toast])

  const fetchCustomers = useCallback(async () => {
    try {
      setLoading(true)
      const data = await getUsersWithOrders()
      
      const nonGuestUsers = data.users.filter((user: any) => 
        !user.email.includes('guest-') && !user.email.includes('@example.com')
      )

      const formattedCustomers = await Promise.all(
        nonGuestUsers.map(async (user: any) => {
          const stats = await getUserStatistics(user.id)
          return {
            id: user.id,
            first_name: user.first_name,
            last_name: user.last_name,
            email: user.email,
            phone_number: user.phone_number || undefined,
            created_at: user.created_at,
            updated_at: user.updated_at,
            order_count: stats.order_statistics?.total_orders || 0,
            total_spent: stats.order_statistics?.total_spent || 0,
            last_order_date: stats.order_statistics?.last_order_date
          }
        })
      )

      formattedCustomers.sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      )

      setCustomers(formattedCustomers)
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
  }, [toast])

  useEffect(() => {
    fetchCustomers()
  }, [fetchCustomers])

  const handleCustomerSelect = useCallback(async (customer: Customer) => {
    setSelectedCustomer(customer)
    setShowOrders(false)
    setCustomerOrders([])
    setCustomerStats(null)
    await fetchCustomerDetails(customer.id)
  }, [fetchCustomerDetails])

  const toggleShowOrders = useCallback(() => {
    setShowOrders(prev => !prev)
  }, [])

  const toggleExpandOrder = useCallback((orderId: string) => {
    setExpandedOrder(prev => prev === orderId ? null : orderId)
  }, [])

  const filteredCustomers = customers.filter(customer =>
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

      <div className="rounded-[5px] border-0 p-6 bg-[#171717]">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead className="text-right">Orders</TableHead>
              <TableHead className="text-right">Total Spent</TableHead>
              <TableHead className="text-right">Last Order</TableHead>
              <TableHead className="text-right">Joined</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  Loading customers...
                </TableCell>
              </TableRow>
            ) : filteredCustomers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  {search ? "No matching customers found" : "No customers found"}
                </TableCell>
              </TableRow>
            ) : (
              filteredCustomers.map((customer) => (
                <TableRow 
                  key={customer.id} 
                  className="cursor-pointer hover:bg-gray-50 hover:text-black"
                  onClick={() => handleCustomerSelect(customer)}
                >
                  <TableCell>
                    {customer.first_name} {customer.last_name}
                  </TableCell>
                  <TableCell>
                    {customer.email}
                  </TableCell>
                  <TableCell>
                    {customer.phone_number || '-'}
                  </TableCell>
                  <TableCell className="text-right">
                    {customer.order_count}
                  </TableCell>
                  <TableCell className="text-right">
                    {customer.total_spent ? formatCurrency(customer.total_spent) : '-'}
                  </TableCell>
                  <TableCell className="text-right">
                    {customer.last_order_date ? formatDate(customer.last_order_date) : '-'}
                  </TableCell>
                  <TableCell className="text-right">
                    {formatDate(customer.created_at)}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {selectedCustomer && (
        <Dialog open={!!selectedCustomer} onOpenChange={() => setSelectedCustomer(null)}>
          <DialogContent className="rounded-[5px] border-0 p-6 bg-[#171717] max-w-4xl max-h-[90vh] overflow-y-auto">
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

                <div className="space-y-2">
                  <h4 className="font-medium">Order Statistics</h4>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total Orders:</span>
                    <span>{selectedCustomer.order_count}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Amount Spent:</span>
                    <span>{formatCurrency(selectedCustomer.total_spent)}</span>
                  </div>
                  {customerStats?.order_statistics?.average_order_value && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Average Order:</span>
                      <span>{formatCurrency(customerStats.order_statistics.average_order_value)}</span>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium">Account</h4>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Joined:</span>
                    <span>{formatDate(selectedCustomer.created_at)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Last Updated:</span>
                    <span>{formatDate(selectedCustomer.updated_at)}</span>
                  </div>
                </div>

                {customerStats?.order_statistics?.favorite_categories?.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-medium">Top Categories</h4>
                    {customerStats.order_statistics.favorite_categories.map((cat) => (
                      <div key={cat.category_name} className="flex justify-between">
                        <span className="text-muted-foreground">{cat.category_name}:</span>
                        <span>{cat.items_ordered} items</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {selectedCustomer.order_count > 0 && (
                <div className="pt-4 space-y-4">
                  <Button 
                    variant="outline" 
                    className="w-full flex items-center justify-between"
                    onClick={toggleShowOrders}
                  >
                    <span>Recent Orders ({selectedCustomer.order_count})</span>
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
                                className="p-4 cursor-pointer hover:bg-gray-50 hover:text-black flex justify-between items-center"
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
                                      <p>{order.shipping_city}, {order.shipping_state}</p>
                                      {/* Removed city */}
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