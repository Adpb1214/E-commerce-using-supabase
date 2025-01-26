"use client";

import Link from "next/link";

interface ProductCardProps {
  product: Product;
}

interface Product {
  id: number;
  title: string;
  price: number;
  stock: number;
  category: string;
  image_url: string | null;
}

export const ProductCard = ({ product }: ProductCardProps) => {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      <img
        src={product.image_url || "/placeholder.svg"}
        alt={product.title}
        className="w-full aspect-video object-cover"
      />
      <div className="p-4">
        <h3 className="font-medium mb-2">{product.title}</h3>
        <div className="flex items-center justify-between">
          <p className="text-primary font-bold">${product.price}</p>
          <span className="text-sm text-muted-foreground">
            {product.stock} in stock
          </span>
        </div>
        <Link
          href={`/customer/${product.id}`}
          className="text-primary hover:underline text-sm"
        >
          View Details →
        </Link>
      </div>
    </div>
  );
};
