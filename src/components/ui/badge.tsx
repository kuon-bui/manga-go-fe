import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-3 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground shadow-sakura-sm hover:bg-primary/80",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground shadow-sakura-sm hover:bg-destructive/80",
        outline: "text-foreground",
        // Content status variants — pastel palette
        ongoing:
          "border-transparent bg-[hsl(160_55%_88%)] text-[hsl(160_50%_25%)] dark:bg-[hsl(160_40%_22%)] dark:text-[hsl(160_55%_80%)]",
        completed:
          "border-transparent bg-[hsl(220_70%_92%)] text-[hsl(220_60%_35%)] dark:bg-[hsl(220_40%_22%)] dark:text-[hsl(220_70%_80%)]",
        hiatus:
          "border-transparent bg-[hsl(40_90%_88%)] text-[hsl(30_70%_35%)] dark:bg-[hsl(30_50%_22%)] dark:text-[hsl(40_80%_75%)]",
        cancelled:
          "border-transparent bg-[hsl(0_78%_92%)] text-[hsl(0_60%_40%)] dark:bg-[hsl(0_50%_22%)] dark:text-[hsl(0_70%_78%)]",
        // Content type variants — pastel palette
        manga:
          "border-transparent bg-[hsl(340_80%_92%)] text-[hsl(340_60%_38%)] dark:bg-[hsl(340_50%_22%)] dark:text-[hsl(340_80%_82%)]",
        novel:
          "border-transparent bg-[hsl(280_65%_92%)] text-[hsl(280_50%_38%)] dark:bg-[hsl(280_40%_22%)] dark:text-[hsl(280_60%_80%)]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
