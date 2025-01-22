"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);

const AdminPanel = () => {
  const supabase = createClientComponentClient();
  const [products, setProducts] = useState([]);
  const [categorySales, setCategorySales] = useState({});
  const [loading, setLoading] = useState(true);

  // Calculate Category Sales
  const calculateCategorySales = (
    products: { id: string; category: string; price: number; stock: number }[]
  ) => {
    const salesByCategory: Record<string, number> = {};

    products.forEach((product) => {
      const totalSales = product.price * product.stock;
      if (salesByCategory[product.category]) {
        salesByCategory[product.category] += totalSales;
      } else {
        salesByCategory[product.category] = totalSales;
      }
    });

    setCategorySales(salesByCategory);
  };

  useEffect(() => {
    const fetchProducts = async () => {
      const { data, error } = await supabase.from("products").select("*");
      if (error) {
        console.error("Error fetching products:", error.message);
      } else {
        setProducts(data || []);
        calculateCategorySales(data || []);
      }
      setLoading(false);
    };

    fetchProducts();
  }, [supabase]);

  // Handle Stock Change
  const handleStockChange = async (id: string, change: number) => {
    const product = products.find((prod) => prod.id === id);
    if (!product) return;

    const updatedStock = product.stock + change;
    if (updatedStock < 0) return; // Prevent negative stock

    const { error } = await supabase
      .from("products")
      .update({ stock: updatedStock })
      .eq("id", id);

    if (error) {
      console.error("Error updating stock:", error.message);
    } else {
      const updatedProducts = products.map((prod) =>
        prod.id === id ? { ...prod, stock: updatedStock } : prod
      );
      setProducts(updatedProducts);
      calculateCategorySales(updatedProducts); // Recalculate sales after stock change
    }
  };

  if (loading) {
    return <div className="text-center mt-10">Loading products...</div>;
  }

  // Pie Chart Data
  const pieChartData = {
    labels: Object.keys(categorySales),
    datasets: [
      {
        data: Object.values(categorySales),
        backgroundColor: ["#4CAF50", "#FF9800", "#2196F3", "#FF5722", "#9C27B0"],
        hoverBackgroundColor: ["#66BB6A", "#FFB74D", "#42A5F5", "#FF7043", "#AB47BC"],
      },
    ],
  };

  const pieChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h1 className="text-3xl font-bold text-center mb-8 text-blue-600">
        Admin Panel
      </h1>

      {/* Dashboard Overview and Pie Chart */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
        {/* Dashboard Overview */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Dashboard Overview</h2>
          <div className="grid grid-cols-1 gap-6">
            <div className="bg-white rounded-lg shadow-lg p-6 text-center">
              <h3 className="text-lg font-bold text-gray-700">Total Products</h3>
              <p className="text-2xl font-semibold text-blue-500 mt-2">
                {products.length}
              </p>
            </div>
            <div className="bg-white rounded-lg shadow-lg p-6 text-center">
              <h3 className="text-lg font-bold text-gray-700">Total Stock</h3>
              <p className="text-2xl font-semibold text-orange-500 mt-2">
                {products.reduce((sum, product) => sum + product.stock, 0)}
              </p>
            </div>
          </div>
        </div>

        {/* Pie Chart */}
        <div>
          <h2 className="text-xl text-center font-semibold mb-4">Sales by Category</h2>
          <div className="w-72 h-72 mx-auto">
            <Pie data={pieChartData} options={pieChartOptions} />
          </div>
        </div>
      </section>

      {/* Products Management */}
      <section>
        <h2 className="text-xl font-semibold mb-4">Manage Products</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product: any) => (
            <div
              key={product.id}
              className="bg-white rounded-lg shadow-lg overflow-hidden border border-gray-200 hover:shadow-xl transition-shadow duration-300"
            >
              <img
                src={product.image_url}
                alt={product.title}
                className="w-full h-48 object-cover"
              />
              <div className="p-4">
                <h3 className="text-lg font-semibold">{product.title}</h3>
                <p className="text-gray-500 text-sm mt-1">
                  {product.description}
                </p>
                <p className="text-blue-600 font-bold mt-2">${product.price}</p>
                <div className="flex justify-between items-center mt-4">
                  <span className="text-sm text-gray-500">
                    Stock: {product.stock}
                  </span>
                  {product.stock < 15 && (
                    <span className="text-sm text-red-500 font-semibold">
                      Low Stock
                    </span>
                  )}
                </div>
                <div className="flex gap-4 mt-4">
                  <button
                    onClick={() => handleStockChange(product.id, -1)}
                    className="bg-red-500 text-white py-1 px-3 rounded hover:bg-red-600 text-sm"
                  >
                    -
                  </button>
                  <button
                    onClick={() => handleStockChange(product.id, 1)}
                    className="bg-green-500 text-white py-1 px-3 rounded hover:bg-green-600 text-sm"
                  >
                    +
                  </button>
                </div>
                <div className="mt-4">
                  <Link
                    href={`/admin/products/${product.id}`}
                    className="bg-blue-500 text-white py-1 px-3 rounded hover:bg-blue-600 text-sm"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Add Product Button */}
      <div className="mt-10 text-center">
        <Link
          href="/admin/products/add"
          className="bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600 text-lg font-semibold"
        >
          Add New Product
        </Link>
      </div>
    </div>
  );
};

export default AdminPanel;
