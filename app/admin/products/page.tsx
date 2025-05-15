"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { motion } from "framer-motion";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
} from "chart.js";
import { Bar } from "react-chartjs-2";
import { Package, AlertTriangle, TrendingUp, Archive } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement
);

type Product = {
  id: string;
  title: string;
  description: string;
  price: number;
  stock: number;
  category: string;
  image_url: string;
  sales_count: number;
};

type Order = {
  id: string;
  total_price: number;
  created_at: string;
  order_status: string;
};

const AdminPanel = () => {
  const supabase = createClientComponentClient();
  const [products, setProducts] = useState<Product[]>([]);
  const [categorySales, setCategorySales] = useState<Record<string, number>>(
    {}
  );
  const [Orders, setOrders] = useState<Order[]>();
  const [categoryInventory, setCategoryInventory] = useState<
    Record<string, number>
  >({});
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  const calculateStats = (products: Product[]) => {
    const salesByCategory: Record<string, number> = {};
    const inventoryByCategory: Record<string, number> = {};

    products.forEach((product) => {
      if (salesByCategory[product.category]) {
        salesByCategory[product.category] += product.sales_count || 0;
        inventoryByCategory[product.category] += product.stock;
      } else {
        salesByCategory[product.category] = product.sales_count || 0;
        inventoryByCategory[product.category] = product.stock;
      }
    });

    setCategorySales(salesByCategory);
    setCategoryInventory(inventoryByCategory);
  };

  useEffect(() => {
    const fetchProducts = async () => {
      const { data, error } = await supabase.from("products").select("*");
      if (error) {
        console.error("Error fetching products:", error.message);
      } else {
        setProducts(data || []);
        console.log(products, "products");
        calculateStats(data || []);
      }
      setLoading(false);
    };

    const fetchorders = async () => {
      const { data, error } = await supabase.from("orders").select("*");
      if (error) {
        console.error("Error fetching products:", error.message);
      } else {
        setOrders(data);
        console.log(Orders, "orders");
      }
      setLoading(false);
    };

    fetchProducts();
    fetchorders();
  }, [supabase]); // Added calculateStats to dependencies

  const lowStockProducts = products.filter((p) => p.stock < 15);
  const topSellingProducts = [...products]
    .sort((a, b) => (b.sales_count || 0) - (a.sales_count || 0))
    .slice(0, 5);

  // const pieChartData = {
  //   labels: Object.keys(categorySales),
  //   datasets: [
  //     {
  //       data: Object.values(categorySales),
  //       backgroundColor: [
  //         "hsl(142, 76%, 36%)",
  //         "hsl(217, 91%, 60%)",
  //         "hsl(43, 96%, 56%)",
  //         "hsl(0, 84%, 60%)",
  //         "hsl(271, 91%, 65%)",
  //       ],
  //       borderColor: "white",
  //       borderWidth: 2,
  //     },
  //   ],
  // };

  const barChartData = {
    labels: Object.keys(categoryInventory),
    datasets: [
      {
        label: "Current Inventory",
        data: Object.values(categoryInventory),
        backgroundColor: "hsl(217, 91%, 60%)",
        borderColor: "hsl(217, 91%, 60%)",
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom" as const,
      },
    },
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" />
      </div>
    );
  }

  const filteredProducts =
    filter === "low_stock"
      ? lowStockProducts
      : filter === "top_selling"
      ? topSellingProducts
      : products;

  return (
    <div className="min-h-screen bg-gray-50 p-6 space-y-8">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-8">
            Dashboard Overview
          </h1>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Products
                </CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{products.length}</div>
                <p className="text-xs text-muted-foreground">
                  Across {Object.keys(categorySales).length} categories
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">
                  Low Stock Items
                </CardTitle>
                <AlertTriangle className="h-4 w-4 text-red-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {lowStockProducts.length}
                </div>
                <p className="text-xs text-muted-foreground">
                  Items with stock below 15
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Inventory
                </CardTitle>
                <Archive className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {products.reduce((sum, product) => sum + product.stock, 0)}
                </div>
                <p className="text-xs text-muted-foreground">Units in stock</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Sales
                </CardTitle>
                <TrendingUp className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{Orders?.length || 0}</div>
                <p className="text-xs text-muted-foreground">Units sold</p>
              </CardContent>
            </Card>
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Best Selling Product Card */}
            <Card className="h-full w-full">
              <CardHeader>
                <CardTitle>Best Selling Product</CardTitle>
              </CardHeader>
              <CardContent>
                {topSellingProducts.length > 0 ? (
                  <div className="w-full md:w-1/2 h-full flex flex-col md:flex-row items-center gap-4">
                    <img
                      src={
                        topSellingProducts[0].image_url || "/placeholder.svg"
                      }
                      alt={topSellingProducts[0].title}
                      className="w-full h-full object-cover rounded-lg shadow-md"
                    />
                    <div className=" w-full md:w-1/2 h-full flex flex-col gap-2">
                      <h3 className="text-lg font-semibold">
                        {topSellingProducts[0].title}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Sales:{" "}
                        <span className="font-medium">
                          {topSellingProducts[0].sales_count}
                        </span>
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Stock Left:{" "}
                        <span className="font-medium">
                          {topSellingProducts[0].stock}
                        </span>
                      </p>
                      <Link
                        href={`/admin/products/${topSellingProducts[0].id}`}
                      >
                        <Button className="mt-2">View Details</Button>
                      </Link>
                    </div>
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground">
                    No sales data available.
                  </p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Inventory by Category</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <Bar data={barChartData} options={chartOptions} />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Products Section */}
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">Products</h2>
              <div className="flex gap-4">
                <Select value={filter} onValueChange={setFilter}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filter products" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Products</SelectItem>
                    <SelectItem value="low_stock">Low Stock</SelectItem>
                    <SelectItem value="top_selling">Top Selling</SelectItem>
                  </SelectContent>
                </Select>
                <Link href="/admin/products/add">
                  <Button>Add Product</Button>
                </Link>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProducts.map((product) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card>
                    <div className="aspect-video relative overflow-hidden rounded-t-lg">
                      <img
                        src={product.image_url || "/placeholder.svg"}
                        alt={product.title}
                        className="object-cover w-full h-full"
                      />
                      {product.stock < 15 && (
                        <Badge
                          variant="destructive"
                          className="absolute top-2 right-2"
                        >
                          Low Stock
                        </Badge>
                      )}
                    </div>
                    <CardContent className="p-4">
                      <h3 className="font-semibold text-lg mb-2">
                        {product.title}
                      </h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        {product.description}
                      </p>
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="text-sm font-medium">
                            Stock: {product.stock}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Sales: {product.sales_count || 0}
                          </p>
                        </div>
                        <p className="text-lg font-bold">${product.price}</p>
                      </div>
                      <div className="mt-4 flex justify-end">
                        <Link href={`/admin/products/${product.id}`}>
                          <Button variant="outline">View Details</Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AdminPanel;
