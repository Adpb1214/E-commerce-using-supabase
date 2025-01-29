import { Star } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import Link from "next/link"

export interface Product {
    id: number
    title: string
    price: number
    stock: number
    category: string
    image_url: string | null
    rating?: number
  }
  
  export type SortOption = "popular" | "price-asc" | "price-desc" | "rating"


interface ProductCardProps {
  product: Product
}

export function ProductCard({ product }: ProductCardProps) {
  const isHot = product.stock < 5
  const isBestDeal = product.rating && product.rating > 4.5

  return (
    <Card className="group overflow-hidden">
      <CardContent className="p-0">
        <div className="relative">
          <img
            src={product.image_url || "/placeholder.svg"}
            alt={product.title}
            className="w-full aspect-square object-cover group-hover:scale-105 transition-transform"
          />
          <div className="absolute top-2 right-2 flex gap-2">
            {isHot && <Badge variant="destructive">HOT</Badge>}
            {isBestDeal && <Badge variant="secondary">BEST DEAL</Badge>}
          </div>
        </div>
        <div className="p-4">
          <div className="flex items-center mb-2">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`w-4 h-4 ${
                  i < (product.rating || 0) ? "fill-primary text-primary" : "fill-muted text-muted-foreground"
                }`}
              />
            ))}
          </div>
          <h3 className="font-medium text-sm line-clamp-2 mb-2">{product.title}</h3>
          <p className="text-primary font-bold">${product.price}</p>
          <button><a href={`/customer/products/${product.id}`}>See Detail</a></button>
        </div>
      </CardContent>
    </Card>
  )
}

