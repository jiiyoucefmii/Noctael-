"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { 
  BarChart3, 
  Box, 
  Home, 
  LayoutDashboard, 
  LogOut, 
  Package, 
  ShoppingCart, 
  Users, 
  Tag, 
  MapPin,
  PhoneCall,
  ChevronRight,
  ChevronLeft
} from "lucide-react"
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend
} from 'recharts'

import { Button } from "@/components/ui/button"
import AdminProducts from "@/components/admin/products"
import AdminOrders from "@/components/admin/orders"
import AdminCustomers from "@/components/admin/customers"
import AdminWaitlist from "@/components/admin/waitlist"
import AdminPromotions from "@/components/admin/promotions"
import AdminShippingOptions from "@/components/admin/shippingOptions"

import { getAllOrders, Order } from "@/utils/api/orders"
import { getUsersWithOrders, logoutUser } from "@/utils/api/users"
import { getProducts } from "@/utils/api/products"

// Update the tabs array to include the waitlist tab
const tabs = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "products", label: "Products", icon: Package },
  { id: "orders", label: "Orders", icon: ShoppingCart },
  { id: "customers", label: "Customers", icon: Users },
  { id: "waitlist", label: "Waitlist", icon: PhoneCall },
  { id: "promotions", label: "Promotions", icon: Tag },
  { id: "shipping", label: "Shipping", icon: MapPin },
]

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("dashboard")
  const [dashboardData, setDashboardData] = useState({
    totalProducts: 0,
    totalOrders: 0,
    totalCustomers: 0,
    recentOrders: [] as Order[],
    salesData: [] as { name: string; sales: number; orders: number }[]
  })
  const [loading, setLoading] = useState(true)
  const [sidebarVisible, setSidebarVisible] = useState(true)

  useEffect(() => {
    if (activeTab === "dashboard") fetchDashboardData()
  }, [activeTab])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      const [productsRes, ordersRes, usersRes] = await Promise.all([
        getProducts(),
        getAllOrders(),
        getUsersWithOrders()
      ])
      
      const salesData = processSalesData(ordersRes.orders)
      
      setDashboardData({
        totalProducts: productsRes.length,
        totalOrders: ordersRes.count,
        totalCustomers: usersRes.count,
        recentOrders: ordersRes.orders.slice(0, 5),
        salesData
      })
    } catch (error) {
      console.error("Dashboard error:", error)
    } finally {
      setLoading(false)
    }
  }

  const processSalesData = (orders: Order[]) => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
                    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
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
  
    return last6Months.map(({ month, year, name }) => {
      const monthOrders = orders.filter(o => {
        const d = new Date(o.created_at)
        return d.getMonth() === month && d.getFullYear() === year
      })
      
      const totalSales = monthOrders.reduce((sum, o) => {
        const orderTotal = Number(o.total) || 0
        return sum + orderTotal
      }, 0)
      
      return { 
        name, 
        sales: totalSales, 
        orders: monthOrders.length 
      }
    })
  }

  const toggleSidebar = () => {
    setSidebarVisible(!sidebarVisible)
  }

  const handleLogout = async () => {
    try {
      await logoutUser()
      window.location.href = "/auth/login"
    } catch (err) {
      // Optionally handle error
    }
  }

  return (
    <div className="flex min-h-screen relative">
      {/* Sidebar Toggle Button (visible when sidebar is hidden) */}
      {!sidebarVisible && (
        <button 
          onClick={toggleSidebar}
          className="fixed left-0 top-20 z-10 bg-[#171717] text-white p-2 rounded-r-md shadow-md"
          aria-label="Show sidebar"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      )}

      {/* Sidebar */}
      <div 
        className={`w-64 border-0 bg-[#171717] text-white transition-all duration-300 ease-in-out ${
          sidebarVisible ? 'translate-x-0' : '-translate-x-full'
        } absolute h-full z-10`}
      > 
        <div className="flex h-16 items-center border-b border-gray-800 px-6 justify-between">
          <Link href="/admin" className="flex items-center font-semibold text-white">
            <Box className="mr-2 h-6 w-6" /> Noctael Admin
          </Link>
          <button 
            onClick={toggleSidebar} 
            className="text-gray-400 hover:text-white"
            aria-label="Hide sidebar"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
        </div>
        <div className="p-4">
          <nav className="space-y-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                className={`flex w-full items-center rounded-md px-3 py-2 text-sm font-medium ${
                  activeTab === tab.id ? "bg-gray-800 text-white" : "text-gray-300 hover:bg-gray-800 hover:text-white"
                }`}
                onClick={() => setActiveTab(tab.id)}
              >
                <tab.icon className="mr-2 h-4 w-4" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
        <div className="absolute bottom-4 left-4 right-4 space-y-2"> 
          <Button asChild variant="outline" className="w-full justify-start border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white">
            <Link href="/">
              <Home className="mr-2 h-4 w-4" />
              View Store
            </Link>
          </Button>
          <Button
            variant="outline"
            className="w-full justify-start text-red-500 border-gray-700 hover:bg-gray-800 hover:text-red-400"
            onClick={handleLogout}
          >
            <LogOut className="mr-2 h-4 w-4" /> Logout
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className={`flex-1 p-6 transition-all duration-300 ease-in-out ${sidebarVisible ? '' : 'ml-0'}`}>
        {activeTab === "dashboard" && <AdminDashboardContent data={dashboardData} loading={loading} />}
        {activeTab === "products" && <AdminProducts />}
        {activeTab === "orders" && <AdminOrders />}
        {activeTab === "customers" && <AdminCustomers />}
        {activeTab === "waitlist" && <AdminWaitlist />}
        {activeTab === "promotions" && <AdminPromotions />}
        {activeTab === "shipping" && <AdminShippingOptions />}
      </div>
    </div>
  )
}

function AdminDashboardContent({ data, loading }: { data: typeof dashboardData, loading: boolean }) {
  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Dashboard</h1>
      
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-black"></div>
        </div>
      ) : (
        <>
          {/* Stats Cards */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <StatCard 
              icon={<Package className="h-6 w-6 text-blue-600" />} 
              title="Total Products" 
              value={data.totalProducts} 
              bgColor="bg-blue-100"
            />
            <StatCard 
              icon={<ShoppingCart className="h-6 w-6 text-green-600" />} 
              title="Total Orders" 
              value={data.totalOrders} 
              bgColor="bg-green-100"
            />
            <StatCard 
              icon={<Users className="h-6 w-6 text-purple-600" />} 
              title="Total Customers" 
              value={data.totalCustomers} 
              bgColor="bg-purple-100"
            />
          </div>

          {/* Charts and Recent Orders */}
          <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Sales Chart */}
            <div className="rounded-[5px] border-0 p-6 bg-[#171717]">
              <h2 className="mb-4 text-lg font-medium">Sales Overview</h2>
              <div className="h-64">
                {data.salesData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={data.salesData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip 
                        formatter={(value: number) => [`${value.toFixed(0)} Da`, 'Sales']}
                        labelFormatter={(label) => `Month: ${label}`}
                      />
                      <Legend />
                      <Line 
                        type="monotone" 
                        dataKey="sales" 
                        stroke="#3b82f6" 
                        strokeWidth={2}
                        activeDot={{ r: 8 }}
                        name="Sales"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center bg-gray-50 rounded-lg">
                    <BarChart3 className="h-16 w-16 text-gray-300" />
                    <p className="ml-2 text-gray-500">No sales data available</p>
                  </div>
                )}
              </div>
            </div>

            {/* Recent Orders */}
            <div className="rounded-[5px] border-0 p-6 bg-[#171717]">
              <h2 className="mb-4 text-lg font-medium">Recent Orders</h2>
              <div className="space-y-4">
                {data.recentOrders.length > 0 ? (
                  data.recentOrders.map((order) => (
                    <OrderCard key={order.id} order={order} />
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

function StatCard({ icon, title, value, bgColor }: { 
  icon: React.ReactNode, 
  title: string, 
  value: number, 
  bgColor: string 
}) {
  return (
    <div className="rounded-[5px] border-0 p-4 md:p-6 bg-[#171717]">
      <div className="flex items-center">
        <div className={`rounded-full ${bgColor} p-2 md:p-3`}>
          {icon}
        </div>
        <div className="ml-3 md:ml-4">
          <p className="text-xs md:text-sm text-gray-500">{title}</p>
          <h3 className="text-xl md:text-2xl font-bold">{value}</h3>
        </div>
      </div>
    </div>
  )
}

function OrderCard({ order }: { order: Order }) {
  return (
    <div className="flex items-center justify-between border-b pb-3">
      <div>
        <p className="text-sm md:text-base font-medium">Order #{order.id.slice(0, 8)}</p>
        <p className="text-xs md:text-sm text-gray-500">
          {new Date(order.created_at).toLocaleDateString()}
        </p>
      </div>
      <div className="text-right">
        <p className="text-sm md:text-base font-medium">{Number(order.total).toFixed(0)} Da</p>
        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
            order.status === 'accepted' 
              ? 'bg-green-100 text-green-800' 
              : 'bg-yellow-100 text-yellow-800'
          }`}>
          {order.status}
        </span>
      </div>
    </div>
  )
}