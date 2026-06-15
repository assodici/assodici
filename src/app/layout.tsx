import type {Metadata} from "next"
import {Geist_Mono, Noto_Sans} from "next/font/google"
import "./globals.css"
import {cn} from "@/lib/utils"
import {AppShell} from "@/components/app-shell";

const notoSans = Noto_Sans({variable: "--font-sans", subsets: ["latin"]})

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
})

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
        <html lang={"fr"} className={notoSans.variable} suppressHydrationWarning>
        <body
            className={cn(
                geistMono.variable,
                "min-h-screen bg-background font-sans text-foreground antialiased"
            )}
        >
        <AppShell>{children}</AppShell>
        </body>
        </html>
    )
}
