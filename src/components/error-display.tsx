"use client"

import Link from "next/link"
import { LuHouse } from "react-icons/lu"
import { RetryButton } from "@/components/buttons/retry-button"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type ErrorDisplayProps = {
  code: number | string
  message?: string
  onRetry?: () => void
}

export function ErrorDisplay({ code, message, onRetry }: ErrorDisplayProps) {
  const handleRetry = onRetry ?? (() => window.location.reload())

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 p-6 text-center">
      <p className="text-8xl font-bold tracking-tighter text-muted-foreground/30">{code}</p>
      {message && <p className="text-muted-foreground max-w-sm">{message}</p>}
      <div className="flex gap-3">
        <RetryButton onClick={handleRetry} label="Réessayer" />
        <Link href="/" className={cn(buttonVariants({ variant: "outline" }), "gap-1.5")}>
          <LuHouse className="h-[1em] w-[1em]" />
          Retour à l&apos;accueil
        </Link>
      </div>
    </div>
  )
}
