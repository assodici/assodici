import React, { ReactNode, Suspense } from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"
import { Toaster } from "@/components/ui/sonner"
import { AppToast } from "@/components/layout/app-toast"
import { SiteHeader } from "@/components/layout/site-header"
import { SiteFooter } from "@/components/layout/site-footer"
import { getUser, isSupabaseConfigured } from "@/lib/supabase/server"
import { ServiceStatusBanner } from "@/components/layout/service-status-banner"

type ThemeProviderProps = React.ComponentProps<typeof NextThemesProvider>

function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}

async function AuthShell({ children }: { children: ReactNode }) {
  const configured = isSupabaseConfigured()
  const user = configured ? await getUser() : null
  return (
    <>
      {!configured && <ServiceStatusBanner />}
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
