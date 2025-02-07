"use client";

import { useEffect, useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Info, ShoppingCart, Heart, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "react-toastify";

interface Product {
  id: string;
  name: string;
  title: string;
  description: string;
  price: number;
  original_price?: number;
  stock: number;
  image_url: string;
}

interface WishlistItem {
  id: string;
  product_id: string;
  products: Product;
}

export default function WishlistPage() {
  const supabase = createClientComponentClient();
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [addingToCart, setAddingToCart] = useState<string | null>(null);
  const [removing, setRemoving] = useState<string | null>(null); // State to track removing item

  useEffect(() => {
    fetchWishlistItems();
  }, []);

  const fetchWishlistItems = async () => {
    setLoading(true);
    const { data: user, error: userError } = await supabase.auth.getUser();

    if (userError || !user?.user) {
      setError("You must log in to view your wishlist.");
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("wishlist")
      .select("*, products(*)")
      .eq("user_id", user.user.id);

    if (error) {
      setError("Error fetching wishlist items.");
      console.error("Error fetching wishlist items:", error.message);
    } else {
      setWishlistItems(data || []);
    }
    setLoading(false);
  };

  const deleteWishlistItem = async (wishlistId: string) => {
    setRemoving(wishlistId);
    const { error } = await supabase.from("wishlist").delete().eq("id", wishlistId);

    if (error) {
      toast.error("Failed to remove item from wishlist.");
      console.error("Error deleting wishlist item:", error.message);
    } else {
      toast.success("Item removed from wishlist!");
      setWishlistItems((prev) => prev.filter((item) => item.id !== wishlistId)); // Update UI
    }
    setRemoving(null);
  };

  const addToCart = async (productId: string) => {
    setAddingToCart(productId);
    const { data: user, error: userError } = await supabase.auth.getUser();

    if (userError || !user?.user) {
      setError("You must log in to add items to your cart.");
      setAddingToCart(null);
      return;
    }

    const { data: existingCart, error: cartError } = await supabase
      .from("cart")
      .select("*")
      .eq("user_id", user.user.id)
      .eq("product_id", productId);

    if (cartError) {
      setError("Error checking cart.");
      console.error("Error checking cart:", cartError.message);
      setAddingToCart(null);
      return;
    }

    if (existingCart?.length > 0) {
      toast.success("This product is already in your cart.");
      setAddingToCart(null);
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
      toast.success("Product added to cart!");
    }
    setAddingToCart(null);
  };

  if (error) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="bg-destructive/10 text-destructive px-4 py-2 rounded-md">
          {error}
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-20 w-20 border-t-4 border-orange-500 border-solid">
          <Heart className="w-10 h-10 mx-auto mt-4 text-orange-500" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 h-[100vh]">
      <h1 className="text-2xl font-semibold mb-6">Wishlist</h1>

      {wishlistItems.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Your wishlist is empty.</p>
        </div>
      ) : (
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[400px]">PRODUCTS</TableHead>
                <TableHead>PRICE</TableHead>
                <TableHead>STOCK STATUS</TableHead>
                <TableHead>ACTIONS</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {wishlistItems.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 relative">
                        <img
                          src={item.products.image_url || "/placeholder.svg"}
                          alt={item.products.title || "Placeholder"}
                          className="rounded h-full w-full object-contain"
                        />
                      </div>
                      <div>
                        <h3 className="font-medium line-clamp-2">
                          {item.products.title}
                        </h3>
                        <p className="text-sm text-muted-foreground line-clamp-1">
                          {item.products.description}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="font-medium">
                        ${item.products.price.toFixed(2)}
                      </div>
                      {item.products.original_price && (
                        <div className="text-sm text-muted-foreground line-through">
                          ${item.products.original_price.toFixed(2)}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div
                        className={`text-sm font-medium ${
                          item.products.stock > 0
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        {item.products.stock > 0 ? "IN STOCK" : "OUT OF STOCK"}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button
                        onClick={() => addToCart(item.product_id)}
                        disabled={item.products.stock === 0 || addingToCart === item.product_id}
                        className="bg-orange-500 hover:bg-orange-600"
                      >
                        <ShoppingCart className="w-4 h-4 mr-2" />
                        Add to Cart
                      </Button>
                      <Button variant="ghost" size="icon" className="text-muted-foreground">
                        <Info className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-red-500 hover:bg-red-100"
                        onClick={() => deleteWishlistItem(item.id)}
                        disabled={removing === item.id}
                      >
                        {removing === item.id ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-red-500 border-solid"></div>
                        ) : (
                          <X className="w-5 h-5" />
                        )}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
