import { Suspense } from "react"
import packageJson from "@root/package.json"
import { CurrentYear } from "@/components/current-year"

export function SiteFooter() {
    return (
        <footer className="w-full border-t bg-background/70">
            <div className="page-container py-4">
                <p className="text-xs sm:text-sm text-muted-foreground text-center whitespace-nowrap">
                    Made by Pierre Lapolla · v{packageJson.version} · © <Suspense fallback="2026"><CurrentYear /></Suspense> All rights reserved
                </p>
            </div>
        </footer>
    )
}
