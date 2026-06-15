import { getCommunesByPostalCode } from "@/lib/supabase/queries/communes"
import { notFound } from "next/navigation"

interface Props {
  params: Promise<{ codePostal: string }>
}

export default async function VillePage({ params }: Props) {
  const { codePostal } = await params

  const data = await getCommunesByPostalCode(codePostal)

  if (data.length === 0) notFound()

  const names = [...new Set(data.map((r) => r.nom_commune))]

  return (
    <div className="page-container">
      <p className="text-sm text-muted-foreground">{codePostal}</p>
      {names.map((name) => (
        <h1 key={name} className="text-3xl font-bold tracking-tight">
          {name}
        </h1>
      ))}
    </div>
  )
}
