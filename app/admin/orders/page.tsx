"use client";

import { createClient } from "@supabase/supabase-js";

import { useEffect, useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
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

import { format } from "date-fns";
import {
  Loader2,
  Package,
  DollarSign,
  ShoppingCart,
  Users,
} from "lucide-react";

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

const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  "https://ddhojupqexdhpvzzvznr.supabase.co";
const SUPABASE_ANON_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRkaG9qdXBxZXhkaHB2enp2em5yIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzcxOTY2NzQsImV4cCI6MjA1Mjc3MjY3NH0.1PJF-tKAjNzvUgBP6OwbT9xAzO7fiIymu2hKwMXYhSw";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true, // Ensures session persists across reloads
    detectSessionInUrl: true, // Handles session detection in the URL
  },
});
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

  console.log(orders, "odddddd");

  const fetchOrders = async () => {
    setLoading(true);

    const { data, error } = await supabase
      .from("orders")
      .select(
        `
        id,
        total_price,
        created_at,
        order_status,
       user:profiles (
      id,
      phone_number,
      name
    ),
        order_items (
          product_id,
          quantity,
          price,
          products (
            title,
            description
          )
        )
      `
      )
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching orders:", error.message);
      setError("Failed to fetch orders.");
    } else {
      // Type assertion to enforce expected structure
      const formattedData: Order[] = data.map((order) => ({
        id: order.id,
        total_price: order.total_price,
        created_at: order.created_at,
        order_status: order.order_status,

        // Extracts first user object (if array) or assigns default values
        user:
          Array.isArray(order.user) && order.user.length > 0
            ? order.user[0]
            : { id: "", phone_number: "", name: "" },

        // Ensure `products` is an object, not an array
        order_items: order.order_items.map((item) => ({
          product_id: item.product_id,
          quantity: item.quantity,
          price: item.price,
          products: Array.isArray(item.products)
            ? item.products[0]
            : item.products,
        })),
      }));

      setOrders(formattedData);
      calculateMetrics(formattedData);
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const calculateMetrics = (orders: Order[]) => {
    const totalRevenue = orders.reduce(
      (sum, order) => sum + order.total_price,
      0
    );
    const pendingOrders = orders.filter(
      (order) => order.order_status === "Pending"
    ).length;

    setMetrics({
      totalRevenue,
      totalOrders: orders.length,
      averageOrderValue: orders.length ? totalRevenue / orders.length : 0,
      pendingOrders,
    });
  };

  const updateOrderStatus = async (orderId: string, status: string) => {
    const { error } = await supabase
      .from("orders")
      .update({ order_status: status })
      .eq("id", orderId);

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
    return (
      <Badge className={statusStyles[status as keyof typeof statusStyles]}>
        {status}
      </Badge>
    );
  };

  if (error) {
    return <div className="p-4 text-red-500">{error}</div>;
  }

  return (
    <div className="p-6 space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${metrics.totalRevenue.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              +20.1% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalOrders}</div>
            <p className="text-xs text-muted-foreground">
              +15% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Average Order Value
            </CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${metrics.averageOrderValue.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">+8% from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Pending Orders
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.pendingOrders}</div>
            <p className="text-xs text-muted-foreground">+12 new orders</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Latest Orders</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center p-8">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
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
                      <div>
                        <div className="font-medium">{order.user.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {order.user.phone_number}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="max-w-[200px]">
                        {order.order_items.map((item, index) => (
                          <div key={item.product_id} className="text-sm">
                            {item.products.title} x {item.quantity}
                            {index < order.order_items.length - 1 && ", "}
                          </div>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      {format(new Date(order.created_at), "MMM d, yyyy HH:mm")}
                    </TableCell>
                    <TableCell>${order.total_price.toFixed(2)}</TableCell>
                    <TableCell>{getStatusBadge(order.order_status)}</TableCell>
                    <TableCell>
                      <Select
                        defaultValue={order.order_status}
                        onValueChange={(value) =>
                          updateOrderStatus(order.id, value)
                        }
                      >
                        <SelectTrigger className="w-[120px]">
                          <SelectValue placeholder="Update status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Pending">Pending</SelectItem>
                          <SelectItem value="Shipped">Shipped</SelectItem>
                          <SelectItem value="Delivered">Delivered</SelectItem>
                          <SelectItem value="Cancelled">Cancelled</SelectItem>
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
