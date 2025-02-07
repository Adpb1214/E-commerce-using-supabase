"use client";

import { usePathname } from "next/navigation";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";  // Import React Query
import "./globals.css";
import AdminHeader from "./Layout/Header/AdminHeader";
import CustomerHeader from "./Layout/Header/CustomerHeader";
import Footer from "./Layout/Footer/page";
import Header from "./Layout/Header/page";
import { ToastContainer } from 'react-toastify';
import "react-toastify/dist/ReactToastify.css";

// Initialize React Query Client
const queryClient = new QueryClient();

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  let HeaderComponent;

  if (pathname.startsWith("/admin")) {
    HeaderComponent = AdminHeader;
  } else if (pathname.startsWith("/customer")) {
    HeaderComponent = CustomerHeader;
  } else {
    HeaderComponent = Header;
  }

  return (
    <html lang="en">
      <body>
        
        <QueryClientProvider client={queryClient}>
          <HeaderComponent />
          <main>{children}</main>
          <Footer />
          <ToastContainer />
        </QueryClientProvider>
      </body>
    </html>
  );
}
