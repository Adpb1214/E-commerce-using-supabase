"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Menu, LogOut, User } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type UserProfile = {
  name: string;
  photo_url: string;
};

export default function AdminHeader() {
  const supabase = createClientComponentClient();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("profiles")
      .select("name, photo_url")
      .eq("id", (await supabase.auth.getUser()).data.user?.id)
      .single();

    if (error) {
      console.error("Error fetching user:", error.message);
    } else {
      setUser(data);
    }
    setLoading(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/auth/login";
  };

  return (
    <header className="flex items-center justify-between p-4 bg-gray-900 text-white shadow-md">
      {/* Left: Logo & Navigation */}
      <div className="flex items-center gap-6">
        <Link href="/admin">
          <h1 className="text-xl font-bold tracking-wide">Admin Panel</h1>
        </Link>
        <nav className="hidden md:flex gap-4">
          <Link href="/admin/users" className="hover:text-gray-300">
            Users
          </Link>
          <Link href="/admin/orders" className="hover:text-gray-300">
            Orders
          </Link>
          <Link href="/admin/products" className="hover:text-gray-300">
            Products
          </Link>
        </nav>
      </div>

      {/* Right: User Profile */}
      <div className="flex items-center gap-4">
        {loading ? (
          <div className="animate-pulse bg-gray-700 h-10 w-10 rounded-full"></div>
        ) : user ? (
          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-2">
              <Avatar>
                <AvatarImage src={user.photo_url || "/default-avatar.png"} />
                <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <span className="hidden md:inline">{user.name}</span>
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
        ) : (
          <span className="text-sm text-gray-400">Not logged in</span>
        )}
      </div>

      {/* Mobile Menu Icon */}
      <button className="md:hidden p-2">
        <Menu className="h-6 w-6" />
      </button>
    </header>
  );
}
