"use client";

import { useEffect, useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Info, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";


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
      .select("*, products(*)")
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

  if (error) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="bg-destructive/10 text-destructive px-4 py-2 rounded-md">
          {error}
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
                          src={
                            item.products.image_url
                              ? item.products.image_url
                              : "/placeholder.svg"
                          }
                          alt={item.products.title || "Placeholder"}
                          // fill
                          className="rounded h-full w-full object-contain "
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
                      {item.products.stock > 0 && item.products.stock < 10 && (
                        <div className="text-xs text-orange-600 font-medium">
                          Hurry up! Only {item.products.stock} left to grab
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button
                        onClick={() => addToCart(item.product_id)}
                        disabled={item.products.stock === 0}
                        className="bg-orange-500 hover:bg-orange-600"
                      >
                        <ShoppingCart className="w-4 h-4 mr-2" />
                        Add to Cart
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-muted-foreground"
                      >
                        <Info className="w-4 h-4" />
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
