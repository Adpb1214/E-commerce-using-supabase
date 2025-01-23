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

  // If the user is not logged in, redirect to the login page
  if (!session) {
    return NextResponse.redirect(new URL("/auth/login", req.url));
  }

  // Fetch the user's role from the profiles table
  const { data: profile, error } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", session.user.id)
    .single();

  if (error || !profile) {
    return NextResponse.redirect(new URL("/auth/login", req.url));
  }

  const userRole = profile.role;
  const pathname = req.nextUrl.pathname;

  // Role-based route access
  if (pathname.startsWith("/admin") && userRole !== "admin") {
    return NextResponse.redirect(new URL("/customer", req.url)); // Redirect clients trying to access admin routes
  }

  if (pathname.startsWith("/customer") && userRole !== "client") {
    return NextResponse.redirect(new URL("/admin", req.url)); // Redirect admins trying to access client routes
  }

  return res; // Allow access if the user has the appropriate role
}

export const config = {
  matcher: ["/admin/:path*", "/customer/:path*"], // Match all /admin and /customer routes
};
