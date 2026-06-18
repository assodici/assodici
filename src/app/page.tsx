import { createPublicClient } from '@/lib/supabase/server'

export default async function Home() {
  let lastRun: { imported_at: string; row_count: number } | null = null

  if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
    const supabase = createPublicClient()
    const { data } = await supabase
      .from('ingestion_runs')
      .select('imported_at, row_count')
      .eq('status', 'success')
      .order('imported_at', { ascending: false })
      .limit(1)
      .single()
    lastRun = data
  }

  const formattedDate = lastRun?.imported_at
    ? new Intl.DateTimeFormat('fr-FR', { dateStyle: 'long' }).format(
        new Date(lastRun.imported_at)
      )
    : null

  const formattedCount = lastRun?.row_count
    ? new Intl.NumberFormat('fr-FR').format(lastRun.row_count)
    : null

  return (
    <div className="page-container">
      <h1 className="text-3xl font-bold tracking-tight">Accueil</h1>
      {formattedDate && formattedCount && (
        <p className="text-sm text-muted-foreground mt-2">
          Données mises à jour le {formattedDate} · {formattedCount} associations
        </p>
      )}
    </div>
  )
}
