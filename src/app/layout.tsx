import type {Metadata} from "next"
import {JetBrains_Mono, Schibsted_Grotesk} from "next/font/google"
import "./globals.css"
import {cn} from "@/lib/utils"
import {siteUrl} from "@/lib/url"
import {AppShell} from "@/components/app-shell";
import { Analytics } from "@vercel/analytics/next"
import { SpeedInsights } from "@vercel/speed-insights/next"

const schibsted = Schibsted_Grotesk({variable: "--font-schibsted", subsets: ["latin"]})

// RNA and SIRET numbers and card years: the "card number" voice.
const jetbrains = JetBrains_Mono({variable: "--font-jetbrains", subsets: ["latin"], weight: ["500"]})

const description =
    "Recherchez parmi toutes les associations déclarées en France, près de chez vous. Données du Répertoire national des associations, complétées par les associations elles-mêmes."

export const metadata: Metadata = {
    metadataBase: new URL(siteUrl()),
    title: {default: "Asso d'ici · Toutes les associations près de chez vous", template: "%s · Asso d'ici"},
    description,
    openGraph: {type: "website", locale: "fr_FR", siteName: "Asso d'ici", description},
}

export default async function RootLayout({
                                             children,
                                         }: Readonly<{
    children: React.ReactNode
}>) {
    return (
        <html lang={"fr"} className={cn(schibsted.variable, jetbrains.variable)} suppressHydrationWarning>
        <body className="min-h-screen bg-background font-sans text-foreground antialiased">
        <Analytics/>
        <SpeedInsights/>
        <AppShell>{children}</AppShell>
        </body>
        </html>
    )
}
