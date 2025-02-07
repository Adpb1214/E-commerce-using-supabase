"use client";

import { useEffect, useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { format } from "date-fns";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Loader2,
  Package,
  DollarSign,
  ShoppingCart,
  Users,
} from "lucide-react";

export const dynamic = "force-dynamic"; // Enforce dynamic rendering for Next.js

type OrderItem = {
  product_id: string;
  quantity: number;
  price: number;
  products: {
    title: string;
    description: string;
  };
};

type Order = {
  id: string;
  total_price: number;
  created_at: string;
  order_status: string;
  user: {
    id: string;
    phone_number: string;
    name: string;
  };
  order_items: OrderItem[];
};

export default function AdminOrders() {
  const supabase = createClientComponentClient();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [metrics, setMetrics] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    averageOrderValue: 0,
    pendingOrders: 0,
  });

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    setError("");

    const { data, error } = await supabase
      .from("orders")
      .select(
        `id, total_price, created_at, order_status,
         user:profiles!inner (id, phone_number, name),
         order_items (product_id, quantity, price, products!inner (title, description))
      `
      )
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching orders:", error.message);
      setError("Failed to fetch orders. Please try again.");
      setLoading(false);
      return;
    }

    console.log("Supabase Orders Data:", data); // Debugging step

    // Convert array fields into single objects if needed
    const formattedData: Order[] = data.map((order) => ({
      id: order.id,
      total_price: order.total_price,
      created_at: order.created_at,
      order_status: order.order_status,
      user: order.user, // Directly assign user object
      order_items: order.order_items.map((item) => ({
        product_id: item.product_id,
        quantity: item.quantity,
        price: item.price,
        products: item.products, // Directly assign product object
      })),
    }));

    setOrders(formattedData);
    calculateMetrics(formattedData);
    setLoading(false);
  };

  const calculateMetrics = (orders: Order[]) => {
    const totalRevenue = orders.reduce((sum, order) => sum + order.total_price, 0);
    const pendingOrders = orders.filter((order) => order.order_status === "Pending").length;

    setMetrics({
      totalRevenue,
      totalOrders: orders.length,
      averageOrderValue: orders.length ? totalRevenue / orders.length : 0,
      pendingOrders,
    });
  };

  const updateOrderStatus = async (orderId: string, status: string) => {
    const { error } = await supabase.from("orders").update({ order_status: status }).eq("id", orderId);

    if (error) {
      console.error("Error updating order status:", error.message);
      return false;
    }

    await fetchOrders();
    return true;
  };

  const getStatusBadge = (status: string) => {
    const statusStyles = {
      Pending: "bg-yellow-100 text-yellow-800",
      Shipped: "bg-blue-100 text-blue-800",
      Delivered: "bg-green-100 text-green-800",
      Cancelled: "bg-red-100 text-red-800",
    };
    return <Badge className={statusStyles[status as keyof typeof statusStyles]}>{status}</Badge>;
  };

  return (
    <div className="p-6 space-y-6">
      {/* Metrics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[
          { title: "Total Revenue", value: `$${metrics.totalRevenue.toFixed(2)}`, icon: DollarSign },
          { title: "Total Orders", value: metrics.totalOrders, icon: Package },
          { title: "Average Order Value", value: `$${metrics.averageOrderValue.toFixed(2)}`, icon: ShoppingCart },
          { title: "Pending Orders", value: metrics.pendingOrders, icon: Users },
        ].map((metric, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">{metric.title}</CardTitle>
              <metric.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metric.value}</div>
              <p className="text-xs text-muted-foreground">+10% from last month</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Orders Table */}
      <Card>
        <CardHeader>
          <CardTitle>Latest Orders</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center p-8">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : error ? (
            <div className="text-red-500 p-4">{error}</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Items</TableHead>
                  <TableHead>Order Date</TableHead>
                  <TableHead>Total Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">#{order.id}</TableCell>
                    <TableCell>
                      <div>{order.user?.name}</div>
                      <div className="text-sm text-muted-foreground">{order.user?.phone_number}</div>
                    </TableCell>
                    <TableCell>
                      {order.order_items.map((item) => (
                        <div key={item.product_id}>{item.products?.title} x {item.quantity}</div>
                      ))}
                    </TableCell>
                    <TableCell>{format(new Date(order.created_at), "MMM d, yyyy HH:mm")}</TableCell>
                    <TableCell>${order.total_price.toFixed(2)}</TableCell>
                    <TableCell>{getStatusBadge(order.order_status)}</TableCell>
                    <TableCell>
                      <Select defaultValue={order.order_status} onValueChange={(value) => updateOrderStatus(order.id, value)}>
                        <SelectTrigger className="w-[120px]">
                          <SelectValue placeholder="Update status" />
                        </SelectTrigger>
                        <SelectContent>
                          {["Pending", "Shipped", "Delivered", "Cancelled"].map((status) => (
                            <SelectItem key={status} value={status}>{status}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
