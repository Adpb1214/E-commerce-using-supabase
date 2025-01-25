"use client";

import { useEffect, useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

type Product = {
  title: string;
  description: string;
};

type OrderItem = {
  product_id: string;
  quantity: number;
  price: number;
  products: Product;
};

type Order = {
  id: string;
  total_price: number;
  created_at: string;
  order_status: string; // Add status field
  order_items: OrderItem[];
};

export default function OrdersPage() {
  const supabase = createClientComponentClient();
  const [orders, setOrders] = useState<Order[]>([]);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    const { data: user, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      console.error("User not authenticated:", userError);
      setError("You must log in to view your orders.");
      return;
    }

    const { data, error } = await supabase
      .from("orders")
      .select(`
        id,
        total_price,
        created_at,
        order_status,
        order_items:order_items (
          product_id,
          quantity,
          price,
          products:products (
            title,
            description
          )
        )
      `)
      .eq("user_id", user.user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching orders:", error.message, error.details);
      setError("Failed to fetch orders. Please try again.");
    } else {
      setOrders(data || []);
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold">Your Orders</h1>
      {error && <p className="text-red-500">{error}</p>}
      {orders.length === 0 && !error && (
        <p className="text-gray-500">You have no orders yet.</p>
      )}
      <ul className="mt-4">
        {orders.map((order) => (
          <li key={order.id} className="border p-4 rounded mb-4">
            <h2 className="text-lg font-bold">Order #{order.id}</h2>
            <p>Status: {order.order_status}</p>
            <p>Total Price: ₹{order.total_price}</p>
            <p>Ordered on: {new Date(order.created_at).toLocaleString()}</p>
            <ul className="mt-2">
              {order.order_items.map((item) => (
                <li key={item.product_id} className="mb-2">
                  <p>
                    <strong>{item.products.title}</strong> - {item.quantity} × ₹
                    {item.price}
                  </p>
                  <p className="text-gray-600">{item.products.description}</p>
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ul>
    </div>
  );
}
