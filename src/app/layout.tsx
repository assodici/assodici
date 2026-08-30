import type {Metadata} from "next"
import {Bungee, Geist_Mono, Noto_Sans} from "next/font/google"
import "./globals.css"
import {cn} from "@/lib/utils"
import {AppShell} from "@/components/app-shell";
import { Analytics } from "@vercel/analytics/next"
import { SpeedInsights } from "@vercel/speed-insights/next"

const notoSans = Noto_Sans({variable: "--font-sans", subsets: ["latin"]})

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
})

// Brand display font (headlines, CTA labels) from the Figma design.
const bungee = Bungee({variable: "--font-bungee", weight: "400", subsets: ["latin"]})

export const metadata: Metadata = {
    title: "Assodici",
    description: "Mise en relation d'associations et particuliers",
}

export default async function RootLayout({
                                             children,
                                         }: Readonly<{
    children: React.ReactNode
}>) {
    return (
        <html lang={"fr"} className={cn(notoSans.variable, bungee.variable)} suppressHydrationWarning>
        <body
            className={cn(
                geistMono.variable,
                "min-h-screen bg-background font-sans text-foreground antialiased"
            )}
        >
        <Analytics/>
        <SpeedInsights/>
        <AppShell>{children}</AppShell>
        </body>
        </html>
    )
}
