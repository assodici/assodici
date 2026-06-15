"use client"

import * as React from "react"
import { LuRefreshCw } from "react-icons/lu"
import { Button } from "@/components/ui/button"

type RetryButtonProps = {
  onClick?: () => void
  label?: string
  className?: string
  disabled?: boolean
}

export function RetryButton({ onClick, label, className, disabled }: RetryButtonProps) {
  const [spinning, setSpinning] = React.useState(false)

  const handleClick = () => {
    if (spinning) return
    setSpinning(true)
    onClick?.()
  }

  return (
    <Button
      variant="outline"
      size={label ? "default" : "icon"}
      onClick={handleClick}
      aria-label={label ?? "Réessayer"}
      disabled={disabled}
      className={className}
    >
      <LuRefreshCw
        className={`h-[1em] w-[1em] transition-transform ${spinning ? "animate-[spin_0.5s_linear_1]" : ""}`}
        onAnimationEnd={() => setSpinning(false)}
      />
      {label && <span>{label}</span>}
    </Button>
  )
}
