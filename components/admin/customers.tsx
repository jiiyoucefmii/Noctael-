"use client"

import { useEffect, useState } from "react"
import { Search } from "lucide-react"
import { getUsersWithOrders, UserWithOrders } from "@/utils/api/users"

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

interface Customer {
  id: string
  first_name: string
  last_name: string
  email: string
  orders_count: number
  total_spent: number
  joined_date: string
}

export default function AdminCustomers() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [search, setSearch] = useState("")

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const data = await getUsersWithOrders()
        const formatted = data.users.map((user: UserWithOrders) => ({
          id: user.id,
          first_name: user.first_name,
          last_name: user.last_name,
          email: user.email,
          orders_count: user.orders?.length || 0,
          total_spent: user.orders?.reduce((sum, order) => sum + (order.total || 0), 0),
          joined_date: new Date(user.createdAt).toISOString().split("T")[0],
        }))
        setCustomers(formatted)
      } catch (error) {
        console.error("Failed to fetch customers:", error)
      }
    }

    fetchCustomers()
  }, [])

  const filteredCustomers = customers.filter((customer) =>
    `${customer.first_name} ${customer.last_name}`.toLowerCase().includes(search.toLowerCase()) ||
    customer.email.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold">Customers</h2>
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search customers..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Orders</TableHead>
            <TableHead>Total Spent</TableHead>
            <TableHead>Date Joined</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredCustomers.map((customer) => (
            <TableRow key={customer.id}>
              <TableCell>
                {customer.first_name} {customer.last_name}
              </TableCell>
              <TableCell>{customer.email}</TableCell>
              <TableCell>{customer.orders_count}</TableCell>
              <TableCell>
                {customer.total_spent.toLocaleString("en-US", {
                  style: "currency",
                  currency: "USD",
                })}
              </TableCell>
              <TableCell>{customer.joined_date}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
