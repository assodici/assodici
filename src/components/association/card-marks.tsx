import { cn } from "@/lib/utils"
import { themeBandClass } from "@/lib/themes"

// The marks every association card carries: theme band, owner stamp, dissolved status.

export function ThemeBand({ themeCode, className }: { themeCode: string | null; className?: string }) {
  return <div aria-hidden className={cn("h-2.5", themeBandClass(themeCode), className)} />
}

export function OwnerStamp({ size = "sm", className }: { size?: "sm" | "lg"; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 -rotate-6 items-center justify-center rounded-full border-2 border-stamp text-center font-bold uppercase leading-tight tracking-wide text-stamp",
        size === "sm" ? "size-16 px-1.5 text-[0.5rem] tracking-normal" : "size-24 border-[3px] px-2 text-xs",
        className
      )}
    >
      Infos de l&apos;asso
    </span>
  )
}

export function DissolvedBadge({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border border-dashed border-current px-2 py-0.5 text-xs font-semibold",
        className
      )}
    >
      Dissoute
    </span>
  )
}
