"use client";

import { useEffect, useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

const Wishlist = () => {
  const supabase = createClientComponentClient();
  const [wishlistItems, setWishlistItems] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchWishlistItems();
  }, []);

  const fetchWishlistItems = async () => {
    const { data: user, error: userError } = await supabase.auth.getUser();

    if (userError || !user?.user) {
      setError("You must log in to view your wishlist.");
      return;
    }

    const { data, error } = await supabase
      .from("wishlist")
      .select("*, products(*)") // Fetch wishlist items with product details
      .eq("user_id", user.user.id);

    if (error) {
      setError("Error fetching wishlist items.");
      console.error("Error fetching wishlist items:", error.message);
    } else {
      setWishlistItems(data || []);
    }
  };

  const addToCart = async (productId: string) => {
    const { data: user, error: userError } = await supabase.auth.getUser();

    if (userError || !user?.user) {
      setError("You must log in to add items to your cart.");
      return;
    }

    // Add product to cart
    const { data: existingCart, error: cartError } = await supabase
      .from("cart")
      .select("*")
      .eq("user_id", user.user.id)
      .eq("product_id", productId);

    if (cartError) {
      setError("Error checking cart.");
      console.error("Error checking cart:", cartError.message);
      return;
    }

    if (existingCart?.length > 0) {
      alert("This product is already in your cart.");
      return;
    }

    const { error } = await supabase.from("cart").insert({
      user_id: user.user.id,
      product_id: productId,
      quantity: 1,
    });

    if (error) {
      setError("Error adding product to cart.");
      console.error("Error adding product to cart:", error.message);
    } else {
      alert("Product added to cart!");
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Wishlist</h1>
      {error && <p className="text-red-500">{error}</p>}
      {wishlistItems.length === 0 && !error && <p>Your wishlist is empty.</p>}
      <div className="grid gap-4">
        {wishlistItems.map((item) => (
          <div
            key={item.id}
            className="border p-4 rounded shadow-md flex justify-between items-center"
          >
            <div>
              <h2 className="font-bold text-lg">{item.products.name}</h2>
              <p>{item.products.description}</p>
              <p>Price: ${item.products.price}</p>
            </div>
            <button
              onClick={() => addToCart(item.product_id)}
              className="bg-blue-500 text-white px-4 py-2 rounded"
            >
              Add to Cart
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Wishlist;
