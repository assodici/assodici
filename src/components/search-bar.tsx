"use client"

import { useState, type FormEvent } from "react"
import { useRouter } from "next/navigation"
import { Search } from "lucide-react"
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group"

type SearchBarProps = {
  initialQuery?: string
}

export function SearchBar({ initialQuery = "" }: SearchBarProps) {
  const router = useRouter()
  const [query, setQuery] = useState(initialQuery)

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    const trimmed = query.trim()
    if (trimmed.length >= 2) router.push(`/recherche?q=${encodeURIComponent(trimmed)}`)
  }

  return (
    <form role="search" onSubmit={handleSubmit} className="contents">
      <InputGroup className="h-14 w-full max-w-3xl rounded-full border-transparent bg-white px-2 text-base shadow-sm">
        <InputGroupAddon align="inline-start">
          <Search className="h-4 w-4" />
        </InputGroupAddon>
        <InputGroupInput
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Recherchez une association, une ville, un centre d'intérêt..."
        />
      </InputGroup>
    </form>
  )
}
