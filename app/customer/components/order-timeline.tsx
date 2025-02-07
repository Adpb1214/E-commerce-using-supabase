import { Package, Truck, CheckCircle, Box, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface OrderTimelineProps {
  status: "pending" | "shipped" | "delivered" | "cancelled";
}

export function OrderTimeline({ status }: OrderTimelineProps) {
  const stages = [
    { icon: Box, label: "Order Placed", status: "completed" },
    {
      icon: Package,
      label: "Packaging",
      status: status === "pending" ? "pending" : status === "cancelled" ? "cancelled" : "completed",
    },
    {
      icon: Truck,
      label: "On The Road",
      status: status === "shipped" ? "in_progress" : status === "delivered" ? "completed" : status === "cancelled" ? "cancelled" : "pending",
    },
    {
      icon: status === "cancelled" ? XCircle : CheckCircle,
      label: status === "cancelled" ? "Cancelled" : "Delivered",
      status: status === "delivered" ? "completed" : status === "cancelled" ? "cancelled" : "pending",
    },
  ];

  return (
    <div className="relative">
      {/* Progress Line */}
      <div className="absolute top-5 left-0 w-full h-1 bg-muted">
        <div
          className={cn(
            "h-full transition-all duration-500",
            status === "cancelled" ? "bg-red-500" : "bg-primary"
          )}
          style={{
            width:
              status === "pending"
                ? "25%"
                : status === "shipped"
                ? "75%"
                : status === "delivered"
                ? "100%"
                : "100%", // Full width for cancelled status
          }}
        />
      </div>

      {/* Stages */}
      <div className="relative flex justify-between">
        {stages.map((stage, index) => (
          <div key={index} className="flex flex-col items-center">
            <div
              className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center mb-2",
                stage.status === "completed"
                  ? "bg-primary text-primary-foreground"
                  : stage.status === "in_progress"
                  ? "bg-orange-500 text-white"
                  : stage.status === "cancelled"
                  ? "bg-red-500 text-white"
                  : "bg-muted text-muted-foreground"
              )}
            >
              <stage.icon className="w-5 h-5" />
            </div>
            <span
              className={cn(
                "text-sm font-medium",
                stage.status === "cancelled" ? "text-red-500" : ""
              )}
            >
              {stage.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
