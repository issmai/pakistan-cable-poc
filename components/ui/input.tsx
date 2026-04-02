import * as React from "react"

import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "text-[length:var(--text-base)] selection:bg-[var(--overlay-primary-10)] selection:text-[var(--color-text-strong)]",
        "h-9 w-full min-w-0 rounded-[var(--radius-md)] border border-border bg-[var(--color-surface-raised)] px-3 py-1 text-[var(--color-text)]",
        "placeholder:text-[var(--color-placeholder)] transition-all duration-200 ease-out outline-none",
        "focus-visible:border-primary focus-visible:shadow-[var(--shadow-focus)]",
        "file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-[length:var(--text-base)] file:font-medium file:text-[var(--color-text)]",
        "disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
        "aria-invalid:border-destructive aria-invalid:shadow-[0_0_0_3px_var(--overlay-danger-10)]",
        className
      )}
      {...props}
    />
  )
}

export { Input }
