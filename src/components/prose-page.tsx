import type { ReactNode } from "react"

// Reading layout shared by about and legal: title on the shell, long-form text below.
export function ProsePage({ title, intro, children }: { title: string; intro?: ReactNode; children: ReactNode }) {
  return (
    <>
      <section className="bg-shell text-shell-foreground">
        <div className="page-container py-12 sm:py-16">
          <h1 className="max-w-3xl text-4xl leading-tight font-extrabold tracking-[-0.03em] text-balance sm:text-5xl">
            {title}
          </h1>
          {intro && <p className="mt-4 max-w-2xl text-lg text-shell-muted text-pretty">{intro}</p>}
        </div>
      </section>
      <div className="page-container py-12">
        <div className="max-w-prose text-pretty [&_a]:font-semibold [&_a]:text-primary [&_a]:underline [&_h2]:mt-12 [&_h2]:mb-3 [&_h2]:text-2xl [&_h2]:font-extrabold [&_h2]:tracking-tight [&_h2:first-child]:mt-0 [&_h3]:mt-6 [&_h3]:mb-2 [&_h3]:font-bold [&_li]:mt-1.5 [&_p]:mt-3 [&_ul]:mt-3 [&_ul]:list-disc [&_ul]:pl-5">
          {children}
        </div>
      </div>
    </>
  )
}
