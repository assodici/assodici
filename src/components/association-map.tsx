import { cn } from "@/lib/utils"

type AssociationMapProps = {
  address: string
  title: string
  className?: string
}

export function AssociationMap({ address, title, className }: AssociationMapProps) {
  return (
    <iframe
      title={`Localisation de ${title} sur la carte`}
      src={`https://www.google.com/maps?q=${encodeURIComponent(address)}&output=embed`}
      loading="lazy"
      // Google's embed needs both flags to render tiles and read its own
      // storage; the trusted origin (Google, not user content) is why
      // that combo is acceptable here.
      sandbox="allow-scripts allow-same-origin allow-popups"
      className={cn("h-56 w-full rounded-2xl border-0", className)}
    />
  )
}
