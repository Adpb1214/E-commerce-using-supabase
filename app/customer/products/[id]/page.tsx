"use client"

import * as React from "react"

import { useParams, useRouter } from "next/navigation"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Star, Share2 } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"

export default function ProductDetail() {
  const supabase = createClientComponentClient()
  const router = useRouter()
  const { id } = useParams()

  const [product, setProduct] = React.useState<any>(null)
  const [reviews, setReviews] = React.useState<any[]>([])
  const [newReview, setNewReview] = React.useState({ rating: 0, review: "" })
  const [error, setError] = React.useState<string | null>(null)

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

  const submitReview = async () => {
    if (!newReview.rating || !newReview.review.trim()) {
      setError("Please provide both rating and review text")
      return
    }

    const { data: user } = await supabase.auth.getUser()

    if (!user?.user) {
      setError("You must be logged in to submit a review")
      return
    }

    // Check if user has already reviewed
    const existingReview = reviews.find((r) => r.user_id === user.user.id)

    if (existingReview) {
      // Update existing review
      const { error } = await supabase
        .from("reviews")
        .update({
          rating: newReview.rating,
          review: newReview.review,
        })
        .eq("id", existingReview.id)

      if (error) {
        setError("Error updating review")
        return
      }
    } else {
      // Create new review
      const { error } = await supabase.from("reviews").insert({
        user_id: user.user.id,
        product_id: id,
        rating: newReview.rating,
        review: newReview.review,
      })

      if (error) {
        setError("Error submitting review")
        return
      }
    }

    // Refresh reviews
    fetchReviews()
    setNewReview({ rating: 0, review: "" })
  }

  const addToWishlist = async () => {
    const { data: user } = await supabase.auth.getUser()

    if (!user?.user) {
      setError("You must be logged in to add items to your wishlist")
      return
    }

    const { error } = await supabase.from("wishlist").insert({
      user_id: user.user.id,
      product_id: id,
    })

    if (error) {
      if (error.code === "23505") {
        // Unique constraint error
        setError("This item is already in your wishlist")
      } else {
        setError("Error adding to wishlist")
      }
    } else {
      alert("Added to wishlist!")
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
              alt={product.name}
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
            <h1 className="text-2xl font-bold">{product.name}</h1>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span>SKU: {product.sku}</span>
              <span>Brand: {product.brand}</span>
              <span>Category: {product.category}</span>
            </div>
            <div className="text-sm text-green-600">Availability: {product?.stock ? "In Stock" : "Out of Stock"}</div>
          </div>

          <div className="flex items-baseline gap-4">
            <span className="text-3xl font-bold">${product.price}</span>
            {product.original_price && (
              <>
                <span className="text-lg text-muted-foreground line-through">${product.original_price}</span>
                <span className="rounded-md bg-yellow-100 px-2 py-1 text-sm font-medium text-yellow-800">
                  {Math.round((1 - product.price / product.original_price) * 100)}% OFF
                </span>
              </>
            )}
          </div>

          {product.colors && (
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium">Color</Label>
                <RadioGroup defaultValue={product.colors[0]} className="flex gap-2 mt-2">
                  {product.colors.map((color: string) => (
                    <Label
                      key={color}
                      htmlFor={color}
                      className="border cursor-pointer rounded-full p-2 [&:has(:checked)]:ring-2 [&:has(:checked)]:ring-primary"
                    >
                      <RadioGroupItem id={color} value={color} className="sr-only" />
                      <div className="h-6 w-6 rounded-full" style={{ backgroundColor: color }} />
                    </Label>
                  ))}
                </RadioGroup>
              </div>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-4">
            <Button className="flex-1" size="lg" onClick={addToWishlist}>
              ADD TO CART
            </Button>
            <Button variant="outline" className="flex-1" size="lg">
              Add to Compare
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
              <Button onClick={submitReview}>Submit Review</Button>
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

