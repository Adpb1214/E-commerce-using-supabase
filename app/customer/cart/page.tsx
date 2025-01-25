"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

const CartPage = () => {
  const supabase = createClientComponentClient();
  const router = useRouter();
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [error, setError] = useState("");

  // Fetch cart items on page load
  useEffect(() => {
    const fetchCartItems = async () => {
      const { data: user } = await supabase.auth.getUser();

      if (!user) {
        setError("You must log in to access the cart.");
        return;
      }

      const { data, error } = await supabase
      .from("cart")
      .select("*, products(*)") // Fetch cart items with product details
      .eq("user_id", user?.user.id);

      if (error) {
        setError("Error fetching cart items.");
      } else {
        setCartItems(data || []);
      }
    };

    fetchCartItems();
  }, []);

  // Handle selecting individual items
  const handleSelectItem = (cartItemId: string) => {
    setSelectedItems((prev) =>
      prev.includes(cartItemId)
        ? prev.filter((id) => id !== cartItemId)
        : [...prev, cartItemId]
    );
  };

  // Handle placing an order
  const handleOrderNow = async () => {
    const { data: user } = await supabase.auth.getUser();

    if (!user) {
      setError("You must log in to place an order.");
      return;
    }

    // Determine items to order
    const itemsToOrder =
      selectedItems.length > 0
        ? cartItems.filter((item) => selectedItems.includes(item.id))
        : cartItems;

    if (itemsToOrder.length === 0) {
      setError("No items selected for order.");
      return;
    }

    // Calculate total amount
    const totalAmount = itemsToOrder.reduce(
      (sum, item) => sum + item.quantity * item.products.price,
      0
    );

    try {
      // Create an order
      const { data: order, error: orderError } = await supabase
        .from("orders")
        .insert({
          user_id: user?.user.id,
          total_price: totalAmount,
          order_status: "Pending",
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // Add items to the `order_items` table
      const orderItems = itemsToOrder.map((item) => ({
        order_id: order.id,
        product_id: item.product_id,
        quantity: item.quantity,
        price: item.products.price,
      }));

      const { error: itemsError } = await supabase
        .from("order_items")
        .insert(orderItems);

      if (itemsError) throw itemsError;

      // Remove ordered items from the cart
      const cartItemIds = itemsToOrder.map((item) => item.id);
      const { error: cartError } = await supabase
        .from("cart")
        .delete()
        .in("id", cartItemIds);

      if (cartError) throw cartError;

      // Redirect to the orders page
      router.push("/customer/orders");
    } catch (err: any) {
      setError(err.message || "An error occurred while placing the order.");
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Cart</h1>

      {error && <p className="text-red-500">{error}</p>}

      {cartItems.length === 0 ? (
        <p>Your cart is empty.</p>
      ) : (
        <div>
          <ul className="space-y-4">
            {cartItems.map((item) => (
              <li
                key={item.id}
                className="flex items-center justify-between p-4 border rounded"
              >
                <div>
                  <h2 className="text-lg font-bold">{item.products.name}</h2>
                  <p>Price: ${item.products.price}</p>
                  <p>Quantity: {item.quantity}</p>
                </div>
                <div>
                  <input
                    type="checkbox"
                    checked={selectedItems.includes(item.id)}
                    onChange={() => handleSelectItem(item.id)}
                    className="mr-2"
                  />
                  Select
                </div>
              </li>
            ))}
          </ul>

          <div className="mt-4">
            <button
              onClick={handleOrderNow}
              className="bg-blue-500 text-white px-4 py-2 rounded"
            >
              Order Now
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CartPage;
