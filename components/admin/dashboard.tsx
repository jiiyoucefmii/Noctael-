"use client"

import { useState } from "react"
import Link from "next/link"
import { BarChart3, Box, Home, LayoutDashboard, LogOut, Package, Settings, ShoppingCart, Users } from "lucide-react"

import { Button } from "@/components/ui/button"
import AdminProducts from "@/components/admin/products"
import AdminOrders from "@/components/admin/orders"
import AdminCustomers from "@/components/admin/customers"
import AdminSettings from "@/components/admin/settings"

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
  const [activeTab, setActiveTab] = useState("products")

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
          {activeTab === "dashboard" && <AdminDashboardContent />}
          {activeTab === "products" && <AdminProducts />}
          {activeTab === "orders" && <AdminOrders />}
          {activeTab === "customers" && <AdminCustomers />}
          {activeTab === "settings" && <AdminSettings />}
        </div>
      </div>
    </div>
  )
}

function AdminDashboardContent() {
  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Dashboard</h1>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className="rounded-lg border p-6">
          <div className="flex items-center">
            <div className="rounded-full bg-blue-100 p-3">
              <Package className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-500">Total Products</p>
              <h3 className="text-2xl font-bold">128</h3>
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
              <h3 className="text-2xl font-bold">56</h3>
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
              <h3 className="text-2xl font-bold">2,453</h3>
            </div>
          </div>
        </div>
      </div>
      <div className="mt-8 rounded-lg border p-6">
        <h2 className="mb-4 text-lg font-medium">Sales Overview</h2>
        <div className="h-64 rounded-lg bg-gray-50 flex items-center justify-center">
          <BarChart3 className="h-16 w-16 text-gray-300" />
        </div>
      </div>
    </div>
  )
}
