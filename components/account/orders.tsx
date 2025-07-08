"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";
import { getUserOrders } from "@/utils/api/orders"; // adjust path if needed
import type { Order } from "@/utils/api/orders";

export default function AccountOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const data = await getUserOrders();
      
        
        setOrders(data.orders || []);
      } catch (err: any) {
        setError(err.message || "Something went wrong");
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Delivered":
      case "accepted":
        return <Badge className="bg-green-500">{status}</Badge>;
      case "Shipped":
        return <Badge className="bg-blue-500">{status}</Badge>;
      case "Processing":
      case "pending":
        return <Badge className="bg-yellow-500">{status}</Badge>;
      case "Cancelled":
        return <Badge className="bg-red-500">{status}</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Order History</CardTitle>
        <CardDescription>View and track your orders</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex h-40 items-center justify-center">
            <Loader2 className="animate-spin" />
          </div>
        ) : error ? (
          <div className="text-center text-red-500">{error}</div>
        ) : orders.length === 0 ? (
          <div className="flex h-40 flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
            <p className="mb-2 text-lg font-medium">No orders yet</p>
            <p className="mb-4 text-sm text-gray-500">You haven't placed any orders yet.</p>
            <Button asChild>
              <Link href="/products">Start Shopping</Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div key={order.id} className="rounded-lg border p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="font-medium">Order #{order.id}</p>
                    <p className="text-sm text-gray-500">{new Date(order.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div>{getStatusBadge(order.status)}</div>
                </div>
                <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="text-sm text-gray-500">{order.items?.length ?? 0} items</p>
                    <p className="font-medium">${order.total.toFixed(2)}</p>
                  </div>
                  <Button asChild variant="outline" size="sm">
                    <Link href={`/account/orders/${order.id}`}>View Details</Link>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
