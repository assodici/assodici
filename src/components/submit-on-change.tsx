"use client"

import type { ReactNode } from "react"

// Filters apply as soon as they change; without JS the form's submit button still works.
export function SubmitOnChange({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={className} onChange={(e) => (e.target as HTMLInputElement).form?.requestSubmit()}>
      {children}
    </div>
  )
}
