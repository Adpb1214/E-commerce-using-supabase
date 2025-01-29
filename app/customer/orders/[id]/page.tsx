"use client"

import { useEffect, useState, use } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"


import { Separator } from "@/components/ui/separator"
import { formatDate } from "@/lib/utils"
import { Order, OrderActivityLog } from "../../components/order-activity"
import { OrderTimeline } from "../../components/order-timeline"
import { Package } from "lucide-react"

export default function OrderPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClientComponentClient()

  useEffect(() => {
    const fetchOrder = async () => {
      const { data: orderData, error } = await supabase
        .from("orders")
        .select(`
          *,
          order_items (
            *,
            products (*)
          )
        `)
        .eq("id", resolvedParams.id)
        .single()

      if (error) {
        console.error("Error fetching order:", error)
      } else if (orderData) {
        const transformedOrder: Order = {
          id: orderData.id,
          products: orderData.order_items.map((item: any) => ({
            id: item.product_id,
            name: item.products.title,
            price: item.price,
            quantity: item.quantity,
            image_url: item.products.image_url
          })),
          total_price: orderData.total_price,
          original_price: orderData.original_price || orderData.total_price,
          discount: orderData.discount_amount || 0,
          order_date: orderData.created_at,
          expected_delivery: orderData.expected_delivery,
          status: orderData.order_status.toLowerCase(),
          activities: [
            {
              message: "Your order has been confirmed",
              timestamp: formatDate(orderData.created_at),
              status: "completed"
            },
            {
              message: "Order is being processed",
              timestamp: formatDate(new Date(orderData.created_at).getTime() + 3600000),
              status: "completed"
            },
            {
              message: orderData.order_status === "shipped" ? "Your order is on the way" : "Processing order",
              timestamp: formatDate(new Date(orderData.created_at).getTime() + 7200000),
              status: orderData.order_status === "shipped" ? "in_progress" : "pending"
            }
          ]
        }
        setOrder(transformedOrder)
      }
      setLoading(false)
    }

    fetchOrder()
  }, [resolvedParams.id, supabase])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin">
          <Package className="w-8 h-8 text-primary" />
        </div>
      </div>
    )
  }

  if (!order) {
    return <div className="text-center p-8">Order not found</div>
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Order Header */}
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-2xl font-semibold mb-2">Order #{order.id}</h1>
          <p className="text-sm text-muted-foreground">
            {order.products.length} Products • Order Placed on {formatDate(order.order_date)}
          </p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-primary">${order.total_price.toFixed(2)}</p>
          {order.discount > 0 && (
            <p className="text-sm text-muted-foreground line-through">
              ${order.original_price.toFixed(2)}
            </p>
          )}
        </div>
      </div>

      {/* Order Timeline */}
      <div className="mb-12">
        <OrderTimeline status={order.status} />
      </div>

      {/* Order Details */}
      <div className="bg-muted/50 rounded-lg p-6 mb-8">
        <h2 className="text-lg font-semibold mb-4">Order Details</h2>
        <div className="space-y-4">
          {order.products.map((product) => (
            <div key={product.id} className="flex items-center gap-4">
              <div className="w-20 h-20 relative rounded-lg overflow-hidden">
                <img
                  src={product.image_url || "/placeholder.svg"}
                  alt={product.name}
                  
                  className="object-cover"
                />
              </div>
              <div className="flex-1">
                <h3 className="font-medium">{product.name}</h3>
                <p className="text-sm text-muted-foreground">
                  Quantity: {product.quantity}
                </p>
              </div>
              <div className="text-right">
                <p className="font-medium">${(product.price * product.quantity).toFixed(2)}</p>
                <p className="text-sm text-muted-foreground">
                  ${product.price.toFixed(2)} each
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <Separator className="my-8" />

      {/* Order Activity */}
      <OrderActivityLog activities={order.activities} />
    </div>
  )
}

