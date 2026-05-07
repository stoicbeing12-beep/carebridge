import * as React from "react"
import { cn } from "@/lib/utils"

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "secondary" | "outline" | "success"
}

function Badge({ className, variant = "default", ...props }: BadgeProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2",
        {
          "border-transparent bg-primary-600 text-white shadow hover:bg-primary-700": variant === "default",
          "border-transparent bg-slate-100 text-slate-900 hover:bg-slate-200": variant === "secondary",
          "border-transparent bg-accent-50 text-accent-600 hover:bg-accent-100": variant === "success",
          "text-slate-950 border-slate-200": variant === "outline",
        },
        className
      )}
      {...props}
    />
  )
}

export { Badge }
