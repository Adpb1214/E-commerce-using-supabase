import { motion } from "framer-motion"


export interface OrderProduct {
    id: string
    name: string
    price: number
    quantity: number
    image_url: string
  }
  
  export interface OrderActivity {
    message: string
    timestamp: string
    status: "completed" | "pending" | "in_progress"
  }
  
  export interface Order {
    id: string
    products: OrderProduct[]
    total_price: number
    original_price: number
    discount: number
    order_date: string
    expected_delivery: string
    status: "pending" | "shipped" | "delivered"
    activities: OrderActivity[]
  }


interface OrderActivityLogProps {
  activities: OrderActivity[]
}




export function OrderActivityLog({ activities }: OrderActivityLogProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Order Activity</h3>
      <div className="space-y-3">
        {activities.map((activity, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="flex items-start gap-4 text-sm"
          >
            <div className="w-2 h-2 mt-2 rounded-full bg-primary shrink-0" />
            <div>
              <p>{activity.message}</p>
              <p className="text-muted-foreground">{activity.timestamp}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

