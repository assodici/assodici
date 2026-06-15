import React, {ReactNode} from "react"
import {SiteHeader} from "@/components/site-header"
import {SiteFooter} from "@/components/site-footer"

import {ThemeProvider as NextThemesProvider} from "next-themes"

type ThemeProviderProps = React.ComponentProps<typeof NextThemesProvider>

function ThemeProvider({children, ...props}: ThemeProviderProps) {
    return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}

export function AppShell({children}: { children: ReactNode }) {
    return (
        <ThemeProvider
            attribute="class"
            defaultTheme="system"
        >
            <div className="min-h-screen flex flex-col">
                <SiteHeader/>
                <main id="main-content" className="flex-1">{children}</main>
                <SiteFooter/>
            </div>
        </ThemeProvider>
    )
}
