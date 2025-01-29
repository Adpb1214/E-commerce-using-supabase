"use client";

import { ProductCard } from "./ProductCard";

// import { ProductCard } from "@/components/ProductCard";

interface CategoryProductsProps {
  products: Product[];
  selectedCategory: string;
}

interface Product {
  id: number;
  title: string;
  price: number;
  stock: number;
  category: string;
  image_url: string | null;
}

export const CategoryProducts = ({
  products,
  selectedCategory,
}: CategoryProductsProps) => {
  const filteredProducts = products.filter(
    (product) => product.category === selectedCategory
  );

  return (
    <section className="p-4 md:p-6">
      <h2 className="text-2xl font-semibold mb-6">
        Products in &quot;{selectedCategory}&quot; Category
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {filteredProducts.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
};
