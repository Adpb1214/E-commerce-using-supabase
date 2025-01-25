"use client";

import { useEffect, useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

type User = {
  id: string;
  name: string;
  role: string;
  phone_number?: string;
};

type WishlistItem = {
  id: string;
  products: {
    title: string;
    description: string;
    price: number;
  };
};

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

export default function AdminPortal() {
  const supabase = createClientComponentClient();
  const [users, setUsers] = useState<User[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchUsers();
    fetchOrders();
  }, []);

  const fetchUsers = async () => {
    const { data, error } = await supabase
      .from("profiles")
      .select("id, name, role, phone_number");

    if (error) {
      console.error("Error fetching users:", error.message);
      setError("Failed to fetch users.");
    } else {
      setUsers(data || []);
    }
  };

  const fetchOrders = async () => {
    const { data, error } = await supabase
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
            description
          )
        )
      `);

    if (error) {
      console.error("Error fetching orders:", error.message);
      setError("Failed to fetch orders.");
    } else {
      setOrders(data || []);
    }
  };

  const fetchUserWishlist = async (userId: string) => {
    const { data, error } = await supabase
      .from("wishlist")
      .select(`
        id,
        products:products (
          title,
          description,
          price
        )
      `)
      .eq("user_id", userId);

    if (error) {
      console.error("Error fetching wishlist for user:", error.message);
      setError("Failed to fetch wishlist.");
    } else {
      setWishlist(data || []);
    }
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
    return true;
  };

  const handleOrderStatusUpdate = async (orderId: string, status: string) => {
    const success = await updateOrderStatus(orderId, status);
    if (success) {
      alert("Order status updated successfully!");
      fetchOrders(); // Refresh orders
    } else {
      alert("Failed to update order status.");
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold">Admin Portal</h1>
      {error && <p className="text-red-500">{error}</p>}

      <div className="mt-4">
        <h2 className="text-xl font-bold">Users</h2>
        <ul>
          {users.map((user) => (
            user.role === "client" && (
              <li key={user.id} className="border p-2 rounded mb-2">
                <p>{user.name} ({user.phone_number || "No phone number"})</p>
                <button
                  onClick={() => {
                    setSelectedUser(user);
                    fetchUserWishlist(user.id);
                  }}
                  className="text-blue-500"
                >
                  View Wishlist
                </button>
              </li>
            )
          ))}
        </ul>
      </div>

      {selectedUser && (
        <div className="mt-4">
          <h2 className="text-xl font-bold">
            Wishlist of {selectedUser.name}
          </h2>
          <ul>
            {wishlist.map((item) => (
              <li key={item.id} className="border p-2 rounded mb-2">
                <p><strong>{item.products.title}</strong> - ₹{item.products.price}</p>
                <p>{item.products.description}</p>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-4">
        <h2 className="text-xl font-bold">Orders</h2>
        <ul>
          {orders.map((order) => (
            <li key={order.id} className="border p-2 rounded mb-2">
              <h3 className="font-bold">Order #{order.id}</h3>
              <p>Total Price: ₹{order.total_price}</p>
              <p>Ordered by: {order.user.name} ({order.user.phone_number})</p>
              <p>Status: {order.order_status}</p>
              <button
                onClick={() => handleOrderStatusUpdate(order.id, "Shipped")}
                className="text-green-500"
              >
                Mark as Shipped
              </button>
              <button
                onClick={() => handleOrderStatusUpdate(order.id, "Delivered")}
                className="text-blue-500 ml-2"
              >
                Mark as Delivered
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
