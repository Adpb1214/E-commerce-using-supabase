"use client";

import { useEffect, useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { ShoppingCart, Heart, Package, LogOut, User, MessageCircleQuestion } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { toast } from "react-toastify";

type Profile = { name: string; photo_url: string };
type Product = { title: string; description: string };
type OrderItem = { product_id: string; quantity: number; price: number; products: Product[] };
type Order = { id: string; total_price: number; created_at: string; order_status: string; order_items: OrderItem[] };
interface CartItem { id: string; product_id: string; quantity: number; products: { id: string; name: string; title: string; price: number; image_url: string }; }
interface WishlistItem { id: string; product_id: string; }

export default function CustomerHeader() {
  const supabase = createClientComponentClient();
  const [order, setOrder] = useState<Order[]>([]);
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [error, setError] = useState("");

  // Fetch Profile
  const fetchProfile = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data, error } = await supabase.from("profiles").select("name, photo_url").eq("id", user.id).single();
    if (error) console.error("Error fetching profile:", error);
    else setProfile(data);
  };

  // Fetch Data (Orders, Cart, Wishlist)
  const fetchData = async () => {
    const { data: user } = await supabase.auth.getUser();
    if (!user?.user) return;

    // Fetch Wishlist
    const { data: wishlistData, error: wishlistError } = await supabase.from("wishlist").select("*").eq("user_id", user.user.id);
    if (wishlistError) console.error("Wishlist Error:", wishlistError);
    else setWishlist(wishlistData || []);

    // Fetch Cart
    const { data: cartData, error: cartError } = await supabase.from("cart").select("*").eq("user_id", user.user.id);
    if (cartError) console.error("Cart Error:", cartError);
    else setCart(cartData || []);

    // Fetch Orders
    const { data: orderData, error: orderError } = await supabase
      .from("orders")
      .select(`
        id, total_price, created_at, order_status,
        order_items:order_items (
          product_id, quantity, price,
          products:products (title, description)
        )
      `)
      .eq("user_id", user.user.id);
    if (orderError) console.error("Orders Error:", orderError);
    else setOrder(orderData || []);
  };

  useEffect(() => {
    fetchProfile();
    fetchData(); // Initial fetch

    // Realtime Subscription
    const channel = supabase
      .channel("realtime-updates")
      .on("postgres_changes", { event: "*", schema: "public", table: "cart" }, fetchData)
      .on("postgres_changes", { event: "*", schema: "public", table: "wishlist" }, fetchData)
      .on("postgres_changes", { event: "*", schema: "public", table: "orders" }, fetchData)
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  // Handle Logout
  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/";
    toast.success("Logged Out Successfully!");
  };

  return (
    <header className="w-full border-b bg-blue-300 shadow-sm">
      <div className="container mx-auto flex items-center justify-between py-4 px-6">
        {/* Left - Navigation */}
        <Link href="/customer" className="text-xl font-semibold text-gray-900">ShopEase</Link>

        {/* Right - Logo & Profile */}
        <div className="flex items-center space-x-4">
          <nav className="flex items-center space-x-6">
            {/* Cart */}
            <Link href="/customer/cart" className="relative">
              <Button variant="ghost" className="relative">
                <ShoppingCart className="h-5 w-5 text-gray-900" />
                {cart.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-semibold rounded-full w-5 h-5 flex items-center justify-center shadow-md">
                    {cart.length}
                  </span>
                )}
              </Button>
            </Link>


          

            {/* Wishlist */}
            <Link href="/customer/wishlist" className="relative">
              <Button variant="ghost" className="relative">
                <Heart className="h-5 w-5 text-gray-900" />
                {wishlist.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-pink-500 text-white text-xs font-semibold rounded-full w-5 h-5 flex items-center justify-center shadow-md">
                    {wishlist.length}
                  </span>
                )}
              </Button>
            </Link>

            {/* Orders */}
            <Link href="/customer/orders" className="relative">
              <Button variant="ghost" className="relative">
                <Package className="h-5 w-5 text-gray-900" />
                {order.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-green-500 text-white text-xs font-semibold rounded-full w-5 h-5 flex items-center justify-center shadow-md">
                    {order.length}
                  </span>
                )}
              </Button>
            </Link>

            <Link href="/customer/faq" className="relative">
              <Button variant="ghost" className="relative">
                <MessageCircleQuestion className="h-5 w-5 text-gray-900" />
              
              </Button>
            </Link>

          </nav>

          {/* Profile Dropdown */}
          {profile && (
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-2 focus:outline-none">
                <Avatar className="h-10 w-10 border">
                  <AvatarImage src={profile.photo_url || "/default-avatar.png"} />
                  <AvatarFallback>{profile.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <span className="hidden md:inline text-gray-900 font-semibold">{profile.name}</span>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-white shadow-lg rounded-lg w-48 mt-2">
                <DropdownMenuItem className="hover:bg-gray-100 flex items-center gap-2 p-2 rounded-md">
                  <User className="w-4 h-4 text-gray-700" />
                  <Link href="/customer/profile" className="text-gray-700">Profile</Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleLogout} className="hover:bg-red-100 flex items-center gap-2 p-2 rounded-md cursor-pointer">
                  <LogOut className="w-4 h-4 text-red-600" />
                  <span className="text-red-600">Logout</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    </header>
  );
}
