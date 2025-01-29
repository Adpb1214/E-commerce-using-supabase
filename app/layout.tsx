"use client";

// app/layout.tsx
import { usePathname } from "next/navigation";
import "./globals.css";
import { Footer } from "./Layout/Footer/page";
import AdminHeader from "./Layout/Header/AdminHeader";
import { Header } from "./Layout/Header/page";
import CustomerHeader from "./Layout/Header/CustomerHeader";
import { ToastContainer } from 'react-toastify';
import "react-toastify/dist/ReactToastify.css";
// export const metadata = {
//   title: "E-Commerce",
//   description: "A modern e-commerce application",
// };

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
  }
  // } else if (pathname.startsWith("/auth")) {
  //   HeaderComponent = AuthHeader;
  // }
  else {
    HeaderComponent = Header;
  }

  return (
    <html lang="en">
      <body>
        <HeaderComponent />
        <main>{children}</main>
        <Footer />
        <ToastContainer />
      </body>
    </html>
  );
}
