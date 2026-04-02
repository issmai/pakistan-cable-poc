import * as React from "react"

import { cn } from "@/lib/utils"

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "flex field-sizing-content min-h-16 w-full rounded-[var(--radius-xl)] border border-border bg-[var(--color-surface-raised)] px-3 py-2",
        "text-[length:var(--text-base)] text-[var(--color-text)] placeholder:text-[var(--color-placeholder)]",
        "transition-all duration-200 ease-out outline-none",
        "focus-visible:border-primary focus-visible:shadow-[var(--shadow-focus)]",
        "disabled:cursor-not-allowed disabled:opacity-50",
        "aria-invalid:border-destructive aria-invalid:shadow-[0_0_0_3px_var(--overlay-danger-10)]",
        className
      )}
      {...props}
    />
  )
}

export { Textarea }
