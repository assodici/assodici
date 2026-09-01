"use client"

import { Map, MapMarker, MarkerContent } from "@/components/ui/map"
import { cn } from "@/lib/utils"

type AssociationMapProps = {
  latitude: number
  longitude: number
  className?: string
}

export function AssociationMap({ latitude, longitude, className }: AssociationMapProps) {
  return (
    <div className={cn("h-56 w-full overflow-hidden rounded-2xl", className)}>
      <Map center={[longitude, latitude]} zoom={15}>
        <MapMarker longitude={longitude} latitude={latitude}>
          <MarkerContent>
            <div className="size-4 rounded-full border-2 border-white bg-brand-blue shadow-lg" />
          </MarkerContent>
        </MapMarker>
      </Map>
    </div>
  )
}
