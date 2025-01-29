"use client"

import { useSearchParams } from "next/navigation"
import { motion } from "framer-motion"
import { ArrowRight } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

const draw = {
  hidden: { pathLength: 0, opacity: 0 },
  visible: {
    pathLength: 1,
    opacity: 1,
    transition: {
      pathLength: { type: "spring", duration: 1.5, bounce: 0 },
      opacity: { duration: 0.01 },
    },
  },
}

export default function CheckoutSuccessPage() {
  const searchParams = useSearchParams()
  const productString = searchParams.get("product")
  const product = productString ? JSON.parse(productString) : null

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md mx-auto text-center space-y-6">
        {/* Animated Checkmark */}
        <div className="w-20 h-20 mx-auto mb-6">
          <motion.svg viewBox="0 0 50 50" className="w-full h-full" initial="hidden" animate="visible">
            {/* Circle */}
            <motion.circle
              cx="25"
              cy="25"
              r="22"
              stroke="currentColor"
              strokeWidth="2"
              fill="none"
              className="text-green-500"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{
                pathLength: 1,
                opacity: 1,
                transition: { duration: 0.5, delay: 0.2 },
              }}
            />
            {/* Checkmark */}
            <motion.path
              d="M15 25 L22 32 L35 18"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="text-green-500"
              variants={draw}
            />
          </motion.svg>
        </div>

        <h1 className="text-2xl font-semibold">Your order is successfully placed</h1>

        <p className="text-muted-foreground">
          Pellentesque sed lectus nec tortor tristique accumsan quis dictum risus. Donec volutpat mollis seda non
          facilisis.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
          <Link href="/customer">
            <Button variant="outline" className="w-full sm:w-auto">
              GO TO DASHBOARD
            </Button>
          </Link>
          <Link href="/customer/orders">
            <Button className="w-full sm:w-auto bg-orange-500 hover:bg-orange-600">
              VIEW ORDER
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}

