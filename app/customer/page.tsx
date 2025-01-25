"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import Marquee from "react-fast-marquee"; // For top deals marquee animation

ChartJS.register(ArcElement, Tooltip, Legend);

const ClientDashboard = () => {
  const supabase = createClientComponentClient();
  const [products, setProducts] = useState([]);
  const [categorySales, setCategorySales] = useState({});
  const [loading, setLoading] = useState(true);

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

  if (loading) {
    return <div className="text-center mt-10">Loading products...</div>;
  }

  const pieChartData = {
    labels: Object.keys(categorySales),
    datasets: [
      {
        data: Object.values(categorySales),
        backgroundColor: [
          "#4CAF50",
          "#FF9800",
          "#2196F3",
          "#FF5722",
          "#9C27B0",
        ],
        hoverBackgroundColor: [
          "#66BB6A",
          "#FFB74D",
          "#42A5F5",
          "#FF7043",
          "#AB47BC",
        ],
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
        Client Dashboard
      </h1>

      {/* Top Selling Products */}
      <section className="mb-12">
        <h2 className="text-xl font-semibold mb-4">Top Selling Products</h2>
        <Marquee gradient={false} speed={50}>
          {products.slice(0, 10).map((product: any) => (
            <div
              key={product.id}
              className="w-48 mr-6 bg-white rounded-lg shadow-lg overflow-hidden"
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
                <div className="mt-4">
                  <Link
                    href={`/customer/${product.id}`}
                    className="bg-blue-500 text-white py-1 px-3 rounded hover:bg-blue-600 text-sm"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </Marquee>
      </section>

      {/* Shop by Categories */}
      <section className="mb-12">
        <h2 className="text-xl font-semibold mb-4">Shop by Categories</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {Object.keys(categorySales).map((category) => (
            <Link href={`/category/${category}`} key={category}>
              <div className="bg-white rounded-lg shadow-lg overflow-hidden border border-gray-200 hover:shadow-xl transition-shadow duration-300 cursor-pointer">
                <div className="p-6 text-center">
                  <h3 className="text-lg font-semibold text-gray-700">
                    {category}
                  </h3>
                  <p className="text-gray-500 mt-2">
                    {
                      products.filter(
                        (product) => product.category === category
                      ).length
                    }{" "}
                    Products
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Top Deals */}
      <section className="mb-12">
        <h2 className="text-xl font-semibold mb-4">Top Deals</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.slice(0, 15).map((product: any) => (
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
                <div className="mt-4">
                  <Link
                    href={`/customer/${product.id}`}
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
    </div>
  );
};

export default ClientDashboard;
