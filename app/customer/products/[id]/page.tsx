"use client";

import * as React from "react";

import { useParams } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Star, Share2 } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";

import { Label } from "@/components/ui/label";
import { toast } from "react-toastify";

type UserProfile = {
  id: string;
  name: string;
  phone_number: string;
  photo_url: string;
  zip_code: string;
  address: string;
  city: string;
  state: string;
  created_at: string;
};
type reviews = {
  id: string;
  rating: number;
  review: string;
  user_id: string;
  product_id: string;
  profiles: UserProfile;
  name: string;
};
type Product = {
  id: string;
  title: string;
  description: string;
  price: number;
  stock: number;
  category: string;
  image_url: string;
  sales_count: number;
};

export default function ProductDetail() {
  const supabase = createClientComponentClient();

  const { id } = useParams();

  const [product, setProduct] = React.useState<Product>();
  const [reviews, setReviews] = React.useState<reviews[]>([]);
  const [newReview, setNewReview] = React.useState({ rating: 0, review: "" });
  const [error, setError] = React.useState<string | null>(null);

  const cardImages = {
    visa: "https://upload.wikimedia.org/wikipedia/commons/4/41/Visa_Logo.png",
    mastercard:
      "https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg",
    amex: "https://upload.wikimedia.org/wikipedia/commons/3/30/American_Express_logo.svg",
    paytm:
      "https://logosmarken.com/wp-content/uploads/2020/11/Paytm-Logo.png",
  };

  const averageRating = React.useMemo(() => {
    if (!reviews.length) return 0;
    return reviews.reduce((acc, rev) => acc + rev.rating, 0) / reviews.length;
  }, [reviews]);

  React.useEffect(() => {
    fetchProduct();
    fetchReviews();
  }, []);

  const fetchProduct = async () => {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !data) {
      setError("Product not found.");
      console.error("Error fetching product:", error?.message);
    } else {
      setProduct(data);
    }
  };

  const fetchReviews = async () => {
    const { data, error } = await supabase
      .from("reviews")
      .select("*, profiles(name)")
      .eq("product_id", id);

    if (error) {
      setError("Error fetching reviews.");
      console.error("Error fetching reviews:", error.message);
    } else {
      setReviews(data || []);
    }
  };

  const submitReview = async () => {
    if (!newReview.rating || !newReview.review.trim()) {
      setError("Please provide both rating and review text");
      return;
    }

    const { data: user } = await supabase.auth.getUser();

    if (!user?.user) {
      setError("You must be logged in to submit a review");
      return;
    }

    // Check if user has already reviewed
    const existingReview = reviews.find((r) => r.user_id === user.user.id);

    if (existingReview) {
      // Update existing review
      const { error } = await supabase
        .from("reviews")
        .update({
          rating: newReview.rating,
          review: newReview.review,
        })
        .eq("id", existingReview.id);

      if (error) {
        setError("Error updating review");
        return;
      }
    } else {
      // Create new review
      const { error } = await supabase.from("reviews").insert({
        user_id: user.user.id,
        product_id: id,
        rating: newReview.rating,
        review: newReview.review,
      });

      if (error) {
        setError("Error submitting review");
        return;
      }
    }

    // Refresh reviews
    fetchReviews();
    setNewReview({ rating: 0, review: "" });
  };

  const addToWishlist = async () => {
    const { data: user } = await supabase.auth.getUser();

    if (!user?.user) {
      setError("You must be logged in to add items to your wishlist");
      return;
    }

    const { error } = await supabase.from("wishlist").insert({
      user_id: user.user.id,
      product_id: id,
    });

    if (error) {
      if (error.code === "23505") {
        // Unique constraint error
        setError("This item is already in your wishlist");
      } else {
        setError("Error adding to wishlist");
      }
    } else {
      alert("Added to wishlist!");
    }
  };

  if (!product) {
    return <div className="container mx-auto px-4 py-6">Loading...</div>;
  }

  const addToCart = async (productId: string) => {
    if (!productId) {
      setError("Invalid product.");
      return;
    }
  
    const { data: user, error: userError } = await supabase.auth.getUser();
  
    if (userError || !user?.user) {
      setError("You must log in to add items to your cart.");
      return;
    }
  
    // Check if product is already in the cart
    const { data: existingCart, error: cartError } = await supabase
      .from("cart")
      .select("id")
      .eq("user_id", user.user.id)
      .eq("product_id", productId)
      .single(); // Ensure we check for only one item
  
    if (cartError && cartError.code !== "PGRST116") { // Ignore "No Rows Found" error
      console.error("Error checking cart:", cartError.message);
      setError("Error checking cart.");
      return;
    }
  
    if (existingCart) {
      toast.warn("This product is already in your cart.");
      return;
    }
  
    // Add to cart
    const { error: insertError } = await supabase.from("cart").insert({
      user_id: user.user.id,
      product_id: productId,
      quantity: 1,
    });
  
    if (insertError) {
      console.error("Error adding product to cart:", insertError.message);
      setError("Error adding product to cart.");
    } else {
      toast.success("Product added to cart!");
    }
  };
  

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
                      i < averageRating
                        ? "fill-primary text-primary"
                        : "fill-muted text-muted-foreground"
                    )}
                  />
                ))}
              </div>
              <span className="text-sm text-muted-foreground">
                {averageRating.toFixed(1)} Star Rating ({reviews.length}{" "}
                Reviews)
              </span>
            </div>
            <h1 className="text-2xl font-bold">{product?.title}</h1>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span>Category: {product.category}</span>
            </div>
            <div className="text-sm text-green-600">
              Availability: {product?.stock ? "In Stock" : "Out of Stock"}
            </div>
          </div>

          <div className="flex items-baseline gap-4">
            <span className="text-3xl font-bold">${product.price}</span>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <Button className="flex-1" size="lg" onClick={addToWishlist}>
              ADD TO WISHLIST
            </Button>
            <Button onClick={() => addToCart(product.id)} variant="outline" className="flex-1" size="lg">
              Add to Cart
            </Button>
            <Button variant="outline" size="icon" className="shrink-0">
              <Share2 className="h-4 w-4" />
            </Button>
          </div>

          <Card className="p-4">
            <p className="text-sm font-medium">100% Guarantee Safe Checkout</p>
            <div className="mt-2 flex gap-2">
              {Object.entries(cardImages).map(([key, url]) => (
                <img
                  key={key}
                  src={url}
                  alt={`${key} logo`}
                  width={48}
                  height={32}
                  className="rounded bg-white shadow-sm"
                />
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
                    <button
                      key={rating}
                      onClick={() =>
                        setNewReview((prev) => ({ ...prev, rating }))
                      }
                      className="p-1"
                    >
                      <Star
                        className={cn(
                          "h-6 w-6",
                          rating <= newReview.rating
                            ? "fill-primary text-primary"
                            : "fill-muted text-muted-foreground"
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
                  onChange={(e) =>
                    setNewReview((prev) => ({
                      ...prev,
                      review: e.target.value,
                    }))
                  }
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
                          i < review.rating
                            ? "fill-primary text-primary"
                            : "fill-muted text-muted-foreground"
                        )}
                      />
                    ))}
                  </div>
                  <span className="text-sm font-medium">
                    {review.profiles?.name}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">{review.review}</p>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
