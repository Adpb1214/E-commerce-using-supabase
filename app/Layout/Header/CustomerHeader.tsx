"use client";

import { useEffect, useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { ShoppingCart, Heart, Package, LogOut, User } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@radix-ui/react-dropdown-menu";

type Profile = {
  name: string;
  photo_url: string;
};

export default function CustomerHeader() {
  const supabase = createClientComponentClient();
  const [profile, setProfile] = useState<Profile | null>(null);
  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/auth/login";
  };
  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    const { data, error } = await supabase
      .from("profiles")
      .select("name, photo_url")
      .eq("id", user.id)
      .single();

    if (error) console.error("Error fetching profile:", error);
    else setProfile(data);
  };

  return (
    <header className="w-full border-b bg-blue-300 shadow-sm">
      <div className="container mx-auto flex items-center justify-between py-4 px-6">
        {/* Left - Navigation */}
        <Link href="/" className="text-xl font-semibold text-gray-900">
            ShopEase
          </Link>

        {/* Right - Logo & Profile */}
        <div className="flex items-center space-x-4">

        <nav className="flex items-center space-x-6">
          <Link href="/customer/cart">
            <Button variant="ghost">
              <ShoppingCart className="h-5 w-5 text-gray-900" />
            </Button>
          </Link>
          <Link href="/customer/wishlist">
            <Button variant="ghost">
              <Heart className="h-5 w-5 text-gray-900" />
            </Button>
          </Link>
          <Link href="/customer/orders">
            <Button variant="ghost">
              <Package className="h-5 w-5 text-gray-900" />
            </Button>
          </Link>
        </nav>

         
          {profile && (
              <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-2">
                <Avatar>
                  <AvatarImage src={profile.photo_url || "/default-avatar.png"} />
                  <AvatarFallback>{profile.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <span className="hidden md:inline">{profile.name}</span>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-gray-800 text-white">
                <DropdownMenuItem className="hover:bg-gray-700 flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={handleLogout}
                  className="hover:bg-red-600 flex items-center gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    </header>
  );
}
