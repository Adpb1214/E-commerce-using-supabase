"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Package, Truck, Headphones, Clock, Store } from "lucide-react";
import { TrendingProductsBanner } from "@/components/TrendingBanner";
import { CategoryProducts } from "./components/CategoryProducts";
import { CategorySection } from "./components/CategorySection";
// import { CategorySection } from "./customer/components/CategorySection";
// import { CategoryProducts } from "./customer/components/CategoryProducts";
// import { CategorySection } from "./components/CategorySection";
// import { CategoryProducts } from "./components/CategoryProducts";

interface Product {
  id: number;
  title: string;
  price: number;
  stock: number;
  category: string;
  description:string;
  image_url: string | null;
}

const ClientDashboard = () => {
  const supabase = createClientComponentClient();
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // const [categorySales, setCategorySales] = useState<Record<string, number>>(
  //   {}
  // );
  const [loading, setLoading] = useState(true);
  const [featuredProduct, setFeaturedProduct] = useState<Product | null>(null);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);

  const calculateCategorySales = (products: Product[]) => {
    const salesByCategory: Record<string, number> = {};
    products.forEach((product) => {
      const totalSales = product.price * product.stock;
      if (salesByCategory[product.category]) {
        salesByCategory[product.category] += totalSales;
      } else {
        salesByCategory[product.category] = totalSales;
      }
    });
    // setCategorySales(salesByCategory);
  };

  const handleCategoryClick = (category: string) => {
    setSelectedCategory(category);
  };

  useEffect(() => {
    const fetchProducts = async () => {
      const { data, error } = await supabase.from("products").select("*");
      if (error) {
        console.error("Error fetching products:", error.message);
      } else {
        setProducts(data || []);
        calculateCategorySales(data || []);
        if (data && data.length > 0) {
          setFeaturedProduct(data[0]);
        }
      }
      setLoading(false);
    };

    fetchProducts();
  }, [supabase]);

  useEffect(() => {
    const targetTime = new Date().getTime() + 6 * 60 * 60 * 1000; // 6 hours from now
    const interval = setInterval(() => {
      const currentTime = new Date().getTime();
      const difference = targetTime - currentTime;

      if (difference <= 0) {
        clearInterval(interval);
        setTimeLeft(0);
      } else {
        setTimeLeft(difference);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const formatTime = (milliseconds: number | null): string => {
    if (!milliseconds || milliseconds <= 0) return "00:00:00";
    const hours = Math.floor(milliseconds / (1000 * 60 * 60));
    const minutes = Math.floor((milliseconds % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((milliseconds % (1000 * 60)) / 1000);
    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(
      2,
      "0"
    )}:${String(seconds).padStart(2, "0")}`;
  };

  if (loading) {
    return   <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-20 w-20 border-t-4 border-yellow-500 border-solid">
      <Store className="w-10 h-10 mx-auto mt-4 text-yellow-500" />
    </div>
  </div>;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}

      <div className="container mx-auto px-4 py-2">
        <TrendingProductsBanner
          title="Trending Products"
          description="Discover our hottest items and latest arrivals. Don't miss out on these must-have products!"
          imageUrl=""
          linkUrl="/customer/products"
        />
      </div>

      <section className="grid md:grid-cols-2 gap-4 p-4 md:p-6">
        {featuredProduct && (
          <div className="bg-white rounded-lg shadow-md p-6 relative overflow-hidden">
            <div className="absolute top-2 right-2 bg-blue-500 text-white px-2 py-1 rounded-full text-sm">
              ${featuredProduct.price}
            </div>
            <h2 className="text-xl font-semibold mb-2">
              {featuredProduct.title}
            </h2>
            <p className="text-muted-foreground mb-4">Limited time offer</p>
            <img
              src={featuredProduct.image_url || "/placeholder.svg"}
              alt={featuredProduct.title}
              className="w-full h-48 object-contain mb-4"
            />
            <Link
              href={`/customer/${featuredProduct.id}`}
              className="inline-block bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90"
            >
              Shop Now
            </Link>
          </div>
        )}
        <div className="grid gap-4">
          {products.slice(1, 3).map((product) => (
            <div
              key={product.id}
              className="bg-white rounded-lg shadow-md p-4 flex items-center gap-4"
            >
              <img
                src={product.image_url || "/placeholder.svg"}
                alt={product.title}
                className="w-24 h-24 object-contain"
              />
              <div>
                <h3 className="font-medium">{product.title}</h3>
                <p className="text-blue-500 font-bold">${product.price}</p>
                <Link
                  href={`/customer/${product.id}`}
                  className="text-sm text-primary hover:underline"
                >
                  View Details →
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Best Deals Section */}
      <section className="p-4 md:p-6">
  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-stretch">
    
    {/* 🛒 Left Side - Best Deals Section */}
    <div className="md:col-span-2 flex flex-col">
      <div className="flex flex-col md:flex-row items-center gap-4 mb-6">
        <h2 className="text-2xl font-semibold">Best Deals</h2>
        <div className="text-lg md:text-xl flex items-center gap-2">
          <span className="text-red-600 font-semibold">Offer Ends In:</span>
          <span className="text-black font-bold">{formatTime(timeLeft)}</span>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 flex-grow">
        {products.slice(0, 10).map((product) => (
          <Link href={`/customer/${product.id}`} key={product.id} className="group">
            <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow h-full">
              <div className="relative">
                <img
                  src={product.image_url || "/placeholder.svg"}
                  alt={product.title}
                  className="w-full aspect-square object-cover group-hover:scale-105 transition-transform"
                />
                {product.stock < 5 && (
                  <span className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                    Low Stock
                  </span>
                )}
              </div>
              <div className="p-4">
                <h3 className="font-medium text-sm truncate">
                  {product.title}
                </h3>
                <p className="text-primary font-bold mt-1">
                  ${product.price}
                </p>
                <p className="text-primary font-bold mt-1">
                  {product?.description}
                </p>
                <p className="text-primary font-bold mt-1">
                 Category: {product?.category}
                </p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>

    {/* 📢 Right Side - Two Vertical Banners */}
    <div className="flex flex-col gap-4 md:col-span-1 h-full">
      <div className="flex flex-col flex-grow gap-4">
        {/* Taller Banner */}
        <div className="flex-grow bg-red-500 rounded-lg overflow-hidden shadow-lg">
          <img
            src="https://tse1.mm.bing.net/th?id=OIP.2jsoNxznU19mvXJwaMjjegHaJn&pid=Api&P=0&h=180" // Replace with actual banner image
            alt="Big Sale"
            className="w-full h-full object-cover"
          />
        </div>
        {/* Shorter Banner */}
        <div className="h-1/2 bg-blue-500 rounded-lg overflow-hidden shadow-lg">
          <img
            src="https://thumbs.dreamstime.com/b/vector-laptop-mockup-top-view-vertical-banner-template-social-media-illustration-246242808.jpg" // Replace with actual banner image
            alt="Limited Offer"
            className="w-full h-full object-cover"
          />
        </div>
      </div>
    </div>

  </div>
</section>



      {/* Featured Products */}
      <section className="p-4 md:p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-stretch">
          {/* 📢 Banner Section */}
          <div className="bg-primary text-white flex items-center justify-center p-6 rounded-lg shadow-lg md:col-span-1">
            <img
              src="https://thumbs.dreamstime.com/z/sale-concept-vertical-banner-design-discount-up-to-off-poster-clearance-offer-retail-leaflet-advertising-promotion-layout-198860369.jpg" // Replace with your offer image
              alt="Special Offer"
              className="w-full h-full object-cover rounded-lg"
            />
          </div>

          {/* 🛒 Featured Products Section */}
          <div className="md:col-span-2">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold">Featured Products</h2>
              <Link
                href="/customer/products"
                className="text-primary hover:underline"
              >
                View All →
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {products.slice(0, 4).map((product) => (
                <Link
                  href={`/customer/${product.id}`}
                  key={product.id}
                  className="group"
                >
                  <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow h-full">
                    <img
                      src={product.image_url || "/placeholder.svg"}
                      alt={product.title}
                      className="w-full aspect-video object-cover group-hover:scale-105 transition-transform"
                    />
                    <div className="p-4">
                      <h3 className="font-medium mb-2">{product.title}</h3>
                      <div className="flex items-center justify-between">
                        <p className="text-primary font-bold">
                          ${product.price}
                        </p>
                        <span className="text-sm text-muted-foreground">
                          {product.stock} in stock
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* categories  */}

      <section className="p-4 md:p-6 bg-muted/50">
        {" "}
        <h2 className="text-2xl font-semibold mb-6">Shop by Category</h2>{" "}
        <CategorySection
          products={products}
          onCategoryClick={handleCategoryClick}
        />
        {/* Category Products */}
        {selectedCategory && (
          <CategoryProducts
            products={products}
            selectedCategory={selectedCategory}
          />
        )}
      </section>

      {/* Service Features */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 md:p-6 bg-muted/50">
        <div className="flex items-center gap-2 p-4">
          <Truck className="w-6 h-6 text-primary" />
          <div>
            <h3 className="font-medium">Fast Delivery</h3>
            <p className="text-sm text-muted-foreground">
              Free shipping over $100
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 p-4">
          <Package className="w-6 h-6 text-primary" />
          <div>
            <h3 className="font-medium">Secure Packaging</h3>
            <p className="text-sm text-muted-foreground">
              Safe & sound delivery
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 p-4">
          <Headphones className="w-6 h-6 text-primary" />
          <div>
            <h3 className="font-medium">24/7 Support</h3>
            <p className="text-sm text-muted-foreground">
              Dedicated assistance
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 p-4">
          <Clock className="w-6 h-6 text-primary" />
          <div>
            <h3 className="font-medium">Money Back</h3>
            <p className="text-sm text-muted-foreground">30 day guarantee</p>
          </div>
        </div>
      </section>

      {/* Help Section */}
      <section className="text-center py-10 bg-muted/50">
        <h2 className="text-2xl font-semibold mb-4">Need Help?</h2>
        <p className="text-muted-foreground mb-6">
          Our support team is here to assist you
        </p>
        <Link
          href="/customer/faq"
          className="inline-block bg-primary text-primary-foreground px-6 py-3 rounded-md hover:bg-primary/90"
        >
          Contact Support
        </Link>
      </section>
    </div>
  );
};

export default ClientDashboard;
