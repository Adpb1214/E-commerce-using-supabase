"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Minus, Plus, X, ArrowLeft, ArrowRight, Package } from "lucide-react"
import { toast } from "react-hot-toast"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"

interface CartItem {
  id: string
  product_id: string
  quantity: number
  products: {
    id: string
    name: string
    title: string
    price: number
    image_url: string
  }
}

export default function CartPage() {
  const supabase = createClientComponentClient()
  const router = useRouter()
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(true)
  const [email, setEmail] = useState("")
  const [discount, setDiscount] = useState(0)

  useEffect(() => {
    fetchCartItems()
  }, [])

  const fetchCartItems = async () => {
    const { data: user } = await supabase.auth.getUser()
const userdata=user?.user
    if (!user) {
      setError("You must log in to access the cart.")
      setLoading(false)
      return
    }

    const { data, error } = await supabase.from("cart").select("*, products(*)").eq("user_id", userdata?.id)

    if (error) {
      setError("Error fetching cart items.")
    } else {
      setCartItems(data || [])
    }
    setLoading(false)
  }

  const updateQuantity = async (itemId: string, newQuantity: number) => {
    if (newQuantity < 1) return

    const { error } = await supabase.from("cart").update({ quantity: newQuantity }).eq("id", itemId)

    if (error) {
      toast.error("Failed to update quantity")
    } else {
      setCartItems((prev) => prev.map((item) => (item.id === itemId ? { ...item, quantity: newQuantity } : item)))
    }
  }

  const removeItem = async (itemId: string) => {
    const { error } = await supabase.from("cart").delete().eq("id", itemId)

    if (error) {
      toast.error("Failed to remove item")
    } else {
      setCartItems((prev) => prev.filter((item) => item.id !== itemId))
      toast.success("Item removed from cart")
    }
  }

  const applyCoupon = () => {
    if (!email) {
      toast.error("Please enter your email")
      return
    }
    setDiscount(30)
    toast.success("Hurrah! You have got 30% off on your purchase")
  }

  const handleOrderNow = async () => {
    const { data: user } = await supabase.auth.getUser()
const userdata=user?.user;
    if (!user) {
      setError("You must log in to place an order.")
      return
    }

    if (cartItems.length === 0) {
      setError("Your cart is empty.")
      return
    }

    try {
      const subtotal = cartItems.reduce((sum, item) => sum + item.quantity * item.products.price, 0)
      const discountAmount = (subtotal * discount) / 100
      const tax = (subtotal - discountAmount) * 0.1 // 10% tax
      const totalAmount = subtotal - discountAmount + tax

      // Create an order
      const { data: order, error: orderError } = await supabase
        .from("orders")
        .insert({
          user_id: userdata?.id,
          total_price: totalAmount,
          discount_amount: discountAmount,
          tax_amount: tax,
          order_status: "Pending",
        })
        .select()
        .single()

      if (orderError) throw orderError

      // Add items to order_items
      const orderItems = cartItems.map((item) => ({
        order_id: order.id,
        product_id: item.product_id,
        quantity: item.quantity,
        price: item.products.price,
      }))

      const { error: itemsError } = await supabase.from("order_items").insert(orderItems)

      if (itemsError) throw itemsError

      // Clear cart
      const { error: cartError } = await supabase
        .from("cart")
        .delete()
        .in(
          "id",
          cartItems.map((item) => item.id),
        )

      if (cartError) throw cartError

      toast.success("Order placed successfully!")
      router.push("/customer/checkout")
    }catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message); // Extract the error message
      } else {
        setError("An unknown error occurred");
      }
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin">
          <Package className="w-8 h-8 text-primary" />
        </div>
      </div>
    )
  }
  const subtotal = cartItems.reduce((sum, item) => sum + item.quantity * item.products.price, 0)
  const discountAmount = (subtotal * discount) / 100
  const tax = (subtotal - discountAmount) * 0.1 // 10% tax
  const total = subtotal - discountAmount + tax

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6">
      <h1 className="text-2xl font-semibold mb-6">Shopping Cart</h1>

      {error && <div className="text-red-500 mb-4">{error}</div>}

      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
          {cartItems.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">Your cart is empty.</p>
              <Link href="/shop">
                <Button>
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Continue Shopping
                </Button>
              </Link>
            </div>
          ) : (
            <div className="border rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[640px]">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="text-left p-4">PRODUCTS</th>
                      <th className="text-left p-4">PRICE</th>
                      <th className="text-left p-4">QUANTITY</th>
                      <th className="text-left p-4">SUB-TOTAL</th>
                      <th className="w-8"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {cartItems.map((item) => (
                      <tr key={item.id} className="border-t">
                        <td className="p-4">
                          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                            <div className="w-16 h-16 relative flex-shrink-0">
                              <img
                                src={item.products.image_url || "/placeholder.svg"}
                                alt={item.products.title}
                                className="object-contain w-full h-full"
                              />
                            </div>
                            <div className="font-medium">{item.products.title}</div>
                          </div>
                        </td>
                        <td className="p-4">${item.products.price.toFixed(2)}</td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-8 w-8 sm:h-10 sm:w-10"
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            >
                              <Minus className="w-4 h-4" />
                            </Button>
                            <span className="w-8 sm:w-12 text-center">{item.quantity}</span>
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-8 w-8 sm:h-10 sm:w-10"
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            >
                              <Plus className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                        <td className="p-4">${(item.quantity * item.products.price).toFixed(2)}</td>
                        <td className="p-4">
                          <Button variant="ghost" size="icon" onClick={() => removeItem(item.id)}>
                            <X className="w-4 h-4" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="p-4 flex justify-between items-center bg-muted/50">
                <Link href="/shop">
                  <Button variant="outline">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Return to Shop
                  </Button>
                </Link>
                <Button onClick={() => fetchCartItems()}>Update Cart</Button>
              </div>
            </div>
          )}
        </div>

        <div className="md:col-span-1">
          <div className="border rounded-lg p-4 sm:p-6">
            <h2 className="text-lg font-semibold mb-4">Cart Totals</h2>

            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Sub-total</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-muted-foreground">Shipping</span>
                <span className="text-green-600">Free</span>
              </div>

              {discount > 0 && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Discount ({discount}%)</span>
                  <span>-${discountAmount.toFixed(2)}</span>
                </div>
              )}

              <div className="flex justify-between">
                <span className="text-muted-foreground">Tax (10%)</span>
                <span>${tax.toFixed(2)}</span>
              </div>

              <Separator />

              <div className="flex justify-between text-lg font-semibold">
                <span>Total</span>
                <span>${total.toFixed(2)} USD</span>
              </div>

              <Button
                className="w-full bg-orange-500 hover:bg-orange-600 py-6 text-lg"
                onClick={handleOrderNow}
                disabled={cartItems.length === 0}
              >
                Proceed to Checkout
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>

              <div className="space-y-4 mt-8">
                <h3 className="font-medium text-lg">Coupon Code</h3>
                <Input
                  type="email"
                  placeholder="Email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full"
                />
                <Button variant="outline" className="w-full py-6 text-lg" onClick={applyCoupon}>
                  Apply Coupon
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

