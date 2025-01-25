"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

const ProductDetail = () => {
  const supabase = createClientComponentClient();
  const router = useRouter();
  const { id } = useParams(); // Product ID from the URL

  const [product, setProduct] = useState<any>(null);
  const [reviews, setReviews] = useState<any[]>([]);
  const [newReview, setNewReview] = useState({ rating: 0, review: "" });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
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
      .select("*")
      .eq("product_id", id);

    if (error) {
      setError("Error fetching reviews.");
      console.error("Error fetching reviews:", error.message);
    } else {
      setReviews(data);
    }
  };

  const addToWishlist = async () => {
    const { data: user, error: userError } = await supabase.auth.getUser();

    if (userError || !user?.user) {
      setError("You must log in to add items to your wishlist.");
      return;
    }

    // Check if the product is already in the wishlist
    const { data: existingWishlist, error: wishlistError } = await supabase
      .from("wishlist")
      .select("*")
      .eq("user_id", user.user.id)
      .eq("product_id", id);

    if (wishlistError) {
      setError("Error checking wishlist.");
      console.error("Error checking wishlist:", wishlistError.message);
      return;
    }

    if (existingWishlist?.length > 0) {
      setError("This product is already in your wishlist.");
      return;
    }

    // Add to wishlist
    const { error } = await supabase.from("wishlist").insert({
      user_id: user.user.id,
      product_id: id,
    });

    if (error) {
      setError("Error adding to wishlist.");
      console.error("Error adding to wishlist:", error.message);
    } else {
      alert("Product added to your wishlist!");
    }
  };

  const addToCart = async () => {
    const { data: user, error: userError } = await supabase.auth.getUser();

    if (userError || !user?.user) {
      setError("You must log in to add items to your cart.");
      return;
    }

    // Check if the product is already in the cart
    const { data: existingCart, error: cartError } = await supabase
      .from("cart")
      .select("*")
      .eq("user_id", user.user.id)
      .eq("product_id", id);

    if (cartError) {
      setError("Error checking cart.");
      console.error("Error checking cart:", cartError.message);
      return;
    }

    if (existingCart?.length > 0) {
      setError("This product is already in your cart.");
      return;
    }

    // Add to cart
    const { error } = await supabase.from("cart").insert({
      user_id: user.user.id,
      product_id: id,
      quantity: 1,
    });

    if (error) {
      setError("Error adding to cart.");
      console.error("Error adding to cart:", error.message);
    } else {
      alert("Product added to your cart!");
    }
  };

  const submitReview = async () => {
    const { data: user, error: userError } = await supabase.auth.getUser();

    if (userError || !user?.user) {
      setError("You must log in to leave a review.");
      return;
    }

    // Check if the user has already reviewed the product
    const { data: existingReview, error: reviewError } = await supabase
      .from("reviews")
      .select("*")
      .eq("user_id", user.user.id)
      .eq("product_id", id);

    if (reviewError) {
      setError("Error checking reviews.");
      console.error("Error checking reviews:", reviewError.message);
      return;
    }

    if (existingReview?.length > 0) {
      setError("You have already reviewed this product.");
      return;
    }

    // Add review
    const { error } = await supabase.from("reviews").insert({
      user_id: user.user.id,
      product_id: id,
      rating: newReview.rating,
      review: newReview.review,
    });

    if (error) {
      setError("Error submitting review.");
      console.error("Error submitting review:", error.message);
    } else {
      setNewReview({ rating: 0, review: "" });
      fetchReviews();
      alert("Review submitted successfully!");
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {error && <p className="text-red-500">{error}</p>}
      {product && (
        <div>
          <h1 className="text-2xl font-bold">{product.name}</h1>
          <p>{product.description}</p>
          <p>${product.price}</p>
          <button
            onClick={addToWishlist}
            className="bg-blue-500 text-white px-4 py-2 rounded"
          >
            Add to Wishlist
          </button>
          <button
            onClick={addToCart}
            className="bg-green-500 text-white px-4 py-2 rounded ml-2"
          >
            Add to Cart
          </button>
        </div>
      )}
      <div className="mt-8">
        <h2 className="text-xl font-bold">Reviews</h2>
        <ul>
          {reviews.map((review) => (
            <li key={review.id}>
              <p>
                <strong>{review.rating}/5</strong>: {review.review}
              </p>
            </li>
          ))}
        </ul>
        <div className="mt-4">
          <textarea
            placeholder="Leave your review..."
            value={newReview.review}
            onChange={(e) =>
              setNewReview({ ...newReview, review: e.target.value })
            }
            className="w-full p-2 border rounded"
          />
          <input
            type="number"
            min="1"
            max="5"
            value={newReview.rating}
            onChange={(e) =>
              setNewReview({ ...newReview, rating: Number(e.target.value) })
            }
            className="w-full p-2 border rounded mt-2"
          />
          <button
            onClick={submitReview}
            className="bg-blue-500 text-white px-4 py-2 rounded mt-2"
          >
            Submit Review
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;







// "use client"

// import * as React from "react"
// import Image from "next/image"
// import { useParams, useRouter } from "next/navigation"
// import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
// import { ChevronLeft, ChevronRight, Minus, Plus, Share2, Star } from "lucide-react"

// import { cn } from "@/lib/utils"
// import { Button } from "@/components/ui/button"
// import { Card } from "@/components/ui/card"
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
// import { Textarea } from "@/components/ui/textarea"
// import { Input } from "@/components/ui/input"
// import { Alert, AlertDescription } from "@/components/ui/alert"

// export default function ProductDetail() {
//   const supabase = createClientComponentClient()
//   const router = useRouter()
//   const { id } = useParams()

//   const [selectedImage, setSelectedImage] = React.useState(0)
//   const [quantity, setQuantity] = React.useState(1)
//   const [product, setProduct] = React.useState<any>(null)
//   const [reviews, setReviews] = React.useState<any[]>([])
//   const [newReview, setNewReview] = React.useState({ rating: 0, review: "" })
//   const [error, setError] = React.useState<string | null>(null)

//   const images = product?.images || ["/placeholder.svg"]
//   const averageRating = React.useMemo(() => {
//     if (!reviews.length) return 0
//     return reviews.reduce((acc, rev) => acc + rev.rating, 0) / reviews.length
//   }, [reviews])

//   React.useEffect(() => {
//     fetchProduct()
//     fetchReviews()
//   }, [])

//   const fetchProduct = async () => {
//     const { data, error } = await supabase.from("products").select("*").eq("id", id).single()

//     if (error || !data) {
//       setError("Product not found.")
//       console.error("Error fetching product:", error?.message)
//     } else {
//       setProduct(data)
//     }
//   }

//   const fetchReviews = async () => {
//     const { data, error } = await supabase.from("reviews").select("*").eq("product_id", id)

//     if (error) {
//       setError("Error fetching reviews.")
//       console.error("Error fetching reviews:", error.message)
//     } else {
//       setReviews(data)
//     }
//   }

//   const addToWishlist = async () => {
//     const { data: user, error: userError } = await supabase.auth.getUser()

//     if (userError || !user?.user) {
//       setError("You must log in to add items to your wishlist.")
//       return
//     }

//     const { data: existingWishlist, error: wishlistError } = await supabase
//       .from("wishlist")
//       .select("*")
//       .eq("user_id", user.user.id)
//       .eq("product_id", id)

//     if (wishlistError) {
//       setError("Error checking wishlist.")
//       console.error("Error checking wishlist:", wishlistError.message)
//       return
//     }

//     if (existingWishlist?.length > 0) {
//       setError("This product is already in your wishlist.")
//       return
//     }

//     const { error } = await supabase.from("wishlist").insert({
//       user_id: user.user.id,
//       product_id: id,
//     })

//     if (error) {
//       setError("Error adding to wishlist.")
//       console.error("Error adding to wishlist:", error.message)
//     } else {
//       alert("Product added to your wishlist!")
//     }
//   }

//   const addToCart = async () => {
//     const { data: user, error: userError } = await supabase.auth.getUser()

//     if (userError || !user?.user) {
//       setError("You must log in to add items to your cart.")
//       return
//     }

//     const { data: existingCart, error: cartError } = await supabase
//       .from("cart")
//       .select("*")
//       .eq("user_id", user.user.id)
//       .eq("product_id", id)

//     if (cartError) {
//       setError("Error checking cart.")
//       console.error("Error checking cart:", cartError.message)
//       return
//     }

//     if (existingCart?.length > 0) {
//       setError("This product is already in your cart.")
//       return
//     }

//     const { error } = await supabase.from("cart").insert({
//       user_id: user.user.id,
//       product_id: id,
//       quantity,
//     })

//     if (error) {
//       setError("Error adding to cart.")
//       console.error("Error adding to cart:", error.message)
//     } else {
//       alert("Product added to your cart!")
//     }
//   }

//   const submitReview = async () => {
//     const { data: user, error: userError } = await supabase.auth.getUser()

//     if (userError || !user?.user) {
//       setError("You must log in to leave a review.")
//       return
//     }

//     const { data: existingReview, error: reviewError } = await supabase
//       .from("reviews")
//       .select("*")
//       .eq("user_id", user.user.id)
//       .eq("product_id", id)

//     if (reviewError) {
//       setError("Error checking reviews.")
//       console.error("Error checking reviews:", reviewError.message)
//       return
//     }

//     if (existingReview?.length > 0) {
//       setError("You have already reviewed this product.")
//       return
//     }

//     const { error } = await supabase.from("reviews").insert({
//       user_id: user.user.id,
//       product_id: id,
//       rating: newReview.rating,
//       review: newReview.review,
//     })

//     if (error) {
//       setError("Error submitting review.")
//       console.error("Error submitting review:", error.message)
//     } else {
//       setNewReview({ rating: 0, review: "" })
//       fetchReviews()
//       alert("Review submitted successfully!")
//     }
//   }

//   if (!product) {
//     return <div className="container mx-auto px-4 py-6">Loading...</div>
//   }

//   return (
//     <div className="container mx-auto px-4 py-6">
//       {error && (
//         <Alert variant="destructive" className="mb-6">
//           <AlertDescription>{error}</AlertDescription>
//         </Alert>
//       )}

//       <div className="grid lg:grid-cols-2 gap-8">
//         {/* Image Gallery */}
//         <div className="space-y-4">
//           <div className="relative aspect-square overflow-hidden rounded-lg border bg-white">
//             <Image
//               src={images[selectedImage] || "/placeholder.svg"}
//               alt={product.name}
//               fill
//               className="object-contain"
//               priority
//             />
//           </div>
//           <div className="relative">
//             <div className="flex space-x-4 overflow-auto pb-2">
//               {images.map((img, idx) => (
//                 <button
//                   key={idx}
//                   onClick={() => setSelectedImage(idx)}
//                   className={cn(
//                     "relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-md border",
//                     selectedImage === idx && "ring-2 ring-primary",
//                   )}
//                 >
//                   <Image
//                     src={img || "/placeholder.svg"}
//                     alt={`${product.name} thumbnail ${idx + 1}`}
//                     fill
//                     className="object-cover"
//                   />
//                 </button>
//               ))}
//             </div>
//             <Button
//               variant="outline"
//               size="icon"
//               className="absolute left-0 top-1/2 -translate-y-1/2 bg-white"
//               onClick={() => setSelectedImage((prev) => Math.max(0, prev - 1))}
//             >
//               <ChevronLeft className="h-4 w-4" />
//             </Button>
//             <Button
//               variant="outline"
//               size="icon"
//               className="absolute right-0 top-1/2 -translate-y-1/2 bg-white"
//               onClick={() => setSelectedImage((prev) => Math.min(images.length - 1, prev + 1))}
//             >
//               <ChevronRight className="h-4 w-4" />
//             </Button>
//           </div>
//         </div>

//         {/* Product Info */}
//         <div className="space-y-6">
//           <div className="space-y-2">
//             <div className="flex items-center gap-2">
//               <div className="flex">
//                 {[...Array(5)].map((_, i) => (
//                   <Star
//                     key={i}
//                     className={cn(
//                       "h-4 w-4",
//                       i < averageRating ? "fill-primary text-primary" : "fill-muted text-muted-foreground",
//                     )}
//                   />
//                 ))}
//               </div>
//               <span className="text-sm text-muted-foreground">
//                 {averageRating.toFixed(1)} Star Rating ({reviews.length} Reviews)
//               </span>
//             </div>
//             <h1 className="text-2xl font-bold">{product.name}</h1>
//             <div className="flex items-center gap-4 text-sm text-muted-foreground">
//               <span>SKU: {product.sku}</span>
//               <span>Category: {product.category}</span>
//             </div>
//           </div>

//           <div className="flex items-baseline gap-4">
//             <span className="text-3xl font-bold">${product.price}</span>
//             {product.original_price && (
//               <>
//                 <span className="text-lg text-muted-foreground line-through">${product.original_price}</span>
//                 <span className="rounded-md bg-yellow-100 px-2 py-1 text-sm font-medium text-yellow-800">
//                   {Math.round((1 - product.price / product.original_price) * 100)}% OFF
//                 </span>
//               </>
//             )}
//           </div>

//           <p className="text-muted-foreground">{product.description}</p>

//           <div className="space-y-4">
//             <div className="space-y-2">
//               <label className="text-sm font-medium">Quantity</label>
//               <div className="flex items-center gap-2">
//                 <Button variant="outline" size="icon" onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}>
//                   <Minus className="h-4 w-4" />
//                 </Button>
//                 <span className="w-12 text-center">{quantity}</span>
//                 <Button variant="outline" size="icon" onClick={() => setQuantity((prev) => prev + 1)}>
//                   <Plus className="h-4 w-4" />
//                 </Button>
//               </div>
//             </div>
//           </div>

//           <div className="flex flex-col sm:flex-row gap-4">
//             <Button className="flex-1" size="lg" onClick={addToCart}>
//               Add to Cart
//             </Button>
//             <Button variant="secondary" className="flex-1" size="lg" onClick={addToWishlist}>
//               Add to Wishlist
//             </Button>
//           </div>

//           <Card className="p-4">
//             <p className="text-sm font-medium">100% Guarantee Safe Checkout</p>
//             <div className="mt-2 flex gap-2">
//               {["visa", "mastercard", "paypal", "amex", "discover"].map((card) => (
//                 <div key={card} className="h-8 w-12 rounded bg-muted" />
//               ))}
//             </div>
//           </Card>
//         </div>
//       </div>

//       {/* Reviews Section */}
//       <div className="mt-12">
//         <h2 className="text-2xl font-bold mb-6">Customer Reviews</h2>
//         <div className="grid gap-6 md:grid-cols-2">
//           <Card className="p-6">
//             <h3 className="text-lg font-semibold mb-4">Write a Review</h3>
//             <div className="space-y-4">
//               <div>
//                 <label className="text-sm font-medium">Rating</label>
//                 <Select
//                   value={String(newReview.rating)}
//                   onValueChange={(value) => setNewReview((prev) => ({ ...prev, rating: Number(value) }))}
//                 >
//                   <SelectTrigger>
//                     <SelectValue placeholder="Select rating" />
//                   </SelectTrigger>
//                   <SelectContent>
//                     {[1, 2, 3, 4, 5].map((rating) => (
//                       <SelectItem key={rating} value={String(rating)}>
//                         {rating} Star{rating !== 1 && "s"}
//                       </SelectItem>
//                     ))}
//                   </SelectContent>
//                 </Select>
//               </div>
//               <div>
//                 <label className="text-sm font-medium">Review</label>
//                 <Textarea
//                   placeholder="Write your review..."
//                   value={newReview.review}
//                   onChange={(e) => setNewReview((prev) => ({ ...prev, review: e.target.value }))}
//                   className="mt-1"
//                 />
//               </div>
//               <Button onClick={submitReview}>Submit Review</Button>
//             </div>
//           </Card>

//           <div className="space-y-4">
//             {reviews.map((review) => (
//               <Card key={review.id} className="p-4">
//                 <div className="flex gap-1 mb-2">
//                   {[...Array(5)].map((_, i) => (
//                     <Star
//                       key={i}
//                       className={cn(
//                         "h-4 w-4",
//                         i < review.rating ? "fill-primary text-primary" : "fill-muted text-muted-foreground",
//                       )}
//                     />
//                   ))}
//                 </div>
//                 <p className="text-sm text-muted-foreground">{review.review}</p>
//               </Card>
//             ))}
//           </div>
//         </div>
//       </div>
//     </div>
//   )
// }

