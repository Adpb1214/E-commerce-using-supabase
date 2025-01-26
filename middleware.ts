import { NextRequest, NextResponse } from "next/server";
import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs";

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();

  // Initialize Supabase client
  const supabase = createMiddlewareClient({ req, res });

  // Get the user's session
  const {
    data: { session },
  } = await supabase.auth.getSession();

  // Redirect to login if session is not found
  if (!session) {
    console.log("No session found, redirecting to login.");
    return NextResponse.redirect(new URL("/auth/login", req.url));
  }

  // Fetch the user's role from the profiles table
  const { data: profile, error } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", session.user.id)
    .single();

  if (error || !profile) {
    console.error("Error fetching user profile or role:", error);
    return NextResponse.redirect(new URL("/auth/login", req.url));
  }

  const userRole = profile.role; // 'admin' or 'client'
  const pathname = req.nextUrl.pathname;

  // Role-based access control
  if (pathname.startsWith("/admin") && userRole !== "admin") {
    console.warn("Unauthorized access to /admin by non-admin user.");
    return NextResponse.redirect(new URL("/auth/login", req.url));
  }

  if (pathname.startsWith("/customer") && userRole !== "client") {
    console.warn("Unauthorized access to /customer by non-client user.");
    return NextResponse.redirect(new URL("/auth/login", req.url));
  }

  return res; // Allow access if all checks pass
}

export const config = {
  matcher: ["/admin/:path*", "/customer/:path*"], // Match /admin and /customer routes
};
