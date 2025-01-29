"use client"

import { useEffect, useState } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { motion } from "framer-motion"
import Link from "next/link"
import { Calendar, Package, ChevronRight, ShoppingBag } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

type Product = {
  title: string
  description: string
}

type OrderItem = {
  product_id: string
  quantity: number
  price: number
  products: Product[]
}

type Order = {
  id: string
  total_price: number
  created_at: string
  order_status: string
  order_items: OrderItem[]
}

const statusColors = {
  pending: "bg-yellow-500/10 text-yellow-500",
  processing: "bg-blue-500/10 text-blue-500",
  shipped: "bg-purple-500/10 text-purple-500",
  delivered: "bg-green-500/10 text-green-500",
  cancelled: "bg-red-500/10 text-red-500",
}

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
}

const item = {
  hidden: { y: 20, opacity: 0 },
  show: { y: 0, opacity: 1 },
}

export default function OrdersPage() {
  const supabase = createClientComponentClient()
  const [orders, setOrders] = useState<Order[]>([])
  const [error, setError] = useState<string>("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    const { data: user, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      console.error("User not authenticated:", userError)
      setError("You must log in to view your orders.")
      setLoading(false)
      return
    }

    const { data, error } = await supabase
      .from("orders")
      .select(`
        id,
        total_price,
        created_at,
        order_status,
        order_items:order_items (
          product_id,
          quantity,
          price,
          products:products (
            title,
            description
          )
        )
      `)
      .eq("user_id", user.user.id)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching orders:", error.message, error.details)
      setError("Failed to fetch orders. Please try again.")
    } else {
      setOrders(data as Order[] || [])
    }
    setLoading(false)
  }

  const formatDate = (date: string) => {
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(date))
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

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Your Orders</h1>
          <p className="text-muted-foreground mt-1">Track and manage your orders</p>
        </div>
        <Link href="/customer/products">
          <Button>
            <ShoppingBag className="w-4 h-4 mr-2" />
            Continue Shopping
          </Button>
        </Link>
      </div>

      {error && <div className="bg-destructive/10 text-destructive px-4 py-2 rounded-lg mb-6">{error}</div>}

      {orders.length === 0 && !error ? (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center py-12">
          <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">No orders yet</h2>
          <p className="text-muted-foreground mb-6">When you place an order, it will appear here</p>
          <Link href="/shop">
            <Button>Start Shopping</Button>
          </Link>
        </motion.div>
      ) : (
        <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
          {orders.map((order) => (
            <motion.div
              key={order.id}
              variants={item}
              className="group relative overflow-hidden border rounded-lg hover:shadow-lg transition-shadow"
            >
              <div className="p-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h2 className="text-xl font-semibold">Order #{order.id}</h2>
                      <Badge
                        variant="secondary"
                        className={statusColors[order.order_status.toLowerCase() as keyof typeof statusColors]}
                      >
                        {order.order_status}
                      </Badge>
                    </div>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Calendar className="w-4 h-4 mr-1" />
                      {formatDate(order.created_at)}
                    </div>
                  </div>
                  <div className="mt-4 sm:mt-0 text-right">
                    <div className="text-2xl font-bold text-primary">₹{order.total_price.toFixed(2)}</div>
                    <div className="text-sm text-muted-foreground">
                      {order.order_items.length} {order.order_items.length === 1 ? "item" : "items"}
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  {order.order_items.map((item) => (
                    <div
                      key={item.product_id}
                      className="flex items-center justify-between py-2 border-t first:border-t-0"
                    >
                      <div className="flex-1">
                        <h3 className="font-medium">{item.products[0]?.title}</h3>
                        <p className="text-sm text-muted-foreground line-clamp-1">{item.products[0]?.description}</p>
                      </div>
                      <div className="text-right ml-4">
                        <div className="font-medium">₹{(item.price * item.quantity).toFixed(2)}</div>
                        <div className="text-sm text-muted-foreground">Qty: {item.quantity}</div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 flex justify-end">
                  <Link href={`/customer/orders/${order.id}`}>
                    <Button
                      variant="outline"
                      className="group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
                    >
                      View Details
                      <ChevronRight className="w-4 h-4 ml-2" />
                    </Button>
                  </Link>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  )
}

