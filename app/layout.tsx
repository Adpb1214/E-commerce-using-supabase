// app/layout.tsx
import "./globals.css";
import { Footer } from "./Layout/Footer/page";
import { Header } from "./Layout/Header/page";

export const metadata = {
  title: "E-Commerce",
  description: "A modern e-commerce application",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Header />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
