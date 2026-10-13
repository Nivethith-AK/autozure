import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-zinc-700 bg-white text-zinc-950 font-semibold shadow-sm",
        secondary:
          "border-zinc-800 bg-zinc-900 text-zinc-300",
        destructive:
          "border-zinc-700 bg-zinc-900 text-zinc-200",
        outline: "text-zinc-300 border-zinc-800",
        warning:
          "border-zinc-700 bg-zinc-800 text-zinc-300 font-mono",
        info:
          "border-zinc-700 bg-zinc-800 text-zinc-200",
        purple:
          "border-zinc-700 bg-zinc-900 text-zinc-100",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
