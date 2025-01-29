"use client"

import { useEffect, useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Line, LineChart, Pie, PieChart, ResponsiveContainer } from "recharts";
import { ChartContainer } from "@/components/ui/chart";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { DollarSign, Package, ShoppingCart, Users } from "lucide-react";

type Product = {
  title: string;
  description: string;
  category: string;
};

type OrderItem = {
  product_id: string;
  quantity: number;
  price: number;
  products: Product;
};

type User = {
  id: string;
  phone_number: string;
  name: string;
};

type Order = {
  id: string;
  total_price: number;
  created_at: string;
  order_status: string;
  user: User;
  order_items: OrderItem[];
};

type CategoryData = { name: string; value: number };
type RevenueData = { date: string; revenue: number };

export default function DashboardPage() {
  const supabase = createClientComponentClient();
  const [orders, setOrders] = useState<Order[]>([]);
  const [metrics, setMetrics] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    averageOrderValue: 0,
    cartCompletionRate: 0,
  });
  const [categoryData, setCategoryData] = useState<CategoryData[]>([]);
  const [revenueData, setRevenueData] = useState<RevenueData[]>([]);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    const { data: orders, error } = await supabase
      .from("orders")
      .select(`
        id,
        total_price,
        created_at,
        order_status,
        user:profiles (
          id,
          phone_number,
          name
        ),
        order_items:order_items (
          product_id,
          quantity,
          price,
          products:products (
            title,
            description,
            category
          )
        )
      `)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching orders:", error);
      return;
    }

    const formattedData = (orders as any[]).map((order) => ({
      ...order,
      user: order.profiles, // Rename `profiles` to `user`
    })) as Order[];

    setOrders(formattedData || []);
    calculateMetrics(formattedData || []);
    processOrderData(formattedData || []);
  };

  const calculateMetrics = (orders: Order[]) => {
    const totalRevenue = orders.reduce(
      (sum, order) => sum + order.total_price,
      0
    );
    const averageOrderValue = totalRevenue / orders.length || 0;

    setMetrics({
      totalRevenue,
      totalOrders: orders.length,
      averageOrderValue,
      cartCompletionRate: 38, // This would normally be calculated from cart abandonment data
    });
  };

  const processOrderData = (orders: Order[]) => {
    // Process category data
    const categoryMap = new Map<string, number>();
    orders.forEach((order) => {
      order.order_items.forEach((item) => {
        const category = item.products.category;
        categoryMap.set(
          category,
          (categoryMap.get(category) || 0) + item.price * item.quantity
        );
      });
    });

    setCategoryData(
      Array.from(categoryMap.entries()).map(([name, value]) => ({
        name,
        value,
      }))
    );

    // Process revenue data
    const revenueMap = new Map<string, number>();
    orders.forEach((order) => {
      const date = new Date(order.created_at).toLocaleDateString();
      revenueMap.set(date, (revenueMap.get(date) || 0) + order.total_price);
    });

    setRevenueData(
      Array.from(revenueMap.entries())
        .map(([date, revenue]) => ({ date, revenue }))
        .slice(-14)
    ); // Last 14 days
  };

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
            <div className="text-xs text-muted-foreground">
              +20.1% from last month
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalOrders}</div>
            <div className="text-xs text-muted-foreground">
              +15% from last month
            </div>
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
            <div className="text-xs text-muted-foreground">
              +8% from last month
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Cart Completion Rate
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metrics.cartCompletionRate}%
            </div>
            <div className="text-xs text-muted-foreground">
              +5% from last month
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Revenue Over Time</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={revenueData}>
                  <Line
                    type="monotone"
                    dataKey="revenue"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Orders by Category</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="hsl(var(--primary))"
                  />
                  {/* <ChartTooltip /> */}
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Latest Orders</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order ID</TableHead>
                
                <TableHead>Products</TableHead>
                <TableHead>Total Amount</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.slice(0, 5).map((order) => (
                <TableRow key={order.id}>
                  <TableCell>#{order.id}</TableCell>
                  
                  <TableCell>{order.order_items.length} items</TableCell>
                  <TableCell>${order.total_price.toFixed(2)}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        order.order_status === "Delivered"
                          ? "default"
                          : "secondary"
                      }
                    >
                      {order.order_status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
