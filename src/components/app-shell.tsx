import React, { ReactNode, Suspense } from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"
import { Toaster } from "@/components/ui/sonner"
import { AppToast } from "@/components/app-toast"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { getUser } from "@/lib/supabase/server"

type ThemeProviderProps = React.ComponentProps<typeof NextThemesProvider>

function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}

async function AuthShell({ children }: { children: ReactNode }) {
  const user = await getUser()
  return (
    <>
      <SiteHeader user={user} />
      <main id="main-content" className="flex-1">{children}</main>
      <SiteFooter />
    </>
  )
}

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system">
      <div className="min-h-screen flex flex-col">
        <Suspense fallback={null}>
          <AuthShell>{children}</AuthShell>
        </Suspense>
      </div>
      <Suspense fallback={null}>
        <AppToast />
      </Suspense>
      <Toaster richColors position="top-right" duration={6000} />
    </ThemeProvider>
  )
}
