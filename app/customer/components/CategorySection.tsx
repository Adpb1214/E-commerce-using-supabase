"use client";

import Link from "next/link";

interface CategorySectionProps {
  products: Product[];
  onCategoryClick: (category: string) => void;
}

interface Product {
  id: number;
  category: string;
}

export const CategorySection = ({
  products,
  onCategoryClick,
}: CategorySectionProps) => {
  const uniqueCategories = Array.from(
    new Set(products.map((product) => product.category))
  );

  return (
    <section className="p-4 md:p-6 bg-muted/50">
      <h2 className="text-2xl font-semibold mb-6">Shop by Category</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {uniqueCategories.map((category) => (
          <button
            key={category}
            onClick={() => onCategoryClick(category)}
            className="group"
          >
            <div className="bg-white rounded-lg shadow-md p-6 text-center hover:shadow-lg transition-shadow">
              <h3 className="font-medium mb-2">{category}</h3>
              <p className="text-sm text-muted-foreground">
                {products.filter((p) => p.category === category).length} Products
              </p>
            </div>
          </button>
        ))}
      </div>
    </section>
  );
};
