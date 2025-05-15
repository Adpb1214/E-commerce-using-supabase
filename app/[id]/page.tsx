"use client"

import * as React from "react"

import { useParams, useRouter} from "next/navigation"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Star, Share2 } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"

import { Label } from "@/components/ui/label"
import { toast } from "react-toastify"

type UserProfile = {
  id: string
  name: string
  phone_number: string
  photo_url: string
  zip_code: string
  address: string
  city: string
  state: string
  created_at: string
}
type reviews={
  id:string;
  rating:number;
  review:string;
  user_id:string;
  product_id:string;
  profiles:UserProfile;
  name:string
}
type Product = {
  id: string
  title: string
  description: string
  price: number
  stock: number
  category: string
  image_url: string
  sales_count: number
}


export default function ProductDetail() {
  const supabase = createClientComponentClient()
 
  const { id } = useParams()

  const [product, setProduct] = React.useState<Product>()
  const [reviews, setReviews] = React.useState<reviews[]>([])
  const [newReview, setNewReview] = React.useState({ rating: 0, review: "" })
  const [error, setError] = React.useState<string | null>(null)
  const router=useRouter()
const handleClick=()=>{
    router.push("/auth/login")
    toast.success("Please login first")
}
  const averageRating = React.useMemo(() => {
    if (!reviews.length) return 0
    return reviews.reduce((acc, rev) => acc + rev.rating, 0) / reviews.length
  }, [reviews])

  React.useEffect(() => {
    fetchProduct()
    fetchReviews()
  }, [])

  const fetchProduct = async () => {
    const { data, error } = await supabase.from("products").select("*").eq("id", id).single()

    if (error || !data) {
      setError("Product not found.")
      console.error("Error fetching product:", error?.message)
    } else {
      setProduct(data)
    }
  }

  const fetchReviews = async () => {
    const { data, error } = await supabase.from("reviews").select("*, profiles(name)").eq("product_id", id)

    if (error) {
      setError("Error fetching reviews.")
      console.error("Error fetching reviews:", error.message)
    } else {
      setReviews(data || [])
    }
  }





  if (!product) {
    return <div className="container mx-auto px-4 py-6">Loading...</div>
  }

  return (
    <div className="container mx-auto px-4 py-6">
      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Product Image */}
        <div className="space-y-4">
          <div className="relative aspect-square overflow-hidden rounded-lg border bg-white">
            <img
              src={product.image_url || "/placeholder.svg"}
              alt={product.title}
              // fill
              className="object-contain h-full w-full"
              // priority
            />
          </div>
        </div>

        {/* Product Info */}
        <div className="space-y-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={cn(
                      "h-4 w-4",
                      i < averageRating ? "fill-primary text-primary" : "fill-muted text-muted-foreground",
                    )}
                  />
                ))}
              </div>
              <span className="text-sm text-muted-foreground">
                {averageRating.toFixed(1)} Star Rating ({reviews.length} Reviews)
              </span>
            </div>
            <h1 className="text-2xl font-bold">{product?.title}</h1>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
             
              <span>Category: {product.category}</span>
            </div>
            <div className="text-sm text-green-600">Availability: {product?.stock ? "In Stock" : "Out of Stock"}</div>
          </div>

          <div className="flex items-baseline gap-4">
            <span className="text-3xl font-bold">${product.price}</span>
           
          </div>

         

          <div className="flex flex-col sm:flex-row gap-4">
            <Button className="flex-1" size="lg" onClick={handleClick}>
              ADD TO WISHLIST
            </Button>
            <Button onClick={handleClick} variant="outline" className="flex-1" size="lg">
              Add to Cart
            </Button>
            <Button variant="outline" size="icon" className="shrink-0">
              <Share2 className="h-4 w-4" />
            </Button>
          </div>

          <Card className="p-4">
            <p className="text-sm font-medium">100% Guarantee Safe Checkout</p>
            <div className="mt-2 flex gap-2">
              {["visa", "mastercard", "amex", "discover"].map((card) => (
                <div key={card} className="h-8 w-12 rounded bg-muted" />
              ))}
            </div>
          </Card>
        </div>
      </div>

      {/* Reviews Section */}
      <div className="mt-12">
        <h2 className="text-2xl font-bold mb-6">Customer Reviews</h2>
        <div className="grid gap-6 md:grid-cols-2">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Write a Review</h3>
            <div className="space-y-4">
              <div>
                <Label>Rating</Label>
                <div className="flex gap-2 mt-2">
                  {[1, 2, 3, 4, 5].map((rating) => (
                    <button key={rating} onClick={() => setNewReview((prev) => ({ ...prev, rating }))} className="p-1">
                      <Star
                        className={cn(
                          "h-6 w-6",
                          rating <= newReview.rating ? "fill-primary text-primary" : "fill-muted text-muted-foreground",
                        )}
                      />
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <Label>Review</Label>
                <Textarea
                  placeholder="Write your review..."
                  value={newReview.review}
                  onChange={(e) => setNewReview((prev) => ({ ...prev, review: e.target.value }))}
                  className="mt-1"
                />
              </div>
              <Button onClick={handleClick}>Submit Review</Button>
            </div>
          </Card>

          <div className="space-y-4">
            {reviews.map((review) => (
              <Card key={review.id} className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={cn(
                          "h-4 w-4",
                          i < review.rating ? "fill-primary text-primary" : "fill-muted text-muted-foreground",
                        )}
                      />
                    ))}
                  </div>
                  <span className="text-sm font-medium">{review.profiles?.name}</span>
                </div>
                <p className="text-sm text-muted-foreground">{review.review}</p>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

