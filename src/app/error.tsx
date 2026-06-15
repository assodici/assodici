"use client"

import { ErrorDisplay } from "@/components/error-display"

type ErrorPageProps = {
  error: Error & { digest?: string }
  reset: () => void
}

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  return (
    <ErrorDisplay
      code={500}
      message={error.message || "Une erreur inattendue s'est produite."}
      onRetry={reset}
    />
  )
}
