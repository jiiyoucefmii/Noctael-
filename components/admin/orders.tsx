"use client"

import { useEffect, useState, useRef } from "react"
import { Search } from "lucide-react"
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
import { getPaginatedOrders, updateOrderStatus } from "@/utils/api/orders"
import { getUserById } from "@/utils/api/users"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem
} from "@/components/ui/select"
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
  shipping_type: string
  first_name: string
  last_name: string
  subtotal: string
  discount_amount: string
  is_discounted: boolean
}

interface OrderCache {
  [page: number]: Order[]
}

export default function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([])
  const [allOrdersCache, setAllOrdersCache] = useState<OrderCache>({})
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [isLoading, setIsLoading] = useState(true)
  const [isBackgroundLoading, setIsBackgroundLoading] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [page, setPage] = useState(1)
  const [limit] = useState(10)
  const [totalPages, setTotalPages] = useState(1)
  const [totalOrders, setTotalOrders] = useState(0)
  const [backgroundFetchComplete, setBackgroundFetchComplete] = useState(false)
  const backgroundFetchRef = useRef<AbortController | null>(null)
  const { toast } = useToast()

  const getFullImageUrl = (imagePath: string) => {
    if (!imagePath) return ""
    if (imagePath.startsWith("http")) return imagePath
    const apiUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") || ""
    return imagePath.startsWith("/") ? `${apiUrl}${imagePath}` : `${apiUrl}/${imagePath}`
  }

  const enrichOrderWithUserData = async (order: any): Promise<Order> => {
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
  }

  // Background fetch function to load all remaining orders
  const fetchAllOrdersInBackground = async (totalPagesCount: number) => {
    if (totalPagesCount <= 1 || backgroundFetchComplete) return
    
    setIsBackgroundLoading(true)
    
    // Cancel any existing background fetch
    if (backgroundFetchRef.current) {
      backgroundFetchRef.current.abort()
    }
    
    backgroundFetchRef.current = new AbortController()
    const signal = backgroundFetchRef.current.signal
    
    try {
      const promises: Promise<void>[] = []
      
      // Fetch all pages from 2 to totalPages
      for (let pageNum = 2; pageNum <= totalPagesCount; pageNum++) {
        const fetchPagePromise = async () => {
          try {
            if (signal.aborted) return
            
            const { orders: fetchedOrders } = await getPaginatedOrders(pageNum, limit)
            const enrichedOrders = await Promise.all(
              fetchedOrders.map(enrichOrderWithUserData)
            )
            
            if (!signal.aborted) {
              setAllOrdersCache(prev => ({
                ...prev,
                [pageNum]: enrichedOrders
              }))
            }
          } catch (error) {
            if (!signal.aborted) {
              console.warn(`Failed to fetch page ${pageNum}:`, error)
            }
          }
        }
        
        promises.push(fetchPagePromise())
        
        // Add a small delay between requests to avoid overwhelming the server
        if (pageNum < totalPagesCount) {
          await new Promise(resolve => setTimeout(resolve, 100))
        }
      }
      
      await Promise.all(promises)
      
      if (!signal.aborted) {
        setBackgroundFetchComplete(true)
        console.log('Background fetch completed successfully')
      }
    } catch (error) {
      if (!signal.aborted) {
        console.warn('Background fetch failed:', error)
      }
    } finally {
      if (!signal.aborted) {
        setIsBackgroundLoading(false)
      }
    }
  }

  // Initial fetch for the current page
  useEffect(() => {
    const fetchCurrentPage = async () => {
      setIsLoading(true)
      try {
        const { orders: fetchedOrders, pagination } = await getPaginatedOrders(page, limit)
        setTotalPages(pagination.totalPages)
        setTotalOrders(pagination.totalOrders)

        // Check if we already have this page cached
        if (allOrdersCache[page]) {
          setOrders(allOrdersCache[page])
          setIsLoading(false)
          return
        }

        const enrichedOrders = await Promise.all(
          fetchedOrders.map(enrichOrderWithUserData)
        )

        setOrders(enrichedOrders)
        
        // Cache the current page
        setAllOrdersCache(prev => ({
          ...prev,
          [page]: enrichedOrders
        }))

        // Start background fetch if this is the first page and there are more pages
        if (page === 1 && pagination.totalPages > 1) {
          fetchAllOrdersInBackground(pagination.totalPages)
        }
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

    fetchCurrentPage()
  }, [page, toast])

  // Handle page changes with cached data
  useEffect(() => {
    if (allOrdersCache[page]) {
      setOrders(allOrdersCache[page])
    }
  }, [page, allOrdersCache])

  const handleStatusChange = async (order: Order, status: string) => {
    try {
      await updateOrderStatus(order.id, status)
      
      // Update the order in current state
      setOrders(prev =>
        prev.map(o => (o.id === order.id ? { ...o, status } : o))
      )
      
      // Update the order in cache
      setAllOrdersCache(prev => {
        const newCache = { ...prev }
        Object.keys(newCache).forEach(pageKey => {
          const pageNum = parseInt(pageKey)
          newCache[pageNum] = newCache[pageNum].map(o => 
            o.id === order.id ? { ...o, status } : o
          )
        })
        return newCache
      })
      
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

  const filteredOrders = orders.filter(order => {
    const matchesSearch =
      order.user_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.id.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus =
      statusFilter === "all" || order.status === statusFilter
    return matchesSearch && matchesStatus
  })

  // Cleanup background fetch on unmount
  useEffect(() => {
    return () => {
      if (backgroundFetchRef.current) {
        backgroundFetchRef.current.abort()
      }
    }
  }, [])

  return (
    <div className="rounded-[5px] border-0 p-4 sm:p-6 bg-[#171717] w-full">
      <div className="flex justify-between items-center mb-4 sm:mb-6">
        <h1 className="text-xl sm:text-2xl font-bold">Orders</h1>
        {isBackgroundLoading && (
          <div className="text-xs text-muted-foreground">
            Loading all orders... ({Object.keys(allOrdersCache).length - 1}/{totalPages - 1} pages cached)
          </div>
        )}
        {backgroundFetchComplete && (
          <div className="text-xs text-green-600">
            ✓ All {totalOrders} orders cached
          </div>
        )}
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
            {isLoading && !allOrdersCache[page] ? (
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
                  <TableCell className="hidden sm:table-cell">{Number(order.total).toFixed(0)} Da</TableCell>
                  <TableCell className="hidden sm:table-cell">
                    {new Date(order.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex flex-col sm:flex-row sm:space-x-2 space-y-2 sm:space-y-0 items-end">
                      <Button size="sm" variant="outline" onClick={() => handleViewDetails(order)}>View Details</Button>
                      <Button size="sm" variant="outline" onClick={() => handleStatusChange(order, "accepted")} disabled={order.status !== "pending"}>Accept</Button>
                      <Button size="sm" variant="outline" onClick={() => handleStatusChange(order, "shipped")} disabled={order.status !== "accepted"}>Mark Shipped</Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination - now with instant navigation for cached pages */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-4 space-x-4">
          <Button 
            variant="outline" 
            disabled={page === 1} 
            onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
          >
            Previous
          </Button>
          <span className="self-center text-sm text-muted-foreground">
            Page {page} of {totalPages}
            {allOrdersCache[page] && !isLoading && (
              <span className="text-green-600 ml-1">✓</span>
            )}
          </span>
          <Button 
            variant="outline" 
            disabled={page === totalPages} 
            onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
          >
            Next
          </Button>
        </div>
      )}

      {/* Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="rounded-[5px] border-0 p-4 sm:p-6 bg-[#171717] w-[95vw] max-w-full sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Order Details</DialogTitle>
            <DialogDescription>Order ID: {selectedOrder?.id}</DialogDescription>
          </DialogHeader>

          {selectedOrder && (
            <>
              {/* Customer + Shipping Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
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
      <p><span className="text-muted-foreground">Shipping Type:</span> 
        {selectedOrder.shipping_type === 'to_desk' ? ' To Desk' : ' To Home'}
      </p>
    </div>
  </div>
</div>

              {/* Order Items */}
              <div className="mb-6">
                <h3 className="font-medium mb-2">Order Items</h3>
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
                          <div className="flex items-center space-x-4">
                            <Image
                              src={getFullImageUrl(item.image)}
                              alt={item.product_name}
                              width={64}
                              height={64}
                              className="rounded-md object-cover"
                              unoptimized={item.image.startsWith("http")}
                            />
                            <div>
                              <p className="font-medium text-sm">{item.product_name}</p>
                              <p className="text-xs text-muted-foreground">{item.color} / {item.size}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{item.price.toFixed(0)} Da</TableCell>
                        <TableCell>{item.quantity}</TableCell>
                        <TableCell>{(item.price * item.quantity).toFixed(0)} Da</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Summary */}
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
            </>
          )}

          <DialogFooter className="mt-4 flex flex-col sm:flex-row gap-2 sm:gap-0">
            <Button variant="outline" className="w-full sm:w-auto" onClick={() => setIsDialogOpen(false)}>Close</Button>
            {selectedOrder?.status === "pending" && (
              <Button className="w-full sm:w-auto" onClick={() => {
                handleStatusChange(selectedOrder, "accepted")
                setIsDialogOpen(false)
              }}>
                Accept Order
              </Button>
            )}
            {selectedOrder?.status === "accepted" && (
              <Button className="w-full sm:w-auto" onClick={() => {
                handleStatusChange(selectedOrder, "shipped")
                setIsDialogOpen(false)
              }}>
                Mark as Shipped
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}