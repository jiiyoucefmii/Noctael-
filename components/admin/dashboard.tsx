"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { BarChart3, Box, Home, LayoutDashboard, LogOut, Package, Settings, ShoppingCart, Users } from "lucide-react"

import { Button } from "@/components/ui/button"
import AdminProducts from "@/components/admin/products"
import AdminOrders from "@/components/admin/orders"
import AdminCustomers from "@/components/admin/customers"
import AdminSettings from "@/components/admin/settings"
import { getAllOrders, getUserStatistics, Order, } from "@/utils/api/orders"
import {getUsersWithOrders} from "@/utils/api/users"
import { getProducts } from "@/utils/api/products"

const tabs = [
  {
    id: "dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
  },
  {
    id: "products",
    label: "Products",
    icon: Package,
  },
  {
    id: "orders",
    label: "Orders",
    icon: ShoppingCart,
  },
  {
    id: "customers",
    label: "Customers",
    icon: Users,
  },
  {
    id: "settings",
    label: "Settings",
    icon: Settings,
  },
]

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("dashboard")
  const [dashboardData, setDashboardData] = useState<{
    totalProducts: number
    totalOrders: number
    totalCustomers: number
    recentOrders: Order[]
    salesData: { name: string; sales: number; orders: number }[]
  }>({
    totalProducts: 0,
    totalOrders: 0,
    totalCustomers: 0,
    recentOrders: [],
    salesData: []
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (activeTab === "dashboard") {
      fetchDashboardData()
    }
  }, [activeTab])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      
      // Fetch all data in parallel
      const [productsRes, ordersRes, usersRes] = await Promise.all([
        getProducts(),
        getAllOrders(),
        getUsersWithOrders()
      ])

      console.log('Products API response:', productsRes)
    console.log('Orders API response:', ordersRes)
    console.log('Users API response:', usersRes)
      
      // Process sales data for the chart (last 6 months)
      const salesData = processSalesData(ordersRes.orders)
      
      setDashboardData({
        totalProducts: productsRes.length,
        totalOrders: ordersRes.count,
        totalCustomers: usersRes.count,
        recentOrders: ordersRes.orders.slice(0, 5),
        salesData
      })
    } catch (error) {
      console.error("Error fetching dashboard data:", error)
    } finally {
      setLoading(false)
    }
  }

  const processSalesData = (orders: any[]) => {
    const months = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ]
    
    // Get current date and previous 5 months
    const currentDate = new Date()
    const last6Months = Array.from({ length: 6 }, (_, i) => {
      const date = new Date(currentDate)
      date.setMonth(date.getMonth() - i)
      return {
        month: date.getMonth(),
        year: date.getFullYear(),
        name: `${months[date.getMonth()]} ${date.getFullYear()}`
      }
    }).reverse()
    
    // Calculate sales for each month
    return last6Months.map(({ month, year, name }) => {
      const monthOrders = orders.filter(order => {
        const orderDate = new Date(order.created_at)
        return orderDate.getMonth() === month && 
               orderDate.getFullYear() === year
      })
      
      const totalSales = monthOrders.reduce((sum, order) => sum + order.total, 0)
      
      return {
        name,
        sales: totalSales,
        orders: monthOrders.length
      }
    })
  }

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <div className="w-64 border-r bg-gray-50">
        <div className="flex h-16 items-center border-b px-6">
          <Link href="/admin" className="flex items-center font-semibold">
            <Box className="mr-2 h-6 w-6" />
            Noctael Admin
          </Link>
        </div>
        <div className="p-4">
          <nav className="space-y-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                className={`flex w-full items-center rounded-md px-3 py-2 text-sm font-medium ${
                  activeTab === tab.id ? "bg-black text-white" : "text-gray-700 hover:bg-gray-100"
                }`}
                onClick={() => setActiveTab(tab.id)}
              >
                <tab.icon className="mr-2 h-4 w-4" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
        <div className="absolute bottom-4 left-4 right-4">
          <div className="space-y-2">
            <Button asChild variant="outline" className="w-full justify-start">
              <Link href="/">
                <Home className="mr-2 h-4 w-4" />
                View Store
              </Link>
            </Button>
            <Button variant="outline" className="w-full justify-start text-red-600">
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1">
        <div className="p-6">
          {activeTab === "dashboard" && (
            <AdminDashboardContent 
              data={dashboardData} 
              loading={loading} 
            />
          )}
          {activeTab === "products" && <AdminProducts />}
          {activeTab === "orders" && <AdminOrders />}
          {activeTab === "customers" && <AdminCustomers />}
          {activeTab === "settings" && <AdminSettings />}
        </div>
      </div>
    </div>
  )
}

interface DashboardContentProps {
  data: {
    totalProducts: number
    totalOrders: number
    totalCustomers: number
    recentOrders: any[]
    salesData: any[]
  }
  loading: boolean
}

function AdminDashboardContent({ data, loading }: DashboardContentProps) {
  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Dashboard</h1>
      
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-black"></div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <div className="rounded-lg border p-6">
              <div className="flex items-center">
                <div className="rounded-full bg-blue-100 p-3">
                  <Package className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-500">Total Products</p>
                  <h3 className="text-2xl font-bold">{data.totalProducts}</h3>
                </div>
              </div>
            </div>
            <div className="rounded-lg border p-6">
              <div className="flex items-center">
                <div className="rounded-full bg-green-100 p-3">
                  <ShoppingCart className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-500">Total Orders</p>
                  <h3 className="text-2xl font-bold">{data.totalOrders}</h3>
                </div>
              </div>
            </div>
            <div className="rounded-lg border p-6">
              <div className="flex items-center">
                <div className="rounded-full bg-purple-100 p-3">
                  <Users className="h-6 w-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-500">Total Customers</p>
                  <h3 className="text-2xl font-bold">{data.totalCustomers}</h3>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div className="rounded-lg border p-6">
              <h2 className="mb-4 text-lg font-medium">Sales Overview</h2>
              <div className="h-64">
              {data.salesData.length > 0 ? (
                <div className="flex h-full items-end space-x-2">
                  {data.salesData.map((month, index) => (
                    <div key={index} className="flex-1 flex flex-col items-center">
                      <div 
                        className="w-full bg-blue-500 rounded-t-sm"
                        style={{ height: `${(month.sales / Math.max(...data.salesData.map(m => m.sales))) * 100}%` }}
                        ></div>
                      <span className="text-xs mt-2 text-gray-500">{month.name}</span>
                      <span className="text-xs font-medium">
  {Number(month.sales).toFixed(2)}
</span>
                      </div>
                  ))}
                </div>
              ) : (
                <div className="h-full flex items-center justify-center bg-gray-50 rounded-lg">
                  <BarChart3 className="h-16 w-16 text-gray-300" />
                  <p className="ml-2 text-gray-500">No sales data available</p>
                </div>
              )}
              </div>
            </div>

            <div className="rounded-lg border p-6">
              <h2 className="mb-4 text-lg font-medium">Recent Orders</h2>
              <div className="space-y-4">
                {data.recentOrders.length > 0 ? (
                  data.recentOrders.map((order) => (
                    <div key={order.id} className="flex items-center justify-between border-b pb-3">
                      <div>
                        <p className="font-medium">Order #{order.id.slice(0, 8)}</p>
                        <p className="text-sm text-gray-500">
                          {new Date(order.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                      <p className="font-medium">${Number(order.total).toFixed(2)}</p>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                          order.status === 'accepted' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {order.status}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="h-full flex items-center justify-center bg-gray-50 rounded-lg p-4">
                    <p className="text-gray-500">No recent orders</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}