import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-[var(--radius-md)] text-[length:var(--text-base)] font-semibold transition-all duration-200 ease-out disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:shadow-[var(--shadow-focus)] aria-invalid:shadow-[0_0_0_3px_var(--overlay-danger-10)] aria-invalid:border-destructive",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground hover:bg-[var(--color-primary-hover)] hover:shadow-[var(--shadow-primary-hover)]",
        destructive:
          "bg-destructive text-white hover:opacity-90 focus-visible:shadow-[0_0_0_3px_var(--overlay-danger-10)]",
        outline:
          "border border-border bg-transparent hover:bg-[var(--overlay-primary-05)] hover:text-[var(--color-text-strong)]",
        secondary:
          "bg-secondary text-secondary-foreground border border-border hover:bg-[var(--color-surface-border)]",
        ghost:
          "hover:bg-[var(--overlay-primary-05)] hover:text-[var(--color-text-strong)]",
        link: "text-primary underline-offset-4 hover:underline shadow-none hover:shadow-none",
        light:
          "bg-white text-[var(--color-text-on-light)] border border-[var(--color-light-chrome)] hover:bg-[var(--color-light-hover)] shadow-none hover:shadow-none",
      },
      size: {
        default: "h-9 px-4 py-2 has-[>svg]:px-3",
        xs: "h-6 gap-1 rounded-[var(--radius-sm)] px-2 text-[length:var(--text-sm)] has-[>svg]:px-1.5 [&_svg:not([class*='size-'])]:size-3",
        sm: "h-8 rounded-[var(--radius-sm)] gap-1.5 px-3 has-[>svg]:px-2.5",
        lg: "h-10 rounded-[var(--radius-sm)] px-6 has-[>svg]:px-4",
        icon: "size-9",
        "icon-xs": "size-6 rounded-[var(--radius-sm)] [&_svg:not([class*='size-'])]:size-3",
        "icon-sm": "size-8",
        "icon-lg": "size-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot : "button"

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
