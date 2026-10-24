import Link from "next/link"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { buttonVariants } from "@/components/ui/button"
import { searchHref, type SearchParams } from "@/lib/schemas/search-params"
import { cn } from "@/lib/utils"

export function Pagination({ params, pageCount }: { params: SearchParams; pageCount: number }) {
  if (pageCount <= 1) return null
  const { page } = params
  const link = (target: number, label: string, icon: React.ReactNode, iconFirst: boolean) =>
    target >= 1 && target <= pageCount ? (
      <Link href={searchHref({ ...params, page: target })} className={cn(buttonVariants({ variant: "outline" }), "gap-1.5")} rel={iconFirst ? "prev" : "next"}>
        {iconFirst && icon}
        {label}
        {!iconFirst && icon}
      </Link>
    ) : (
      <span aria-hidden className="w-28" />
    )

  return (
    <nav aria-label="Pagination" className="flex items-center justify-between gap-4">
      {link(page - 1, "Précédent", <ChevronLeft aria-hidden className="size-4" />, true)}
      <p className="text-sm text-muted-foreground tabular-nums">
        Page {page} sur {pageCount}
      </p>
      {link(page + 1, "Suivant", <ChevronRight aria-hidden className="size-4" />, false)}
    </nav>
  )
}
